import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: "user", 
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
        },
    ],
}, { timestamps: true, versionKey: false });

export const WishlistModel = mongoose.model("wishlist", wishlistSchema);