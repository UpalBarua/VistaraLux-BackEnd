import { NextFunction, Request, Response } from "express";
import { SubscriberModel } from "../models/subscriberModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const doSubscribe = async (
    req: Request,
    res:Response,
    next:NextFunction
) => {
    try {
        const { name, email } = req.body
        console.log("data", name, email)
        console.log("req.body", req.body)
        if(!name || !email) return next(new ErrorHandler("Please enter your name and email to subscribe VistaraLux", 400))
        const isSubscribed = await SubscriberModel.findOne({email})
        if (isSubscribed) return next(new ErrorHandler("No need to, you've already subscription", 400))
        const subscriber = await SubscriberModel.create({ name, email })
        res.status(201).json({
            success: true,
            message: "Congrats! You've Subscribed to VistaraLux",
            subscriber
        })
    } catch (error) {
        console.log("Err is: ", error)
        return next(new ErrorHandler("Oops! Failed to do Subscribe", 500))
    }
}


export const allSubscriber = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscribers = await SubscriberModel.find({})

        if(subscribers.length < 1) return next(new ErrorHandler("Oops! There's no subscriber yet.", 404))

        res.status(200).json({
            success: true,
            message: "All Subscribers retrieved successfully",
            totalSubscribers: subscribers.length , 
            subscribers
        })
    } catch (error) {
        return next(new ErrorHandler("Oops! Failed to retrieved subscribers", 500))
    }
}