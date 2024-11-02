import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/errorHandler.js';

export const errorsMiddleware = (
    err: ErrorHandler, 
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500; 
    const message = err.message || "Internal Server Error"; 

    if (err.name === "CastError") err.message = "Invalid Id"

    res.status(statusCode).json({
        success: false,
        message,
    });
};