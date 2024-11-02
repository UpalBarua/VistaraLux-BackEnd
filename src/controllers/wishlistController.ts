import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import { WishlistModel } from "../models/wishlistModel.js";


export const addToWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user, products } = req.body;

    try {
        if (!user || !products) {
            return next(new ErrorHandler("User and Product ID are required", 400));
        }

        // Check if the product already exists in the user's wishlist
        const existingWishlist = await WishlistModel.findOne({ user: user });

        if (existingWishlist) {
            const productExists = existingWishlist.products.some(
                (item) => item.productId.toString() === products
            );

            if (productExists) {
                return next(new ErrorHandler("This product is already in your wishlist", 409));
            }
        }

        // Logic for adding product to the user's wishlist
        const wishlist = await WishlistModel.findOneAndUpdate(
            { user: user }, // user is the string reference to the user
            { $addToSet: { products: { productId: products } } }, // Wrap productId in an object
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Product added to wishlist successfully",
            wishlist
        });
    } catch (error) {
        console.log("list err is:", error);
        return next(new ErrorHandler("Failed to add product to wishlist", 500));
    }
};


export const wholeWishlistForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const wholeWishlist = await WishlistModel.find({})
        res.status(200).json({
            success: true,
            message: "The whole wishlist retrieved successfully",
            totalItems: wholeWishlist.length,
            wholeWishlist
        })
    } catch (error) {
        return next(new ErrorHandler("Failed to getting  whole wishlist", 500))
    }
}


export const anUserWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params; 

    try {
        if (!id) {
            if (!id) return next(new ErrorHandler("User ID is required", 400))
        }

        const wishlist = await WishlistModel.findOne({ user: id })
            .populate({
                path: "products.productId",
                model: "product"
            })
            .exec();

        if (!wishlist) {
            return next(new ErrorHandler("Wishlist not found", 400))
        }

        return res.status(200).json({
            success: true,
            message: "An user's wishlist retrieved successfully",
            totalItems: wishlist?.products?.length,
            wishlist
        });
    } catch (error) {
        console.error("Error retrieving wishlist:", error);
        return next(new ErrorHandler("Failed to retrieve wishlist", 500))
    }
};



export const removeFromWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId, productId } = req.body;

    console.log(userId, productId)

    try {
        if (!userId || !productId) {
            return next(new ErrorHandler("User ID and Product ID are required", 400));
        }

        // Find the user's wishlist and remove the product
        const updatedWishlist = await WishlistModel.findOneAndUpdate(
            { user: userId }, // Match the user's wishlist
            { $pull: { products: { productId: productId } } }, // Remove the specific product
            { new: true } // Return the updated wishlist
        );

        if (!updatedWishlist) {
            return next(new ErrorHandler("Wishlist not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            updatedWishlist
        });
    } catch (error) {
        console.log("Error removing product from wishlist:", error);
        return next(new ErrorHandler("Failed to remove product from wishlist", 500));
    }
};
