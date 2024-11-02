//@ts-nocheck

import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport"
import ErrorHandler from "./errorHandler.js";
import { UserModel } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "./generateToken.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await UserModel.findOne({ email: profile._json.email })
            if (!user) {
                const currentDate = Date.now()
                const randomPass = String(Math.ceil(Math.random() * currentDate * 999 * 999))
                const hashedPassword = await bcrypt.hash(randomPass, 10)
                await UserModel.create({
                    name: profile._json.name,
                    email: profile._json.email,
                    password: hashedPassword
                })
            }

            // Generate and set JWT token
            const token = await generateToken(cb, { _id: profile._json.name!, email: profile._json.email! });
            return token
            // res.status(200).json({
            //     success: true,
            //     message: "Operation successful",
            //     data: user,
            //     token
            // })

        } catch (error) {
            console.log("Err siii", error)
            return new ErrorHandler("Operation Failed", 400)
        }
    }
));