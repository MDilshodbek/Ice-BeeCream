import mongoose, { Schema } from "mongoose";
import { GelatoSize, ProductDish } from "../libs/enums/product.enum";

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
    gelatoSize: {
      type: String,
      enum: GelatoSize,
    },

    productDish: {
      type: String,
      enum: ProductDish,
    },

    flavors: [{ type: String }],
  },
  { timestamps: true, collection: "orderItems" }
);

export default mongoose.model("OrderItem", orderItemSchema);
