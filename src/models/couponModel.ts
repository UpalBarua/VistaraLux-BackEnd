import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    couponCode: {
        type: String,
        required: [true, "Please enter the coupon code"],
        // unique:true
    },
    discountAmount: {
        type: Number,
        required: [true, "Please enter the discount amount"],
        min: [1, "Discount amount must be greater than 0"]
    }

})

export const CouponModel = mongoose.model("coupon", couponSchema)