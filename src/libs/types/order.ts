import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;
}

export interface Order {
  _id: ObjectId;
  orderSubTotal: number;
  orderGrandTotal: number;
  orderDiscount: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  //   From aggregations
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId?: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}

export interface CustomOrderItemInput {
  itemQuantity: number;
  itemPrice: number; // base product price
  productId: ObjectId;
  gelatoSize?: string;
  iceCreamSize?: string;
  productDish?: string;
  flavors?: ObjectId[];
  orderId?: ObjectId;
}
