// services/Order.service.ts
import crypto from "crypto";
import { Types, ObjectId } from "mongoose";

import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import customOrderModel from "../schema/customOrder.model";
import FlavorModel from "../schema/Flavor.model";

import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import {
  CustomBuildRequest,
  CustomBuildResponse,
} from "../libs/types/customOrder";

import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/errors";
import { OrderStatus } from "../libs/enums/order.enum";
import {
  FlavorStatus,
  IceCreamSize,
  ProductDish,
} from "../libs/enums/product.enum";

/** ===== Business rules & helpers ===== */
const SIZE_SLOTS: Record<IceCreamSize, number> = {
  [IceCreamSize.TWO]: 2,
  [IceCreamSize.THREE]: 3,
  [IceCreamSize.FIVE]: 5,
};

const BASE_BY_SIZE: Record<IceCreamSize, number> = {
  [IceCreamSize.TWO]: 6.0,
  [IceCreamSize.THREE]: 8.5,
  [IceCreamSize.FIVE]: 12.5,
};

const DISH_UPCHARGE: Record<ProductDish, number> = {
  [ProductDish.CUP]: 0.0,
  [ProductDish.COOKIE]: 0.7,
};

const PRICING_VERSION = 1;

const money = (n: number) => Math.round(n * 100) / 100;
/** ==================================== */

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly customeOrderModel;
  private readonly flavorModel;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.customeOrderModel = customOrderModel;
    this.flavorModel = FlavorModel;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MemberService = require("./Member.service").default;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const amount = input.reduce(
      (acc: number, item: OrderItemInput) =>
        acc + item.itemPrice * item.itemQuantity,
      0
    );
    const delivery = amount < 50 ? 5 : 0;
    const discount = amount > 20 ? amount * 0.1 : 0;
    const grandTotal = amount + delivery - discount;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderGrandTotal: grandTotal,
        orderSubTotal: amount,
        orderDiscount: Number(discount.toFixed(1)),
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, input);
      return newOrder;
    } catch (err) {
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

  // Order.service.ts
  // Order.service.ts
  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches = { memberId, orderStatus: inquiry.orderStatus };

    const customColl = this.customeOrderModel.collection.name; // e.g. "customorders"

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
        {
          $lookup: {
            from: customColl,
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "customData",
          },
        },
        // Make customs look exactly like products for the UI
        {
          $addFields: {
            productData: {
              $concatArrays: [
                "$productData",
                {
                  $map: {
                    input: "$customData",
                    as: "c",
                    in: {
                      _id: "$$c._id",
                      productName: "$$c.displayName",
                      // IMPORTANT: array of strings, not objects
                      productImages: ["$$c.image"],
                      // Keep fields the UI reads below
                      productDish: "$$c.dishType",
                      productSize: "$$c.size",
                      productCollection: "$$c.flavorCollection",
                      isCustom: true,
                    },
                  },
                },
              ],
            },
          },
        },
        { $project: { customData: 0 } },
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

  /** ---------- Custom build (SKU) ---------- */

  private buildSignature(
    input: { flavorCollection: string; size: string; dishType: string },
    sortedIdsCsv: string
  ): string {
    return crypto
      .createHash("sha1")
      .update(
        `v${PRICING_VERSION}|${input.flavorCollection}|${input.size}|${input.dishType}|${sortedIdsCsv}`
      )
      .digest("hex");
  }

  public async buildCustom(
    input: CustomBuildRequest
  ): Promise<CustomBuildResponse> {
    // Narrow undefined optionals for safe indexing
    const { flavorCollection, size, dishType, flavorIds } = input;
    if (!flavorCollection || !size || !dishType || !Array.isArray(flavorIds)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CHOOSE_FLAVOR);
    }

    // normalize ids: unique + sort
    const uniqueSortedIds = [...new Set(flavorIds)].sort();
    const required = SIZE_SLOTS[size as IceCreamSize];
    if (!required || uniqueSortedIds.length !== required) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CHOOSE_FLAVOR);
    }

    // validate flavors
    const flavorObjectIds = uniqueSortedIds.map((id) =>
      shapeIntoMongooseObjectId(id)
    );
    const flavors = await this.flavorModel
      .find({
        _id: { $in: flavorObjectIds },
        flavorStatus: FlavorStatus.AVAILABLE,
      })
      .lean();

    if (flavors.length !== uniqueSortedIds.length) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CHOOSE_FLAVOR);
    }
    if (!flavors.every((f) => f.flavorCollection === flavorCollection)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CHOOSE_FLAVOR);
    }

    // signature
    const signature = this.buildSignature(
      { flavorCollection, size, dishType },
      uniqueSortedIds.join(",")
    );

    // reuse if exists
    const existing = await this.customeOrderModel.findOne({ signature }).lean();
    if (existing) return this.toResponse(existing);

    // compute price
    const unitPrice = money(
      BASE_BY_SIZE[size as IceCreamSize] +
        DISH_UPCHARGE[dishType as ProductDish]
    );

    // name + image
    const primary = flavors[0];
    const displayName = `${size} ${flavorCollection} in ${dishType}${
      primary ? " - " + primary.flavorName : ""
    }`;
    const image = primary?.flavorImage || "img/default.png";

    // insert with race handling
    try {
      const created = await this.customeOrderModel.create({
        signature,
        flavorCollection,
        size,
        dishType,
        flavorIds: flavorObjectIds,
        unitPrice,
        displayName,
        image,
        pricingVersion: PRICING_VERSION,
      });
      return this.toResponse(created.toObject());
    } catch (err: any) {
      if (err?.code === 11000) {
        const doc = await this.customeOrderModel.findOne({ signature }).lean();
        if (doc) return this.toResponse(doc);
      }
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private toResponse(doc: any): CustomBuildResponse {
    const priceNum =
      typeof doc.unitPrice === "number"
        ? doc.unitPrice
        : parseFloat(doc.unitPrice?.toString?.() ?? "0");

    return {
      _id: doc._id,
      unitPrice: priceNum,
      displayName: doc.displayName,
      image: doc.image,
      signature: doc.signature,
    };
  }
}

export default OrderService;
