import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/errors";
import { Response } from "express";
import OrderService from "../models/Order.service";
import {
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";
import { CustomBuildRequest } from "../libs/types/customOrder";

const orderService = new OrderService();
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");

    const result = await orderService.createOrder(req.member, req.body);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("err createOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    // res.json({error});
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");
    const { page, limit, orderStatus } = req.query;
    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };

    const result = await orderService.getMyOrders(req.member, inquiry);

    console.log("inquery:", inquiry);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("err getMyOrders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    // res.json({error});
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body;
    const result = await orderService.updateOrder(req.member, input);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("err updateOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    // res.json({error});
  }
};

orderController.buildCustom = async (req: Request, res: Response) => {
  try {
    const body = req.body as CustomBuildRequest;
    if (
      !body ||
      !body.flavorCollection ||
      !body.size ||
      !body.dishType ||
      !Array.isArray(body.flavorIds)
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const result = await orderService.buildCustom(body);
    return res.json(result);
  } catch (err) {
    console.log("err buildCustomController:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};


export default orderController;
