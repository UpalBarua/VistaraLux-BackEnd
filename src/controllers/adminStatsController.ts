import { NextFunction, Request, Response } from "express"
import { dataCaching } from "../app.js"
import ErrorHandler from "../utils/errorHandler.js"
import { ProductModel } from "../models/productModel.js"
import { UserModel } from "../models/userModel.js"
import { OrderModel } from "../models/orderModel.js"
import { calculatePercentage } from "../utils/calculatePercentage.js"
import { getInventories } from "../utils/getInventories.js"
import { getChartData } from "../utils/getChartData.js"


// admin dashboard stats
export const getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const today = new Date()
        const sixMonthAgo = new Date()
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        // products
        const thisMonthProductsPromise = await ProductModel.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthProductsPromise = ProductModel.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })


        // user
        const thisMonthUsersPromise = await UserModel.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthUsersPromise = UserModel.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })



        // order
        const thisMonthOrdersPromise = await OrderModel.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthOrdersPromise = OrderModel.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const lastSixMonthOrdersPromise = OrderModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        })

        const latestTransactionPromise = OrderModel.find({}).select(["orderedItems", "discount", "total", "status"]).limit(5)

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,

            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,

            userCount,
            productsCount,
            allOrders,

            lastSixMonthOrders,
            categories,
            femaleUserCount,
            latestTransactions
        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,

            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,

            UserModel.countDocuments(),
            ProductModel.countDocuments(),
            OrderModel.find({}).select("total"),
            lastSixMonthOrdersPromise,
            ProductModel.distinct("category"),
            UserModel.countDocuments({ gender: "female" }),
            latestTransactionPromise
        ])

        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        )
        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        )

        const audit = {
            users: userCount,
            products: productsCount,
            orders: allOrders.length
        }

        const revenue = allOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        );

        const auditPercentages = {
            user: calculatePercentage(
                thisMonthUsers.length,
                lastMonthUsers.length
            ),
            product: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),
            order: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            ),
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
        }

        const orderMonthCounts = new Array(6).fill(0)
        const orderMonthRevenues = new Array(6).fill(0)

        lastSixMonthOrders.forEach(order => {
            const creationDate = order.createdAt
            const monthsDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12

            if (monthsDiff < 6) {
                orderMonthCounts[6 - monthsDiff - 1] += 1
                orderMonthRevenues[6 - monthsDiff - 1] += order.total
            }
        })

        const categoryCount = await getInventories({ categories, productsCount })

        const userRatio = {
            male: userCount - femaleUserCount,
            female: femaleUserCount
        }

        const modifiedLatestTransaction = latestTransactions.map(transaction => ({
            _id: transaction._id,
            discount: transaction.discount,
            amount: transaction.total,
            quantity: transaction.orderedItems.length,
            status: transaction.status,

        }))

        const adminDashboardStats = {
            audit,
            revenue,
            auditPercentages,
            charts: {
                order: orderMonthCounts,
                revenue: orderMonthRevenues
            },
            categoryCount,
            userRatio,
            latestTransaction: modifiedLatestTransaction
        }
        res.status(200).json({
            success: true,
            message: "Admin Dashboard stats retrieved successfully",
            adminDashboardStats
        })
    } catch (error) {
        console.log("err iss", error)
        return next(new ErrorHandler("Failed to get admin dashboard stats", 400))
    }
}

// admin dashboard's pie charts
export const getPieCharts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const allOrderPromise = OrderModel.aggregate([
            {
                $project: {
                    tax: 1,
                    shippingCharge: 1,
                    discount: 1,
                    total: 1,
                    subtotal: {
                        $sum: "$orderedItems.subtotal"
                    }
                }
            }
        ]);

        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            productsOutOfStock,
            allOrders,
            allUsers,
            admins,
            customers
        ] = await Promise.all([
            OrderModel.countDocuments({ status: "Processing" }),
            OrderModel.countDocuments({ status: "Shipped" }),
            OrderModel.countDocuments({ status: "Delivered" }),
            ProductModel.distinct("category"),
            ProductModel.countDocuments(),
            ProductModel.countDocuments({ stock: 0 }),
            allOrderPromise,
            UserModel.find({}).select(["dob"]),
            UserModel.countDocuments({ role: "admin" }),
            UserModel.countDocuments({ role: "user" })
        ])

        const orderFulfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
            allOrders
        }

        const productCategories = await getInventories({ categories, productsCount })

        const stockAvailability = {
            inStock: productsCount - productsOutOfStock,
            outOfStock: productsOutOfStock
        }

        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0)
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0)
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharge || 0), 0)
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0)
        const marketingCost = Math.round(grossIncome * (30 / 100))
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        }

        const usersAgeGroups = {
            teen: allUsers.filter(user => user.age < 20).length,
            adult: allUsers.filter(user => user.age > 20 && user.age < 40).length,
            old: allUsers.filter(user => user.age > 20 && user.age > 40).length
        }

        const adminCustomer = {
            admins,
            customers
        }

        const pieCharts = {
            orderFulfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroups,
            adminCustomer
        }
        res.status(200).json({
            success: true,
            message: "Admin dashboard's pie charts retrieved successfully",
            pieCharts
        })
    } catch (error) {
        console.log("err is", error)
        return next(new ErrorHandler("Failed to getting admin dashboard's pie charts", 400))
    }
}


// admin dashboard's bar charts
export const getBarCharts = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        const today = new Date()
        const sixMonthAgo = new Date()
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)

        const twelveMonthAgo = new Date()
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12)

        const lastSixMonthUsersPromise = UserModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt")
        const lastSixMonthProductsPromise = ProductModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt")
        const lastTwelveMonthOrdersPromise = OrderModel.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today
            }
        }).select("createdAt")

        const [
            lastSixMonthUsers,
            lastSixMonthProducts,
            lastTwelveMonthOrders
        ] = await Promise.all([
            lastSixMonthProductsPromise,
            lastSixMonthUsersPromise,
            lastTwelveMonthOrdersPromise
        ])

        const usersCount = getChartData({
            length: 6,
            today,
            docArr: lastSixMonthUsers,
        })
        const productsCount = getChartData({
            length: 6,
            today,
            docArr: lastSixMonthProducts
        })
        const ordersCount = getChartData({
            length: 12,
            today,
            docArr: lastTwelveMonthOrders
        })

        const barCharts = {
            users: usersCount,
            products: productsCount,
            orders: ordersCount
        }
        res.status(200).json({
            success: true,
            message: "Admin dashboard's bar charts retrieved successfully",
            barCharts
        })

    } catch (error) {
        return next(new ErrorHandler("Failed to getting admin dashboard's bar charts", 400))
    }
}

// admin dashboard's line charts
export const getLineCharts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // let lineCharts
        // const key = "admin-line-charts"

        // if (dataCaching.has(key)) {
            // lineCharts = JSON.parse(dataCaching.get(key) as string)
        // } else {
            const today = new Date()

            const twelveMonthAgo = new Date()
            twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12)

            const baseQuery = {
                createdAt: {
                    $gte: twelveMonthAgo,
                    $lte: today
                }
            }

            const [
                lastTwelveMonthUsers,
                lastTwelveMonthProducts,
                lastTwelveMonthOrders
            ] = await Promise.all([
                UserModel.find(baseQuery).select("createdAt"),
                ProductModel.find(baseQuery).select("createdAt"),
                OrderModel.find(baseQuery).select(["createdAt", "discount", "total"])
            ])

            const usersCount = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthUsers,
            })
            const productsCount = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthProducts
            })
            const discount = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthOrders,
                property: "discount"
            })
            const revenue = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthOrders,
                property: "total"
            })


            const lineCharts = {
                users: usersCount,
                products: productsCount,
                discount,
                revenue
            }
            // dataCaching.set(key, JSON.stringify(lineCharts))
        // }
        res.status(200).json({
            success: true,
            message: "Admin dashboard's line charts retrieved successfully",
            lineCharts
        })

    } catch (error) {
        console.log("erri issss", error)
        return next(new ErrorHandler("Failed to getting admin dashboard's line charts", 400))
    }
}