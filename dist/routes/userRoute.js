//@ts-nocheck
import express from "express";
import { createUser, deleteUser, getUser, getUsers, loginUser, logoutUser, updateUserProfile } from "../controllers/userController.js";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
const router = express.Router();
// router.get("/check-auth", (req, res, next) => {
//      try {
//           if (!req.user) {
//                return res.status(401).json({ success: false, message: "User is not authenticated" });
//           }
//           res.status(200).json({
//                success: true,
//                message: "User is authenticated",
//                user: req.user
//           });
//      } catch (error) {
//           return next(new ErrorHandler("Oops! Unauthenticated", 400));
//      }
// });
router.get("/check-auth", (req, res, next) => {
    try {
        console.log("Authenticated user:", req.user); // Check if req.user exists
        if (!req.user) {
            return res.status(401).json({ success: false, message: "User is not authenticated" });
        }
        res.status(200).json({
            success: true,
            message: "User is authenticated",
            user: req.user,
        });
    }
    catch (error) {
        return next(new ErrorHandler("Oops! Unauthenticated", 400));
    }
});
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.post("/logout-user", isAuthenticated, logoutUser);
router.get("/all-user", isAuthenticated, adminOnly, getUsers);
router.route("/:id")
    .get(isAuthenticated, getUser)
    .put(isAuthenticated, updateUserProfile)
    .delete(isAuthenticated, adminOnly, deleteUser);
export default router;
