import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/errors";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import { Flavor, FlavorInput, FlavorUpdateInput } from "../libs/types/flavor";
import FlavorModel from "../schema/Flavor.model";

class ProductService {
  private readonly productModel;
  private readonly flavorModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.flavorModel = FlavorModel;
    this.viewService = new ViewService();
  }

  // BSSR

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (error) {
      console.error("Error, model: createNewProduct:", error);

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChoosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    //   string ===> ObjectId
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    console.log("result:", result);
    return result;
  }

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewFlavor(input: FlavorInput): Promise<Flavor> {
    try {
      return await this.flavorModel.create(input);
    } catch (error) {
      console.error("Error, model: createNewFlavor:", error);

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChoosenFlavor(
    id: string,
    input: FlavorUpdateInput
  ): Promise<Flavor> {
    //   string ===> ObjectId
    id = shapeIntoMongooseObjectId(id);
    const result = await this.flavorModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    console.log("result:", result);
    return result;
  }

  public async getAllFlavors(): Promise<Flavor[]> {
    const result = await this.flavorModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  // SPA

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    console.log("inquiry:", inquiry);
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;

    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    // ToDo if auth user
    if (memberId) {
      // check view exist
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        likeGroup: LikeGroup.PRODUCT,
      };
      console.log("input viewGroup:", input);

      const existView = await this.viewService.checkViewExistence(input);

      console.log("exist:", !!existView);

      if (!existView) {
        // insert view
        console.log("Planning to insert new view");
        await this.viewService.insertMemberView(input);

        // increase view counts
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            {
              $inc: { productViews: +1 },
            },
            { new: true }
          )
          .exec();
      }
    }

    return result;
  }
}

export default ProductService;
