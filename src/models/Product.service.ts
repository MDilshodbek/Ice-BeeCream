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
import { FlavorStatus, ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import { LikeInput, StatisticModifier } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import {
  Flavor,
  FlavorInput,
  FlavorInquiry,
  FlavorUpdateInput,
} from "../libs/types/flavor";
import FlavorModel from "../schema/Flavor.model";
import LikeService from "./Like.service";

class ProductService {
  private readonly productModel;
  private readonly flavorModel;
  public likeService;

  constructor() {
    this.productModel = ProductModel;
    this.flavorModel = FlavorModel;
    this.likeService = new LikeService();
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
  ): Promise<Product & { isLiked?: boolean }> {
    const productId = shapeIntoMongooseObjectId(id);

    const result = await this.productModel
      .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
      .lean() // ✅ returns plain JS object
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    let isLiked = false;

    if (memberId) {
      const input: LikeInput = {
        memberId: memberId,
        likeRefId: productId,
        likeGroup: LikeGroup.PRODUCT,
      };

      const existLike = await this.likeService.checkLikeExistence(input);
      isLiked = !!existLike;
    }

    // ✅ Just add `isLiked` to the plain object
    return { ...result, isLiked };
  }

  public async likeTargetProduct(
    memberId: ObjectId,
    likeRefId: ObjectId
  ): Promise<{ isLiked: boolean; productLikes: number }> {
    const target: Product = await this.productModel
      .findOne({ _id: likeRefId, productStatus: ProductStatus.PROCESS })
      .exec();

    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };

    // ✅ Toggle like
    const modifier: number = await this.likeService.toggleLike(input);

    // ✅ Update like count
    const updatedProduct = await this.propertyStatsEditor({
      _id: likeRefId,
      targetKey: "productLikes",
      modifier: modifier,
    });

    if (!updatedProduct) {
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }

    return {
      isLiked: modifier === 1,
      productLikes: updatedProduct.productLikes,
    };
  }

  public async propertyStatsEditor(input: StatisticModifier): Promise<Product> {
    const { _id, targetKey, modifier } = input;
    return await this.productModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        {
          new: true,
        }
      )
      .exec();
  }

  public async getFlavors(inquiry: FlavorInquiry): Promise<Flavor[]> {
    console.log("inquiry:", inquiry);
    const match: T = { flavorStatus: FlavorStatus.AVAILABLE };

    if (inquiry.flavorCollection)
      match.flavorCollection = inquiry.flavorCollection;

    if (inquiry.search) {
      match.flavorName = { $regex: new RegExp(inquiry.search, "i") };
    }

    console.log("match:", match);
    const result = await this.flavorModel
      .aggregate([
        { $match: match },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();
    console.log("result:", result);

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
}

export default ProductService;
