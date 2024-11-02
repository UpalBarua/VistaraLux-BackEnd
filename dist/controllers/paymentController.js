import { CouponModel } from "../models/couponModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { stripe } from "../app.js";
// create payment system
export const createPaymentIntent = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount)
            return next(new ErrorHandler("Please enter the amount", 400));
        const paymentIntent = await stripe.paymentIntents.create({ amount: 1010, currency: "USD" });
        res.status(201).json({
            success: true,
            message: "Payment Successful",
            clientSecret: paymentIntent.client_secret
        });
    }
    catch (error) {
        console.log("errr iss", error);
        return next(new ErrorHandler("Failed to complete the payment", 400));
    }
};
// creating a coupon code
export const createCoupon = async (req, res, next) => {
    try {
        const { couponCode, discountAmount } = req.body;
        console.log("req", couponCode, discountAmount);
        console.log("req222", req.body);
        if (!couponCode || !discountAmount) {
            return next(new ErrorHandler("Please enter both coupon code and discount amount", 400));
        }
        const isCouponAlreadyExist = await CouponModel.findOne({ couponCode });
        if (isCouponAlreadyExist)
            return next(new ErrorHandler("This coupon is already exist", 409));
        if (discountAmount <= 0) {
            return next(new ErrorHandler("Discount amount must be greater than 0", 400));
        }
        const coupon = await CouponModel.create({ couponCode, discountAmount });
        res.status(200).json({
            success: true,
            message: "Coupon created Successfully",
            data: coupon
        });
    }
    catch (error) {
        console.log("cpn err: ", error);
        return next(new ErrorHandler("Failed to create a coupon", 400));
    }
};
// apply for discount
export const applyCoupon = async (req, res, next) => {
    try {
        const { couponCode } = req.query;
        const discount = await CouponModel.findOne({ couponCode });
        if (!discount)
            return next(new ErrorHandler("Invalid coupon code", 400));
        res.status(200).json({
            success: true,
            message: "congrats! You've got the discount",
            data: discount
        });
    }
    catch (error) {
        return next(new ErrorHandler("Failed to apply discount", 500));
    }
};
// all coupons
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await CouponModel.find({});
        if (coupons.length < 1)
            return next(new ErrorHandler("Oops! There's no coupon right now", 404));
        res.status(200).json({
            success: true,
            message: "All coupons retrieved successfully",
            totalCoupons: coupons.length,
            data: coupons
        });
    }
    catch (error) {
        return next(new ErrorHandler("Failed to retrieve all coupons", 404));
    }
};
//delete coupon
export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await CouponModel.findById(id);
        if (!coupon)
            return next(new ErrorHandler("Coupon not found", 404));
        await coupon.deleteOne();
        res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
            data: coupon
        });
    }
    catch (error) {
        console.log("err dlt cpn is: ", error);
        return next(new ErrorHandler("Failed to deleted the coupon", 400));
    }
};
