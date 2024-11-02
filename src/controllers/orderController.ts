import { NextFunction, Request, Response } from "express";
import { createNewUserReqBody, NewOrderReqBody } from "../types/types.js";
import { OrderModel } from "../models/orderModel.js";
import { reduceStock } from "../utils/reduceStock.js";
import { invalidateCache } from "../utils/invalidateCache.js";
import ErrorHandler from "../utils/errorHandler.js";
import { ProductModel } from "../models/productModel.js";
import { dataCaching } from "../app.js";

// creating my order
export const postNewOrder = async (
    req: Request<{}, {}, NewOrderReqBody>,
    res: Response,
    next: NextFunction
) => {
    const session = await OrderModel.startSession();
    session.startTransaction(); // Start transaction

    try {
        const {
            shippingInfo,
            billingInfo,
            orderedItems,
            tax,
            shippingCharge,
            discount,
            subtotal,
            total
        } = req.body;

        // Validate required fields
        if (!shippingInfo || !billingInfo || !orderedItems || !tax || !total) {
            throw new ErrorHandler("Please fulfill all fields", 400);
        }

        // Check stock before placing the order
        for (let i = 0; i < orderedItems.length; i++) {
            const order = orderedItems[i];
            const product = await ProductModel.findById(order.productId).session(session);

            if (!product) {
                throw new ErrorHandler(`Product not found: ${order.name}, Id: ${order.productId}`, 404);
            }

            if (product.stock < order.quantity) {
                throw new ErrorHandler(`Not enough stock for ${product.name}`, 400);
            }

            // Adjust stock within the same transaction
            product.stock -= order.quantity;
            await product.save({ session });
        }

        // Place the order only if all checks are passed
        const [order] = await OrderModel.create(
            [{
                shippingInfo,
                billingInfo,
                orderedItems,
                tax,
                shippingCharge,
                discount,
                subtotal,
                total
            }],
            { session }
        );

        await session.commitTransaction(); // Commit transaction
        session.endSession();

        // invalidateCache({
        //     product: true,
        //     order: true,
        //     admin: true,
        //     userId: billingInfo.userId,
        //     productId: [order?.orderedItems?.map(item => String(item.productId))]
        // });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        // Only abort if transaction is still active
        if (session.inTransaction()) {
            await session.abortTransaction(); // Rollback transaction
        }
        session.endSession();
        console.error("Error placing order:", error);
        return next(new ErrorHandler("Failed to place an order", 500));
    }
};


// my orders
export const getMyOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.query;
        if (!id) {
            return next(new ErrorHandler("User ID is required", 400));
        }

        // const key = `my-orders${id}`;
        // let orders = [];

        // if (dataCaching.has(key)) {
        // orders = JSON.parse(dataCaching.get(key) as string);
        // } else {
        // Query based on billingInfo.userId
        const orders = await OrderModel.find({ "billingInfo.userId": id });
        // dataCaching.set(key, JSON.stringify(orders));
        // }

        if (orders.length < 1) {
            return next(new ErrorHandler("You haven't made any orders yet", 404));
        }

        res.status(200).json({
            success: true,
            message: `Order history retrieved successfully`,
            totalOrder: orders.length,
            orders,
        });
    } catch (error) {
        console.log("Error is", error);
        return next(new ErrorHandler("Failed to get user's order history", 400));
    }
};


// all orders
export const getAllOrders = async (
    req: Request<{}, {}, createNewUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {

        // let orders = []
        // if (dataCaching.has("all-orders")) orders = JSON.parse(dataCaching.get("all-orders") as string)

        // else {
          const orders = await OrderModel.find().populate("billingInfo.userId")
            // dataCaching.set("all-orders", JSON.stringify(orders))
        // }

        if (orders.length < 1) {
            return next(new ErrorHandler("There's no transaction yet", 404));
        }

        res.status(200).json({
            success: true,
            message: `All orders history retrieved successfully`,
            totalOrder: orders.length,
            orders
        })
    } catch (error) {
        console.log("err is", error)
        return next(new ErrorHandler("Failed to getting all order history", 400))
    }
}


// get single order
export const getSingleOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params
        const key = `order-${id}`
        let order

        if (dataCaching.has(key)) order = JSON.parse(dataCaching.get(key) as string)
        else {
            order = await OrderModel.findById(id).populate("billingInfo.userId")
            dataCaching.set(key, JSON.stringify(order))
        }

        if (!order) return next(new ErrorHandler("Order not found", 404))

        res.status(200).json({
            success: true,
            message: "Order details retrieved successfully",
            order
        })
    } catch (error) {
        console.log("er......", error)
        return next(new ErrorHandler("Failed to getting order details", 400))
    }
}



// process order
export const processOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params
        const order = await OrderModel.findById(id)
        if (!order) return next(new ErrorHandler("Order not found", 404))

        switch (order.status) {
            case "Processing":
                order.status = "Shipped"
                break;
            case "Shipped":
                order.status = "Delivered"
                break;
            default:
                order.status = "Delivered"
                break;
        }

        await order.save()

        // invalidateCache({
        //     product: false,
        //     order: true,
        //     admin: true,
        //     userId: order.billingInfo?.userId,
        //     orderId: [String(order._id)]
        // });

        res.status(200).json({
            success: true,
            message: "Order processed successfully",
            order
        })

    } catch (error) {
        console.log("err is:", error)
        return next(new ErrorHandler("Failed to process the order", 400))
    }
}



// delete order
export const deleteOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params
        const order = await OrderModel.findById(id)
        if (!order) return next(new ErrorHandler("Order not found", 404))
        await order.deleteOne()
        
        // invalidateCache({
        //     product: false,
        //     order: true,
        //     admin: true,
        //     userId: order.billingInfo?.userId,
        //     orderId: [String(order._id)]
        // });

        res.status(200).json({
            success: true,
            message: "Order deleted Successfully",
            order
        })
    } catch (error) {
        console.log("dlt err is:", error)
        return next(new ErrorHandler("Failed to delete the order", 400))
    }
}