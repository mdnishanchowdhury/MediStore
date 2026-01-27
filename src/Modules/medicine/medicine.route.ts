import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { medicinesController } from "./medicine.controller";

const router = Router();

// public
router.get("/medicines", medicinesController.getAllMedicines);
router.get("/medicines/:id", medicinesController.getMedicineById);

// Seller
router.post("/seller/medicines", auth(UserRole.SELLER), medicinesController.createMedicine);
router.put("/seller/medicines/:id", auth(UserRole.SELLER), medicinesController.updateMedicine);
router.delete("/seller/medicines/:id", auth(UserRole.SELLER), medicinesController.deleteMedicine);

export const medicineRouter = router;
