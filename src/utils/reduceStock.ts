import { ProductModel } from "../models/productModel.js";
import { OrderedItemType } from "../types/types.js";

export const reduceStock = async (orderItems: OrderedItemType[]) => {
    for (let i = 0; i < orderItems.length; i++){
        const order = orderItems[i]
        const product = await ProductModel.findById(order.productId)
        if (!product) throw new Error("Product not found")
        product.stock -= order.quantity
        await product.save()
    }
}