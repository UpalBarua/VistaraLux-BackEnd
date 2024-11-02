import mongoose from "mongoose";
import validator from "validator";
const subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please enter your email"],
        validate: [validator.default.isEmail, "Please enter a valid email"]
    },
}, { timestamps: true, versionKey: false });
export const SubscriberModel = mongoose.model("subscriber", subscriberSchema);
