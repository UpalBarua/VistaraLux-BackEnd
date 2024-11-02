import { ProductModel } from "../models/productModel.js";
export const getInventories = async ({ categories, productsCount }) => {
    const categoriesCountPromise = categories.map(category => ProductModel.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, index) => {
        categoryCount.push({ [category]: Math.round((categoriesCount[index] / productsCount) * 100) });
    });
    return categoryCount;
};
