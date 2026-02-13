import { Router } from "express";
import { ordersController } from "./order.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

router.get("/orders", auth(UserRole.CUSTOMER, UserRole.ADMIN), ordersController.getMyOrders);
router.get("/orders/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN), ordersController.getOrderById);

router.post("/orders", auth(UserRole.CUSTOMER), ordersController.createOrder);

// Seller
router.get("/seller/orders", auth(UserRole.SELLER, UserRole.ADMIN), ordersController.getSellerOrders);
router.patch("/seller/orders/:id", auth(UserRole.SELLER, UserRole.ADMIN), ordersController.updateOrderStatus);


export const orderRouter = router;
