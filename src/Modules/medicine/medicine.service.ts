import { Medicine, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createMedicine = async (data: Omit<Medicine, "id" | "createdAt" | "updatedAt" | "authorId">
    , sellerId: string) => {
    const result = await prisma.medicine.create({
        data: {
            ...data,
            authorId: sellerId
        }
    });
    return result;
};

const updateMedicine = async (
    id: string,
    data: Partial<Omit<Medicine, "id" | "authorId" | "createdAt" | "updatedAt">>
) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!medicine) {
        throw new Error("Medicine not found");
    }
    const updated = await prisma.medicine.update({
        where: { id },
        data,
    });

    return updated;
};

const getAllMedicines = async (query: any) => {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 9 } = query;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 9;
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.MedicineWhereInput = {
        isActive: true,
    };

    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive",
        };
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const medicines = await prisma.medicine.findMany({
        where,
        skip: skip,
        take: limitNumber,
        include: {
            category: true,
            reviews: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const total = await prisma.medicine.count({ where });

    return {
        data: medicines,
        meta: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};

const getMedicineById = async (id: string) => {
    return prisma.medicine.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
        },
    });
};

const deleteMedicine = async (id: string) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!medicine) {
        throw new Error("Medicine not found");
    }

    const deleted = await prisma.medicine.update({
        where: { id },
        data: { isActive: false },
    });

    return deleted;
};

export const medicinesService = {
    createMedicine,
    getAllMedicines,
    updateMedicine,
    getMedicineById,
    deleteMedicine
};
