import { ProductModel } from "../models/productModel.js"

export const getInventories = async ({ categories, productsCount }:
    {
        categories: string[],
        productsCount: number
     }) => {
    const categoriesCountPromise = categories.map(category => ProductModel.countDocuments({ category }))
    
    const categoriesCount = await Promise.all(categoriesCountPromise)

    const categoryCount: Record<string, number>[] = []
    categories.forEach((category, index) => {
        categoryCount.push({ [category]: Math.round((categoriesCount[index] / productsCount) * 100) })
    })
    return categoryCount
}