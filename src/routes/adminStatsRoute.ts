import express from "express"
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/adminStatsController.js"
import { adminOnly, isAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

router.get("/dashboard-stats", isAuthenticated, adminOnly, getDashboardStats)
router.get("/pie-charts", isAuthenticated, adminOnly, getPieCharts)
router.get("/bar-charts", isAuthenticated, adminOnly, getBarCharts)
router.get("/line-charts", isAuthenticated, adminOnly, getLineCharts)

export default router