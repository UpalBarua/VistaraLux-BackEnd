// import { NextFunction, Request, Response } from "express";
// import ErrorHandler from "../utils/errorHandler.js";
// import jwt from "jsonwebtoken";
// import { UserModel } from "../models/userModel.js";

// // Interface for JWT payload
// interface JwtPayload {
//     _id: string;
//     email: string;
// }

// // Middleware to check if user is authenticated
// export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Extract the token from cookies
//         const token = req.cookies?.accessToken;

//         // If token is missing, user is not authenticated
//         if (!token) {
//             return next(new ErrorHandler("You need to be logged in to access this resource", 401));
//         }

//         // Verify the token using the secret key
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;

//         // Find the user by ID decoded from the token
//         const user = await UserModel.findById(decoded._id);

//         // If user doesn't exist or token is invalid
//         if (!user) {
//             return next(new ErrorHandler("User not found or token is invalid", 401));
//         }

//         // Attach user information to the request object for access in subsequent middlewares or controllers
//         req.user = user; // You might want to define a type for req.user

//         // Move to the next middleware
//         next();
//     } catch (error) {
//         console.error("Authentication error:", error); // Log error for debugging
//         return next(new ErrorHandler("Authentication failed. Please login again.", 401));
//     }
// };

// // Middleware to check if user is admin
// export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Ensure the user is authenticated
//         if (!req.user) {
//             return next(new ErrorHandler("Please log in first", 401));
//         }

//         // Check if the user has admin role
//         if (req.user.role !== "admin") {
//             return next(new ErrorHandler("Only admin can take administrative action. You're not an admin", 403));
//         }

//         // Proceed to the next middleware
//         next();
//     } catch (error) {
//         console.error("Admin check error:", error); // Log error for debugging
//         return next(new ErrorHandler("Authorization failed", 403));
//     }
// };




//@ts-nocheck

import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

// Interface for JWT payload
interface JwtPayload {
    _id: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                email: string;
                role: string;
            };
        }
    }
}

// Middleware to check if user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return next(new ErrorHandler("You need to be logged in to access this resource", 401));
        }

        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
        } catch (err) {
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
    } catch (error) {
        console.error("Authentication error:", error);
        return next(new ErrorHandler("Authentication failed. Please login again.", 401));
    }
};

// Middleware to check if user is admin
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new ErrorHandler("Please log in first", 401));
        }

        if (req.user.role !== "admin") {
            return next(new ErrorHandler("Only admin can take administrative action. You're not an admin", 403));
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        return next(new ErrorHandler("Authorization failed", 403));
    }
};