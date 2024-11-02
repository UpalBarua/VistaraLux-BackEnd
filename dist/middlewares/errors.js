export const errorsMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (err.name === "CastError")
        err.message = "Invalid Id";
    res.status(statusCode).json({
        success: false,
        message,
    });
};
