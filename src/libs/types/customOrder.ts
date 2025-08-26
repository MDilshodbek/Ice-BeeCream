import { FlavorCollection, IceCreamSize, ProductDish } from "../enums/product.enum";
import { ObjectId } from "mongoose";


export interface CustomBuildRequest {
  flavorCollection?: FlavorCollection; 
  size?: IceCreamSize;                 
  dishType?: ProductDish;            
  flavorIds?: ObjectId[];        
}

export interface CustomBuildResponse {
  _id: ObjectId;   
  unitPrice: number;
  displayName: string;
  image: string;
  signature: string;
}