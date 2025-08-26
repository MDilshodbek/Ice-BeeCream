import mongoose, { Schema } from "mongoose";
import {
  CakeSize,
  ProductDish,
  ProductCollection,
  ProductSize,
  ProductStatus,
  IceCreamSize,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productDish: {
      type: String,
      enum: ProductDish,
      default: ProductDish.CUP,
    },

    productSize: {
      type: String,
      enum: ProductSize,
      default: ProductSize.REGULAR,
    },

    iceCreamSize: {
      type: String,
      enum: IceCreamSize,
      default: IceCreamSize.TWO,
    },

    cakeSize: {
      type: String,
      enum: CakeSize,
      default: CakeSize.SHORT,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index(
  {
    productName: 1,
    productSize: 1,
    iceCreamSize: 1,
    cakeSize: 1,
    gelatoSize: 1,
    productDish: 1,
  },
  { unique: true }
);

export default mongoose.model("Product", productSchema);
