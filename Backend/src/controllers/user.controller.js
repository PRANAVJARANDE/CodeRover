import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});     
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went Wrong");
    }
};

const registerUser= asyncHandler( async (req,res)=>{
    const {username,fullname,email,password}=req.body;
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    });
    if(existedUser)return res.status(400).json(new ApiResponse(400,null,"User already exists"));
    const user=await User.create({fullname,email,password,username,avatar:'https://res.cloudinary.com/dyyta5lri/image/upload/v1724514263/defaultuser_l0d3kk.png'});
    const createUser= await User.findById(user._id).select("-password -refreshToken");
    if(!createUser)return res.status(400).json(new ApiResponse(400,null,"Server Error"));
    return res.status(200).json(new ApiResponse(200,createUser,"Registered Successfully"))
});

const loginUser= asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user)return res.status(400).json(new ApiResponse(400,null,"Invalid Email"));
    
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid)res.status(400).json(new ApiResponse(400,null,"Invalid password"));
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,          
        secure:true ,            
        sameSite:'strict'
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"USER LOGGED IN SUCCESSFULLY"))
});

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1
            }
        },
        {new : true}
    )

    const options={
        httpOnly:true,          
        secure:true ,       
        sameSite:'strict'
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully"))
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken)throw new ApiError(401,"Unauthorized Request");
    
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user)
        {
            throw new ApiError(401,"INVALID REFRESH TOKEN");
        }
        if(incomingRefreshToken!==user?.refreshToken)
        {   
            throw new ApiError(401,"REFRESH TOKEN EXPIRED OR USED");
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id);
        const options={
            httpOnly:true,          
            secure:true ,         
            sameSite: 'Strict'
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newrefreshToken
                },
                "ACCESS TOKEN REFRESHED SUCCESSFULLY"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "INVALID REFRESH TOKEN");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) return res.status(400).json(new ApiResponse(400, null, "User not authenticated"));
    const curruser = await User.aggregate([
        {
            $match: {
                username: req.user.username
            }
        },
        {
            $lookup: {
                from: 'submissions',
                localField: '_id',
                foreignField: 'madeBy',
                as: 'mySubmissions',
                pipeline: [
                    {
                        $match: {
                            status: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'problems',
                            localField: 'problem',
                            foreignField: '_id',
                            as: 'problemDetails',
                            pipeline: [
                                {
                                    $project: {
                                        difficulty: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            difficulty: {
                                $first: "$problemDetails.difficulty"
                            }
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: 'tweets',
                localField: '_id',
                foreignField: 'owner',
                as: 'mytweets',
            }
        },
        {
            $addFields: {
                easyCount: {
                    $size: {
                        $filter: {
                            input: "$mySubmissions",
                            as: "submission",
                            cond: { $eq: ["$$submission.difficulty", "easy"] }
                        }
                    }
                },
                mediumCount: {
                    $size: {
                        $filter: {
                            input: "$mySubmissions",
                            as: "submission",
                            cond: { $eq: ["$$submission.difficulty", "medium"] }
                        }
                    }
                },
                hardCount: {
                    $size: {
                        $filter: {
                            input: "$mySubmissions",
                            as: "submission",
                            cond: { $eq: ["$$submission.difficulty", "hard"] }
                        }
                    }
                }
            }
        }
    ]);
    if(curruser?.length==0)return res.status(400).json(new ApiResponse(400, {}, "User Does Not exist"));
    return res.status(200).json(new ApiResponse(200, curruser[0], "User Fetched Successfully"));
});

const updateAvatar =asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"Avatar updated Successfully"));
});

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,updateAvatar};