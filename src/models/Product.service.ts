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
import { lookupAuthMemberLiked } from "../libs/config";

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

    return result;
  }

  public async getAllFlavors(): Promise<Flavor[]> {
    const result = await this.flavorModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  // SPA

  public async getProducts(
    memberId: ObjectId | null,
    inquiry: ProductInquiry
  ): Promise<Product[]> {
    const match: any = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search)
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    if (inquiry.productCollection === "CAKE" && inquiry.cakeSize)
      match.cakeSize = inquiry.cakeSize;
    else if (inquiry.productSize) match.productSize = inquiry.productSize;
    if (inquiry.productDish) match.productDish = inquiry.productDish;

    if (inquiry.minPrice !== undefined || inquiry.maxPrice !== undefined) {
      match.productPrice = {};
      if (inquiry.minPrice !== undefined)
        match.productPrice.$gte = inquiry.minPrice;
      if (inquiry.maxPrice !== undefined)
        match.productPrice.$lte = inquiry.maxPrice;
    }

    const sort: any =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit },
      ...lookupAuthMemberLiked(memberId),
    ];

    const result = await this.productModel.aggregate(pipeline).exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    const result = await this.productModel
      .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
      .lean()
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      const input: LikeInput = {
        memberId: memberId,
        likeRefId: productId,
        likeGroup: LikeGroup.PRODUCT,
      };

      result.meLiked = await this.likeService.checkLikeExistence(input);
    } else {
      result.meLiked = false;
    }

    return result;
  }

  public async likeTargetProduct(
    memberId: ObjectId,
    likeRefId: ObjectId
  ): Promise<Product & { meLiked: boolean }> {
    const target: Product = await this.productModel
      .findOne({ _id: likeRefId, productStatus: ProductStatus.PROCESS })
      .exec();

    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId,
      likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };

    // Toggle like (increments/decrements)
    const modifier: number = await this.likeService.toggleLike(input);

    // Update like count
    const updatedProduct = await this.propertyStatsEditor({
      _id: likeRefId,
      targetKey: "productLikes",
      modifier,
    });

    if (!updatedProduct) {
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }

    // Check if user currently likes the product
    const meLiked = await this.likeService.checkLikeExistence(input);

    return {
      ...updatedProduct,
      meLiked,
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
          lean: true,
        }
      )
      .exec();
  }

  public async getFlavors(inquiry: FlavorInquiry): Promise<Flavor[]> {
    const match: T = { flavorStatus: FlavorStatus.AVAILABLE };

    if (inquiry.flavorCollection)
      match.flavorCollection = inquiry.flavorCollection;

    if (inquiry.search) {
      match.flavorName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const result = await this.flavorModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
}

export default ProductService;
