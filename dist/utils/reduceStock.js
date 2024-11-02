import { ProductModel } from "../models/productModel.js";
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await ProductModel.findById(order.productId);
        if (!product)
            throw new Error("Product not found");
        product.stock -= order.quantity;
        await product.save();
    }
};
