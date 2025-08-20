import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import {
  CustomOrderItemInput,
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import MemberService from "./Member.service";
import customeOrderItemModel from "../schema/customeOrderItem.model";
import FlavorModel from "../schema/Flavor.model";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly customeOrderItem
  private readonly flavorModel

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.customeOrderItem = customeOrderItemModel;
    this.flavorModel = FlavorModel
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const amount = input.reduce((acc: number, item: OrderItemInput) => {
      return acc + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 50 ? 5 : 0;
    console.log("values:", amount, delivery);

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      console.log("orderId", newOrder._id);
      await this.recordOrderItem(orderId, input);
      console.log(newOrder);

      return newOrder;
    } catch (err) {
      console.log("error, model: createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "OK";
    });

    console.log("promisedList:", promisedList);
    const orderItemsState = await Promise.all(promisedList);

    console.log("orderItemsState:", orderItemsState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(input.orderId),
      orderStatus = input.orderStatus;

    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId: memberId,
          _id: orderId,
        },
        {
          orderStatus: orderStatus,
        },
        { new: true }
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    // orderStatus pause => process + 1
    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.addUserPoint(member, 1);
    }

    return result;
  }

    public async createCustomOrder(member: Member, input: CustomOrderItemInput[]): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    // Calculate amount dynamically
    let amount = 0;

    for (const item of input) {
      // Base price comes from request body (product base price)
      let itemTotal = item.itemPrice;

      // Add flavor prices
      if (item.flavors && item.flavors.length > 0) {
        const flavors = await this.flavorModel.find({ _id: { $in: item.flavors } });
        const flavorTotal = flavors.reduce((sum, f) => sum + f.flavorPrice, 0);
        itemTotal += flavorTotal;
      }

      // Multiply by quantity
      amount += itemTotal * item.itemQuantity;
    }

    const delivery = amount < 50 ? 5 : 0;

    try {
      const newOrder = await OrderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId,
      });

      const orderId = newOrder._id;
      await this.recordCustomOrderItem(orderId, input);

      return newOrder;
    } catch (err) {
      console.log("error, model: createCustomOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordCustomOrderItem(orderId: ObjectId, input: CustomOrderItemInput[]): Promise<void> {
    const promisedList = input.map(async (item) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.customeOrderItem.create(item);
      return "OK";
    });

    await Promise.all(promisedList);
  }
}

export default OrderService;
