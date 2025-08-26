import { ObjectId } from "mongoose";

import {
  CakeSize,
  ProductCollection,
  ProductDish,
  ProductSize,
  ProductStatus,
} from "../enums/product.enum";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  cakeSize: CakeSize;
  productDish: ProductDish;
  productDesc?: string;
  productImages: string[];
  productLikes: number;
  createdAt: Date;
  updatedAt: Date;
  //   From aggregations
  meLiked: boolean;
}

export interface ProductInquiry {
  page: number;
  limit: number;
  order: string;
  productCollection?: ProductCollection;
  search?: string;
  // Add new filter parameters
  productSize?: ProductSize;
  cakeSize?: CakeSize;
  productDish?: ProductDish;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productDish?: ProductDish;
  cakeSize?: CakeSize;
  productDesc?: string;
  productImages?: string[];
  productLikes?: number;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  cakeSize?: CakeSize;
  productDish?: ProductDish;
  productDesc?: string;
  productImages?: string[];
  productLikes?: number;
}
