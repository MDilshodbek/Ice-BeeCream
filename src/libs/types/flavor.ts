import { ObjectId } from "mongoose";

import { FlavorStatus, FlavorCollection } from "../enums/product.enum";

export interface Flavor {
  _id: ObjectId;
  flavorStatus: FlavorStatus;
  flavorCollection: FlavorCollection;
  flavorName: string;
  flavorPrice: number;
  flavorImage: string;
  flavorLikes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlavorInput {
  flavorStatus: FlavorStatus;
  flavorCollection: FlavorCollection;
  flavorName: string;
  flavorPrice: number;
  flavorImage?: string;
  flavorLikes?: number;
}

export interface FlavorUpdateInput {
  _id: ObjectId;
  flavorStatus?: FlavorStatus;
  flavorCollection?: FlavorCollection;
  flavorName?: string;
   flavorPrice?: number;
  flavorImage?: string;
  flavorLikes?: number;
}

export interface FlavorInquiry {
  page: number;
  limit: number;
  flavorCollection?: FlavorCollection;
  search?: string;
}
