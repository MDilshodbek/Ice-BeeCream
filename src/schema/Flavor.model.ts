import mongoose, { Schema } from "mongoose";
import { FlavorStatus, FlavorCollection } from "../libs/enums/product.enum";

const flavorSchema = new Schema(
  {
    flavorStatus: {
      type: String,
      enum: FlavorStatus,
      default: FlavorStatus.AVAILABLE,
    },
    flavorName: { type: String, required: true },
    flavorPrice: {
      type: Number,
      required: true,
    },
    flavorCollection: {
      type: String,
      enum: FlavorCollection,
      required: true,
    },
    flavorImage: {
      type: String,
      default: null,
    },
    flavorLikes: {
      type: Number,
      default: 0,
    },
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Flavor", flavorSchema);
