import { prisma } from "../../lib/prisma";

const createCategory = async (data: {
    categoryName: string;
    description: string;
}) => {
    const result = await prisma.category.create({
        data: {
            ...data,
        }
    })
    return result;
}


export const categoryService = {
    createCategory,
}