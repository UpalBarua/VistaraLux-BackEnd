import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    billingInfo: {
        userId: {
            type: String,
            ref: "user",
            required: [true, "We need your userId to make an order"]
        },
        anyMessage: {
            type: String,
        }
    },
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
    },
    tax: {
        type: Number,
        required: true
    },
    shippingCharge: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered"],
        default: "Processing"
    },
    orderedItems: [{
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "product"
            }
        }]
}, { timestamps: true, versionKey: false });
export const OrderModel = mongoose.model("order", orderSchema);
