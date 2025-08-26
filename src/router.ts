import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";

// Member
router.get("/member/admin", memberController.getAdmin);
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout
);

router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail
);

router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember
);

router.get("/member/top-users", memberController.getTopUsers);

// Product

router.get(
  "/product/all",
  memberController.retrieveAuth,
  productController.getProducts
);
router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct
);

router.get(
  "/flavors/all",
  memberController.retrieveAuth,
  productController.getFlavors
);

router.post(
  "/product/like/:id",
  memberController.verifyAuth,
  productController.likeTargetProduct
);

// Order

router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);

router.post(
  "/custom/build",
  memberController.verifyAuth,
  orderController.buildCustom
);

router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders
);

router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder
);

export default router;
