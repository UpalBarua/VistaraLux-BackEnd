import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
    },
    category: {
        type: String,
        required: [true, "Please enter product category"],
        trim: true
    },
    brand: {
        type: String,
        required: [true, "Please enter product's brand"],
    },
    description: {
        type: String,
        required: [true, "Please enter description"],
    },
    price: {
        type: Number,
        required: [true, "Please enter price"],
        max: [99999999, "Price cannot exceed 8 digits"],
    },
    photos: [
        {
            public_id: {
                type: String,
                required: [true, "Please enter public Id"]
            },
            url: {
                type: String,
                required: [true, "Please enter the url"]
            }
        }
    ],
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        max: [9999, "Stock cannot exceed 4 digits"],
        default: 1,
    },
    user: {
        type: String,
        required: true,
    },
}, { timestamps: true, versionKey: false });
export const ProductModel = mongoose.model("product", productSchema);
