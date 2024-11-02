import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import NodeCache from "node-cache";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
import passport from "passport";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

// Check necessary environment variables
if (!process.env.STRIPE_KEY) {
    console.error("STRIPE_KEY is missing in environment variables");
    process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary configuration is incomplete in environment variables");
    process.exit(1);
}

// all routes
import userRouter from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import adminStatsRoute from "./routes/adminStatsRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";
import subscriberRoute from "./routes/subscriberRoute.js";

import { connectDB } from "./utils/connectDB.js";
import { errorsMiddleware } from "./middlewares/errors.js";

const port = process.env.PORT || 3001;
const stripeKey = process.env.STRIPE_KEY;

export const stripe = new Stripe(stripeKey);
export const dataCaching = new NodeCache();

const app = express();

app.use(cors({
    origin: ["https://vistaralux.vercel.app", "http://localhost:5175"],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Root route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is running perfectly.",
        availableRoutes: ["/api/v1/user", "/api/v1/product", "/api/v1/order", "/api/v1/payment", "/api/v1/admin"]
    });
});

// Use routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/admin", adminStatsRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/subscribe", subscriberRoute);

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONT_END_URL}/sign-in`
    }),
    (req, res) => {
        res.redirect('/');
    }
);

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Error handling middleware
app.use(errorsMiddleware);

// Start the server only if DB is connected successfully
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Express server is running on port: http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    });






// import express, { Request, Response } from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import NodeCache from "node-cache";
// import morgan from "morgan";
// import Stripe from "stripe";
// import cors from "cors";
// import passport from "passport";
// import { v2 as cloudinary } from "cloudinary";
// import { VercelRequest, VercelResponse } from '@vercel/node'; 

// dotenv.config();

// // Check necessary environment variables
// if (!process.env.STRIPE_KEY) {
//     console.error("STRIPE_KEY is missing in environment variables");
//     process.exit(1);
// }
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//     console.error("Cloudinary configuration is incomplete in environment variables");
//     process.exit(1);
// }

// // all routes
// import userRouter from "./routes/userRoute.js";
// import productRoute from "./routes/productRoute.js";
// import orderRoute from "./routes/orderRoute.js";
// import paymentRoute from "./routes/paymentRoute.js";
// import adminStatsRoute from "./routes/adminStatsRoute.js";
// import wishlistRoute from "./routes/wishlistRoute.js";

// import { connectDB } from "./utils/connectDB.js";
// import { errorsMiddleware } from "./middlewares/errors.js";

// const port = process.env.PORT || 3001;
// const stripeKey = process.env.STRIPE_KEY;

// export const stripe = new Stripe(stripeKey);
// export const dataCaching = new NodeCache();

// const app = express();

// app.use(cors({
//     origin: ["https://vistaralux.vercel.app", "http://localhost:5173"],
//     methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
//     credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan("dev"));

// // Root route
// app.get("/", (req: Request, res: Response) => {
//     res.status(200).json({
//         success: true,
//         message: "Server is running perfectly.",
//         availableRoutes: ["/api/v1/user", "/api/v1/product", "/api/v1/order", "/api/v1/payment", "/api/v1/admin"]
//     });
// });

// // Use routes
// app.use("/api/v1/user", userRouter);
// app.use("/api/v1/product", productRoute);
// app.use("/api/v1/order", orderRoute);
// app.use("/api/v1/payment", paymentRoute);
// app.use("/api/v1/admin", adminStatsRoute);
// app.use("/api/v1/wishlist", wishlistRoute);

// // Google OAuth routes
// app.get('/auth/google',
//     passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
// );

// app.get('/auth/google/callback',
//     passport.authenticate('google', {
//         session: false,
//         failureRedirect: `${process.env.FRONT_END_URL}/sign-in`
//     }),
//     (req, res) => {
//         res.redirect('/');
//     }
// );

// // Cloudinary configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
//     api_key: process.env.CLOUDINARY_API_KEY as string,
//     api_secret: process.env.CLOUDINARY_API_SECRET as string,
// });

// // Error handling middleware
// app.use(errorsMiddleware);

// // Connect DB and export app as a Vercel function
// connectDB()
//     .then(() => {
//             app.listen(port, () => {
//                 console.log(`Express server is running on port: http://localhost:${port}`);
//             });
//         })
//     .then(() => {
//         console.log(`Database connected successfully`);
//     })
//     .catch((error: Error) => {
//         console.error("Database connection failed:", error.message);
//         process.exit(1);
//     });

// // Vercel-compatible handler function
// const startServer = (req: VercelRequest, res: VercelResponse) => {
//     return app(req, res);
// };

// export default startServer;