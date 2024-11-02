// import { NextFunction, Request, Response } from "express";
// import ErrorHandler from "../utils/errorHandler.js";
// import jwt from "jsonwebtoken";
// import { UserModel } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";
// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return next(new ErrorHandler("You need to be logged in to access this resource", 401));
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        }
        catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return next(new ErrorHandler("Token has expired. Please log in again.", 401));
            }
            return next(new ErrorHandler("Invalid token. Please log in again.", 401));
        }
        const user = await UserModel.findById(decoded._id);
        if (!user) {
            return next(new ErrorHandler("User not found or token is invalid", 401));
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        return next(new ErrorHandler("Authentication failed. Please login again.", 401));
    }
};
// Middleware to check if user is admin
export const adminOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new ErrorHandler("Please log in first", 401));
        }
        if (req.user.role !== "admin") {
            return next(new ErrorHandler("Only admin can take administrative action. You're not an admin", 403));
        }
        next();
    }
    catch (error) {
        console.error("Admin check error:", error);
        return next(new ErrorHandler("Authorization failed", 403));
    }
};
