import mongoose, { Schema } from "mongoose";
import {
  IceCreamSize,
  ProductDish,
} from "../libs/enums/product.enum";

const orderItemSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },

    itemQuantity: {
      type: Number,
      required: true,
    },

    itemPrice: {
      type: Number,
      required: true,
    },

    // For customizeable orders

    iceCreamSize: {
      type: String,
      enum: IceCreamSize,
    },

    productDish: {
      type: String,
      enum: ProductDish,
    },

    flavors: [{ type: Schema.Types.ObjectId, ref: "Flavor" }],
  },
  { timestamps: true, collection: "orderItems" }
);

export default mongoose.model("OrderItem", orderItemSchema);
