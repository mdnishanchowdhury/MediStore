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
    sellerId: string,
    data: Partial<Omit<Medicine, "id" | "authorId" | "createdAt" | "updatedAt">>
) => {
    const medicine = await prisma.medicine.findFirstOrThrow({
        where: {
            id,
            authorId: sellerId,
        },
        select: {
            id: true,
            authorId: true,
        },
    });

    const updated = await prisma.medicine.update({
        where: { id: medicine.id },
        data,
    });

    return updated;
};

const getAllMedicines = async (query: any) => {
    const { search, categoryId, minPrice, maxPrice } = query;

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

    return prisma.medicine.findMany({
        where,
        include: {
            category: true,
            reviews: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
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

const deleteMedicine = async (id: string, authorId: string) => {
    return prisma.medicine.updateMany({
        where: {
            id,
            authorId: authorId,
        },
        data: {
            isActive: false,
        },
    });
};

export const medicinesService = {
    createMedicine,
    getAllMedicines,
    updateMedicine,
    getMedicineById,
    deleteMedicine
};
