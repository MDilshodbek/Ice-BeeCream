import { T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/errors";
import { Request, Response } from "express";
import ProductService from "../models/Product.service";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import {
  FlavorCollection,
  ProductCollection,
} from "../libs/enums/product.enum";
import { FlavorInput, FlavorInquiry } from "../libs/types/flavor";
import LikeService from "../models/Like.service";
import { shapeIntoMongooseObjectId } from "../libs/config";

const productService = new ProductService();
const likeService = new LikeService();
const productController: T = {};

// SPA

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query;

    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (productCollection)
      inquiry.productCollection = productCollection as ProductCollection;
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("err getProducts:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params;
    const memberId = req.member?._id ?? null

    const result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("err getProduct:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getFlavors = async (req: Request, res: Response) => {
  try {
    console.log("getFlavors");
    const { page, limit, flavorCollection, search } = req.query;

    const inquiry: FlavorInquiry = {
      page: Number(page),
      limit: Number(limit),
    };
    if (flavorCollection)
      inquiry.flavorCollection = flavorCollection as FlavorCollection;
    if (search) inquiry.search = String(search);

    const result = await productService.getFlavors(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("err getFlavors:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.likeTargetProduct = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("likeTargetProduct");
    const likeRefId = shapeIntoMongooseObjectId(req.params.id);
    const memberId = shapeIntoMongooseObjectId(req.member?._id),
      result = await productService.likeTargetProduct(memberId, likeRefId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("err addLike:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// BSSR

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewProduct");

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;

    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    await productService.createNewProduct(data);

    res.send(
      `<script> alert("Successful creation"); window.location.replace('/adminRouter/product/all')</script>`
    );
  } catch (error) {
    console.log("err createNewProduct:", error);
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}")); window.location.replace('/adminRouter/product/all')</script>`
    );
  }
};

productController.updateChoosenProduct = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateChoosenProduct");
    const id = req.params.id;
    console.log("id", id);

    const result = await productService.updateChoosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (error) {
    console.log("err updateChoosenProduct:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const products = await productService.getAllProducts();
    const flavors = await productService.getAllFlavors();

    res.render("products", { products: products, flavors: flavors });
  } catch (error) {
    console.log("err getAllProducts:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewFlavor = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewFlavor");

    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const data: FlavorInput = req.body;
    data.flavorImage = file?.path.replace(/\\/g, "/");

    await productService.createNewFlavor(data);

    res.send(
      `<script> alert("Successful creation"); window.location.replace('/adminRouter/product/all')</script>`
    );
  } catch (error) {
    console.log("err createNewFlavor:", error);
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}")); window.location.replace('/adminRouter/product/all')</script>`
    );
  }
};

productController.updateChoosenFlavor = async (req: Request, res: Response) => {
  try {
    console.log("updateChoosenFlavor");
    const id = req.params.id;

    const result = await productService.updateChoosenFlavor(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (error) {
    console.log("err updateChoosenProduct:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getAllFlavors = async (req: Request, res: Response) => {
  try {
    console.log("getAllFlavors");
    const flavors = await productService.getAllFlavors();

    res.render("flavors", { flavors: flavors });
  } catch (error) {
    console.log("err getAllFlavors:", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
