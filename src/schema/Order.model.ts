import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";

const orderSchema = new Schema(
  {
    orderSubTotal: { type: Number, required: true },
    orderGrandTotal: { type: Number, required: true },
    orderDiscount: { type: Number, required: true },
    orderDelivery: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PAUSE,
    },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: "Member" },
  },
  { timestamps: true, collection: "orders" }
);

export default mongoose.model("Order", orderSchema);
