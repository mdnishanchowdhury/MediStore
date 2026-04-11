import { Request, Response, NextFunction } from "express";
import { medicinesService } from "./medicine.service";
import { algoliasearch } from "algoliasearch";

const client = algoliasearch(
    process.env.ALGOLIA_APP_ID as string,
    process.env.ALGOLIA_API_KEY as string
);

const createMedicine = async (req: Request, res: Response) => {
    try {
        const seller = (req as any).user;

        if (!seller) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!",
            });
        }

        const medicine = await medicinesService.createMedicine(req.body, seller.id as string);

        try {
            await client.saveObject({
                indexName: 'medicines',
                body: {
                    objectID: medicine.id,
                    name: medicine.name,
                    category: (medicine as any).category?.name || medicine.categoryId || "General",
                    price: medicine.price,
                    description: medicine.description || ""
                }
            });
        } catch (error) {
            console.error("Algolia indexing failed:", error);
        }

        res.status(201).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        res.status(400).json({
            error: "Medicine creation failed",
            details: error
        });
    }
};

const getSmartSuggestions = async (req: Request, res: Response) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(200).json({ success: true, data: [] });
        }
        const { results } = await client.search({
            requests: [
                {
                    indexName: 'medicines',
                    query: searchTerm as string,
                    hitsPerPage: 10,
                    attributesToHighlight: ['name'],
                    highlightPreTag: '<b>',
                    highlightPostTag: '</b>',
                    typoTolerance: 'min',
                },
            ],
        });

        res.status(200).json({
            success: true,
            // @ts-ignore
            data: results[0].hits,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch AI suggestions",
        });
    }
};

const deleteMedicine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await medicinesService.deleteMedicine(id as string);

        try {
            await client.deleteObject({
                indexName: 'medicines',
                objectID: id as string
            });
        } catch (error) {
            console.error("Algolia delete failed:", error);
        }

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

const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedMedicine = await medicinesService.updateMedicine(id as string, req.body);

        try {
            await client.partialUpdateObject({
                indexName: 'medicines',
                objectID: id as string,
                attributesToUpdate: {
                    name: updatedMedicine.name,
                    price: updatedMedicine.price,
                    description: updatedMedicine.description
                }
            });
        } catch (error) {
            console.error("Algolia update failed:", error);
        }

        res.status(200).json({
            success: true,
            data: updatedMedicine,
            message: "Medicine updated successfully",
        });
    } catch (error: any) {
        next(error);
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
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        res.status(200).json({ success: true, data: medicine });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// algolia all data push
const syncExistingMedicines = async (req: Request, res: Response) => {
    try {

        const medicines = await medicinesService.getAllActiveMedicinesForSync();

        if (!medicines || medicines.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No medicines found in the database to sync."
            });
        }

        const algoliaObjects = medicines.map((medicine: any) => ({
            objectID: medicine.id,
            name: medicine.name,
            price: medicine.price,
            category: medicine.category?.name || "General",
            description: medicine.description || ""
        }));

        await client.saveObjects({
            indexName: 'medicines',
            objects: algoliaObjects,
        });

        res.status(200).json({
            success: true,
            message: `${medicines.length} medicines synced to Algolia successfully!`
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred during the sync process",
        });
    }
};

export const medicinesController = {
    createMedicine,
    getAllMedicines,
    updateMedicine,
    getMedicineById,
    deleteMedicine,
    getSmartSuggestions,
    syncExistingMedicines
};