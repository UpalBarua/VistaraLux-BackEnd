import { dataCaching } from "../app.js";
export const invalidateCache = ({ product, order, admin, userId, productId, orderId }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof product === "object") {
            productId.forEach(i => {
                productKeys.push(`product-${i}`);
            });
        }
        dataCaching.del(productKeys);
    }
    if (order) {
        const ordersKeys = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];
        dataCaching.del(ordersKeys);
    }
    if (admin) {
        dataCaching.del([
            "admin-dashboard-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ]);
    }
};
