import express, { NextFunction, Request, Response } from 'express';
import { categoryController } from './category.controller';
import auth, { UserRole } from '../../middlewares/auth';


const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);


router.post('/', auth(UserRole.ADMIN, UserRole.SELLER), categoryController.createCategory);
router.put("/:id", auth(UserRole.ADMIN, UserRole.SELLER), categoryController.updateCategory);
router.delete("/:id", auth(UserRole.ADMIN, UserRole.SELLER), categoryController.deleteCategory);


export const categoryRouter = router;