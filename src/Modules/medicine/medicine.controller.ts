import { Request, Response, NextFunction } from "express";
import { medicinesService } from "./medicine.service";


const createMedicine = async (req: Request, res: Response) => {
    try {
        const seller = req.user;

        if (!seller) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!",
            });
        }

        const medicine = await medicinesService.createMedicine(req.body, seller.id as string);

        res.status(201).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        res.status(400).json({
            error: "Medicine creation failed",
            details: error
        })
    }
};

const getAllMedicines = async (req: Request, res: Response) => {
    try {
        const result = await medicinesService.getAllMedicines(req.query);

        res.status(200).json({
            success: true,
            message: "Medicines fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

const getMedicineById = async (req: Request, res: Response) => {
    try {
        const medicine = await medicinesService.getMedicineById(req.params.id as string);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }

        res.status(200).json({
            success: true,
            data: medicine,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ error: "Invalid medicine id" });
        }

        const updatedMedicine = await medicinesService.updateMedicine(id, req.body);

        res.status(200).json({
            success: true,
            data: updatedMedicine,
            message: "Medicine updated successfully",
        });
    } catch (error: any) {
        next(error);
    }
};

const deleteMedicine = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid medicine ID",
            });
        }

        const result = await medicinesService.deleteMedicine(id);

        res.status(200).json({
            success: true,
            message: "Medicine removed successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};



export const medicinesController = {
    createMedicine,
    getAllMedicines,
    updateMedicine,
    getMedicineById,
    deleteMedicine
};


