import mongoose, { Schema } from "mongoose";
import {
  FlavorCollection,
  IceCreamSize,
  ProductDish,
} from "../libs/enums/product.enum";

const CustomBuildSchema = new Schema(
  {
    signature: { type: String, required: true, unique: true, index: true },
    flavorCollection: { type: String, enum: FlavorCollection, required: true },
    size: { type: String, enum: IceCreamSize, required: true },
    dishType: { type: String, enum: ProductDish, required: true },
    flavorIds: [{ type: Schema.Types.ObjectId, ref: "Flavor", required: true }],
    unitPrice: { type: Schema.Types.Decimal128, required: true },
    displayName: { type: String, required: true },
    image: { type: String, required: true },
    pricingVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);
export default mongoose.model("CustomBuild", CustomBuildSchema);
