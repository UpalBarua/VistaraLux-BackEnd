import express from "express"
import {
    applyCoupon,
    createCoupon,
    createPaymentIntent,
    deleteCoupon,
    getAllCoupons
} from "../controllers/paymentController.js"
import { adminOnly, isAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

router.post("/create", createPaymentIntent )
router.post("/coupon/new", isAuthenticated, adminOnly, createCoupon)
router.get("/coupon/all", isAuthenticated, adminOnly, getAllCoupons)
router.get("/discount", applyCoupon)
router.delete("/coupon/:id", isAuthenticated, adminOnly, deleteCoupon)

export default router