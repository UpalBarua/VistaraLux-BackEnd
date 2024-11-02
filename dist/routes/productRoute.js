//@ts-nocheck
import express from "express";
import { createProduct, deleteProduct, getAdminProducts, getAllCategories, getAllProductsWithSearch, getLatestProducts, getSingleProduct, updateProduct } from "../controllers/productController.js";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";
import { multiUpload } from "../middlewares/multer.js";
const router = express.Router();
router.post("/new", isAuthenticated, adminOnly, multiUpload, createProduct);
router.get("/all", getAllProductsWithSearch);
router.get("/latest", getLatestProducts);
router.get("/categories", getAllCategories);
// router.get("/admin-products", isAuthenticated, adminOnly, getAdminProducts);
router.get("/admin-products", getAdminProducts);
router.route("/:id")
    .get(getSingleProduct)
    .put(isAuthenticated, adminOnly, multiUpload, updateProduct)
    .delete(isAuthenticated, adminOnly, deleteProduct);
export default router;
