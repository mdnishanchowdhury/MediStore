import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { medicinesController } from "./medicine.controller";

const router = Router();

// public
router.get("/medicines", medicinesController.getAllMedicines);
router.get("/medicines/:id", medicinesController.getMedicineById);

// Seller management
router.post("/seller/medicines", auth(UserRole.SELLER, UserRole.ADMIN), medicinesController.createMedicine);
router.put("/seller/medicines/:id", auth(UserRole.SELLER, UserRole.ADMIN), medicinesController.updateMedicine);
router.delete("/seller/medicines/:id", auth(UserRole.SELLER, UserRole.ADMIN), medicinesController.deleteMedicine);

export const medicineRouter = router;
