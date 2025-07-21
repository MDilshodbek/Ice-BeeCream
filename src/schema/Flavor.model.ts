import mongoose, { Schema } from "mongoose";
import { FlavorStatus, FlavorType } from "../libs/enums/product.enum";

const flavorSchema = new Schema(
  {
    flavorName: { type: String, required: true },
    flavorType: {
      type: String,
      enum: FlavorType,
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

    flavorStatus: {
      type: String,
      enum: FlavorStatus,
      default: FlavorStatus.AVAILABLE,
    },
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export default mongoose.model("Flavor", flavorSchema);
