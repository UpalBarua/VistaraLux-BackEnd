//@ts-nocheck
import { ProductModel } from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { dataCaching } from "../app.js";
import { invalidateCache } from "../utils/invalidateCache.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
// create new product
export const createProduct = async (req, res, next) => {
    try {
        const photos = req.files;
        const { name, category, description, price, stock, brand } = req.body;
        if (!photos)
            return next(new ErrorHandler("Please attach an image!", 400));
        if (photos.length < 1)
            return next(new ErrorHandler("Please add at least 1 photo", 400));
        if (photos.length > 10)
            return next(new ErrorHandler("Maximum 10 photos allowed for a product", 400));
        const userId = req.user?._id;
        if (!userId)
            return res.status(400).json({ success: false, message: "User is not authenticated." });
        const photosUrl = await uploadOnCloudinary(photos);
        if (!photosUrl || photosUrl.length === 0) {
            return next(new ErrorHandler("Failed to upload photos", 500));
        }
        // Create the product in the database
        const product = await ProductModel.create({
            name,
            category: category.toLowerCase(),
            brand,
            description,
            price,
            stock,
            photos: photosUrl,
            user: userId,
        });
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    }
    catch (error) {
        console.log("Error:", error);
        return next(new ErrorHandler("Failed to create product.", 500));
    }
};
// latest products
export const getLatestProducts = async (req, res, next) => {
    try {
        const products = await ProductModel.find({})
            .sort({ createdAt: -1 })
            .limit(8);
        return res.status(200).json({
            success: true,
            message: "Latest products retrieved successfully",
            totalProducts: products.length,
            products
        });
    }
    catch (error) {
        return next(new ErrorHandler("An error occurred during getting latest products", 400));
    }
};
// all categories
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await ProductModel.distinct("category");
        return res.status(200).json({
            success: true,
            message: "categories retrieved successfully",
            totalCategories: categories.length,
            categories
        });
    }
    catch (error) {
        return next(new ErrorHandler("An error occurred during getting all categories", 400));
    }
};
// all products
export const getAdminProducts = async (req, res, next) => {
    try {
        const products = await ProductModel.find({});
        if (products.length < 1) {
            return next(new ErrorHandler("Right now, there is no products", 400));
        }
        return res.status(200).json({
            success: true,
            message: "Admin products retrieved successfully",
            totalProducts: products.length,
            products
        });
    }
    catch (error) {
        return next(new ErrorHandler("An error occurred during getting all products", 400));
    }
};
// get s single product
export const getSingleProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await ProductModel.findById(id);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        dataCaching.set(`product-${id}`, JSON.stringify(product));
        return res.status(200).json({
            success: true,
            message: "A single product retrieved successfully",
            product
        });
    }
    catch (error) {
        return next(new ErrorHandler("An error occurred during getting a single product", 400));
    }
};
// update products
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, description, price, stock } = req.body;
        const product = await ProductModel.findById(id);
        if (!product)
            return next(new ErrorHandler("Product not found", 404));
        const photos = req.files;
        // Only update photos if new ones are uploaded
        if (photos && photos.length > 0) {
            const photosUrl = await uploadOnCloudinary(photos);
            const ids = product.photos.map(photo => photo.public_id);
            await deleteFromCloudinary(ids);
            // Replace product photos with new photos
            product.photos = photosUrl;
        }
        if (name)
            product.name = name;
        if (category)
            product.category = category.toLowerCase();
        if (description)
            product.description = description;
        if (price && price > 0)
            product.price = price;
        if (stock && stock >= 0)
            product.stock = stock;
        await product.save();
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        return next(new ErrorHandler("Failed to update product.", 500));
    }
};
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product)
            return next(new ErrorHandler("Product not found", 404));
        const ids = product.photos.map(photo => photo.public_id);
        await deleteFromCloudinary(ids);
        // Delete the product from the database
        await product.deleteOne();
        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id),
        });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        console.log("Delete error", error);
        return next(new ErrorHandler("Failed to delete product", 500));
    }
};
// search products
export const getAllProductsWithSearch = async (req, res, next) => {
    try {
        console.log('Inside searchProducts route', req.query);
        const { search, minPrice, maxPrice, category, sort } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 9;
        const skip = (page - 1) * limit;
        const baseQuery = {};
        // Search by product name
        if (search) {
            baseQuery.name = {
                $regex: search,
                $options: "i",
            };
        }
        // Search by price range (using both gte and lte)
        if (minPrice || maxPrice) {
            baseQuery.price = {}; // Initialize `price` object
            if (minPrice) {
                baseQuery.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                baseQuery.price.$lte = Number(maxPrice);
            }
        }
        // Search by category
        if (category)
            baseQuery.category = category;
        // Find products with pagination and sorting
        const productsPromise = ProductModel.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);
        // Get all filtered products for total count
        const [products, filteredProducts] = await Promise.all([
            productsPromise,
            ProductModel.find(baseQuery),
        ]);
        const totalPages = Math.ceil(filteredProducts.length / limit);
        if (products.length < 1) {
            return next(new ErrorHandler(`No products found with search ${search || minPrice || maxPrice || category || sort}`, 404));
        }
        res.status(200).json({
            success: true,
            message: "Products retrieved successfully by searching...",
            totalPages,
            totalItems: filteredProducts.length,
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler("Failed to get filtered products", 400));
    }
};
