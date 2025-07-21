import { ObjectId } from "mongoose";

import { FlavorStatus, FlavorType } from "../enums/product.enum";

export interface Flavor {
  _id: ObjectId;
  flavorStatus: FlavorStatus;
  flavorType: FlavorType;
  flavorName: string;
  flavorImage: string;
  flavorLikes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlavorInput {
  flavorStatus: FlavorStatus;
  flavorType: FlavorType;
  flavorName: string;
  flavorImage?: string;
  flavorLikes?: number;
}

export interface FlavorUpdateInput {
  _id: ObjectId;
  flavorStatus?: FlavorStatus;
  flavorType?: FlavorType;
  flavorName?: string;
  flavorImage?: string;
  flavorLikes?: number;
}
