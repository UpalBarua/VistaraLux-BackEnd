import { dataCaching } from "../app.js";
import { OrderModel } from "../models/orderModel.js";
import { ProductModel } from "../models/productModel.js";
import { invalidateCacheProps } from "../types/types.js";

export const invalidateCache = ({
    product,
    order,
    admin,
    userId,
    productId,
    orderId
}: invalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latest-products",
            "categories",
            "all-products",
        ]
        if (typeof productId === "string") productKeys.push(`product-${productId}`)
        if (typeof product === "object") {
            productId.forEach(i => {
                productKeys.push(`product-${i}`)
            });
        }
        dataCaching.del(productKeys)
    }

    if (order) {
        const ordersKeys: string[] = ["all-orders", `my-orders-${userId}`, `order-${orderId}` ]
        
        dataCaching.del(ordersKeys)
    }
    if (admin) {
        dataCaching.del([
            "admin-dashboard-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ])
    }
} 