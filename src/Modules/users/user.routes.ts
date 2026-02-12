import express from "express";
import { userControllers } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();


router.get("/users", userControllers.getUser);
router.get("/users/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SELLER), userControllers.getSingleUser);
router.put("/users/:id", auth(UserRole.ADMIN, UserRole.SELLER), userControllers.putSingleUser);
router.delete("/users/:id", auth(UserRole.ADMIN, UserRole.SELLER), userControllers.deleteSingleUser);

export const userRoutes = router;