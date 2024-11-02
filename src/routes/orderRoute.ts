//@ts-nocheck

import express from "express"
import { deleteOrder, getAllOrders, getMyOrders, getSingleOrder, postNewOrder, processOrder } from "../controllers/orderController.js"
import { adminOnly, isAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

router.post("/new", isAuthenticated, postNewOrder)
router.get("/my", getMyOrders)
router.get("/all", isAuthenticated, adminOnly, getAllOrders)
router.route("/:id")
    .get(isAuthenticated, getSingleOrder)
    .put(isAuthenticated, adminOnly, processOrder)
    .delete(isAuthenticated, adminOnly, deleteOrder)

export default router