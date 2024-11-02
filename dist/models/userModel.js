// const userSchema = new mongoose.Schema({
//     _id: {
//         type: String,
//         required: [true, "Please enter an Id"]
//     },
//     name: {
//         type: String,
//         required: [true, "Please enter your name"]
//     },
//     email: {
//         type: String,
//         unique: true,
//         required: [true, "Please enter your email"],
//         validate: [validator.default.isEmail, "Please enter a valid email"]
//     },
//     password: {
//         type: String,
//         required: [true, "Please enter a password"],
//         minLength: [6, "Password must be at least 6 characters"],
//     },
//     photo: {
//         type: String,
//         required: [true, "Please select a photo for the DP"]
//     },
//     role: {
//         type: String,
//         enum: ["admin", "user"],
//         default: "user",
//     },
//     gender: {
//         type: String,
//         enum: ["male", "female"],
//         required: [true, "Please select your gender"]
//     },
//     dob: {
//         type: Date,
//         required: [true, "Please select your D.O.B."]
//     },
// }, { timestamps: true, versionKey: false })
import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "Please enter an Id"]
    },
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
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minLength: [6, "Password must be at least 6 characters"]
    },
    photo: {
        type: String,
        default: "" // Set default to empty string
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: null // Set default to null or undefined
    },
    dob: {
        type: Date,
        default: null // Set default to null
    },
}, { timestamps: true, versionKey: false });
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        today.getMonth() === dob.getMonth() &&
            today.getDate() < dob.getDate()) {
        age--;
    }
    return age;
});
export const UserModel = mongoose.model("user", userSchema);
