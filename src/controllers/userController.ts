import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { createNewUserReqBody, loginUserReqBody } from "../types/types.js";
import ErrorHandler from "../utils/errorHandler.js";
import { generateToken } from "../utils/generateToken.js";

// user registration
// export const createUser = async (
//     req: Request<{}, {}, createNewUserReqBody>,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { _id, name, email, password, photo, gender, dob } = req.body;

//         // Check if all required fields are provided
//         if (!_id || !name || !email || !password || !photo || !gender || !dob) {
//             return next(new ErrorHandler("Please fill all fields", 400));
//         }

//         // Check if the user already exists with _id
//         const isDuplicate_Id = await UserModel.findById({ _id })
//         if (isDuplicate_Id) {
//             return next(new ErrorHandler(`Duplicate user Id`, 409))
//         }

//         // Check if the user already exists with email
//         const isUserAlreadyExist = await UserModel.findOne({ email });
//         if (isUserAlreadyExist) {
//             return next(new ErrorHandler(`You're already registered with ${email}, please log in`, 409));
//         }

//         // Validate password length manually before hashing password
//         if (password.length < 6) {
//             return next(new ErrorHandler("Password must be at least 6 characters long", 400))
//         }

//         //hashing password
//         const hashedPassword = await bcrypt.hash(password, 10)

//         // Create new user if not exists
//         const createNewUser = await UserModel.create({
//             _id,
//             name,
//             email,
//             password:hashedPassword,
//             photo,
//             gender,
//             dob: new Date(dob)
//         });

//         res.status(201).json({
//             success: true,
//             message: `Welcome, ${createNewUser.name}`
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export const createUser = async (
    req: Request<{}, {}, createNewUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { _id, name, email, password } = req.body;
        console.log(_id, name, email, password)
        console.log("req body", req.body)

        // Check if required fields are provided
        // if (!_id || !name || !email || !password) {
        //     return next(new ErrorHandler("Please fill all fields", 400));
        // }

        // Check if the user already exists with _id
        const isDuplicate_Id = await UserModel.findById({ _id });
        if (isDuplicate_Id) {
            return next(new ErrorHandler(`Duplicate user Id`, 409));
        }

        // Check if the user already exists with email
        const isUserAlreadyExist = await UserModel.findOne({ email });
        if (isUserAlreadyExist) {
            return next(new ErrorHandler(`You're already registered with ${email}, please log in`, 409));
        }

        // Validate password length manually before hashing password
        if (password.length < 6) {
            return next(new ErrorHandler("Password must be at least 6 characters long", 400));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const createNewUser = await UserModel.create({
            _id,
            name,
            email,
            password: hashedPassword, // Store hashed password
        });

        res.status(201).json({
            success: true,
            message: `Welcome, ${createNewUser.name}`
        });
    } catch (error) {
        next(error);
    }
};



// update profile
// export const updateUserProfile = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { id } = req.params;
//         const {name, photo, gender, dob } = req.body;

//         // Find the user by ID
//         const user = await UserModel.findById(id);
//         if (!user) {
//             return next(new ErrorHandler("User not found", 404));
//         }

//         // Update fields if provided
//         if (name) user.name = name;
//         if (photo) user.photo = photo;
//         if (gender) user.gender = gender;
//         if (dob) user.dob = new Date(dob);

//         // Save updated user
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             data: user
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// export const updateUserProfile = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { id } = req.params;
//         console.log("iddddddd", id)
//         const { name, photo, gender, dob } = req.body;
//         console.log(req.body)

//         // Update user fields
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             id,
//             {
//                 $set: {
//                     ...(name && { name }),
//                     ...(photo && { photo }),
//                     ...(gender && { gender }),
//                     ...(dob && { dob: new Date(dob) })
//                 }
//             },
//             { new: true, runValidators: true } // Ensures validation and returns updated document
//         );

//         if (!updatedUser) {
//             return next(new ErrorHandler("User not found", 404));
//         }

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             data: updatedUser
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// import { Request, Response, NextFunction } from "express";
// import { UserModel } from "../models/userModel.js";
// import ErrorHandler from "../utils/errorHandler.js";
// 
// Update user profile (using multer to handle form-data and file upload)
export const updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // Find the user by ID
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Update fields if provided
        if (req.body.name) user.name = req.body.name;
        if (req.file) user.photo = req.file.path; // Save the photo path
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.dob) user.dob = new Date(req.body.dob);

        // Save updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};





// User Login 
export const loginUser = async (
    req: Request<{}, {}, loginUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        // Check if user exists with the given email
        const isUserExist = await UserModel.findOne({ email });
        if (!isUserExist) {
            return next(new ErrorHandler(`Account doesn't exist with: ${email}`, 404));
        }

        // Verify the provided password with the stored hashed password
        const isValidPassword = await bcrypt.compare(password, isUserExist.password);
        if (!isValidPassword) {
            return next(new ErrorHandler("Oops! You've entered incorrect password", 401));
        }


        // Generate and set JWT token
        const token = generateToken(res, {_id: isUserExist._id, email:isUserExist.email } );

        
        // Return success response
        res.status(200).json({
            success: true,
            message: `Welcome back, ${isUserExist.name}`,
            user: isUserExist,
            token, 
        });
    } catch (error) {
        next(error);
    }
};


// get users
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const users = await UserModel.find()
        if (users.length < 1) {
            return next(new ErrorHandler("Oops! There's no user yet", 400))
        }
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            totalUser: users.length,
            users
        });
    } catch (error) {
        next(error)
    }
}


// get user
export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            return next(new ErrorHandler("Invalid user Id", 401))
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        next(error)
    }
}


// delete user
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            return next(new ErrorHandler("Invalid user Id", 401))
        }
        await user.deleteOne()
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        next(error)
    }
}


// user logout
export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/" 
        })
        // Respond with success message
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        next(new ErrorHandler("An error occurred during logout.", 500));
    }
}