//@ts-nocheck
import express from "express";
import { addToWishlist, anUserWishlist, removeFromWishlist, wholeWishlistForAdmin } from "../controllers/wishlistController.js";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();
router.post("/new", isAuthenticated, addToWishlist);
router.get("/all", isAuthenticated, adminOnly, wholeWishlistForAdmin);
router.get("/:id", isAuthenticated, anUserWishlist);
router.delete("/delete", isAuthenticated, removeFromWishlist);
export default router;
