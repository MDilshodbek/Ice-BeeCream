// models/customOrderItem.model.ts
import mongoose, { Schema } from "mongoose";
import { GelatoSize, IceCreamSize, ProductDish } from "../libs/enums/product.enum";

const customOrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    itemQuantity: { type: Number, required: true },
    itemPrice: { type: Number, required: true },
    gelatoSize: { type: String, enum: GelatoSize },
    iceCreamSize: { type: String, enum: IceCreamSize },
    productDish: { type: String, enum: ProductDish },
    flavors: [{ type: Schema.Types.ObjectId, ref: "Flavor" }],
  },
  { timestamps: true, collection: "customOrderItems" }
);

export default mongoose.model("CustomOrderItem", customOrderItemSchema);
