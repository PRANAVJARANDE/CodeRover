import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Interview } from "../models/interview.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const verificationUploads = new Map();

const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < 5; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
};

const exactEmailRegex = (email) => {
    return new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,'i');
};

const createInterview = asyncHandler(async(req,res)=>{
    const {interviewerEmail,intervieweeEmail,scheduledAt}=req.body;

    if(!interviewerEmail || !intervieweeEmail || !scheduledAt)
    {
        return res.status(400).json(new ApiResponse(400,null,"All fields are required"));
    }

    const interviewer=await User.findOne({email:exactEmailRegex(interviewerEmail)}).select("-password -refreshToken");
    const interviewee=await User.findOne({email:exactEmailRegex(intervieweeEmail)}).select("-password -refreshToken");

    if(!interviewer && !interviewee)
    {
        return res.status(404).json(new ApiResponse(404,null,"Interviewer and interviewee emails do not exist"));
    }

    if(!interviewer)
    {
        return res.status(404).json(new ApiResponse(404,null,"Interviewer email does not exist"));
    }

    if(!interviewee)
    {
        return res.status(404).json(new ApiResponse(404,null,"Interviewee email does not exist"));
    }

    const date=new Date(scheduledAt);
    if(Number.isNaN(date.getTime()))
    {
        return res.status(400).json(new ApiResponse(400,null,"Invalid scheduled date/time"));
    }

    let roomId=generateRoomId();
    while(await Interview.findOne({roomId}))
    {
        roomId=generateRoomId();
    }

    const interview=await Interview.create({
        roomId,
        interviewer:interviewer._id,
        interviewee:interviewee._id,
        scheduledAt:date,
        createdBy:req.user._id,
    });

    const populatedInterview=await Interview.findById(interview._id)
        .populate("interviewer","fullname email avatar username")
        .populate("interviewee","fullname email avatar username")
        .populate("createdBy","fullname email avatar username");

    return res.status(201).json(new ApiResponse(201,populatedInterview,"Interview scheduled successfully"));
});

const getMyInterviews = asyncHandler(async(req,res)=>{
    const interviews=await Interview.find({
        $or:[
            {interviewer:req.user._id},
            {interviewee:req.user._id},
        ]
    })
    .sort({scheduledAt:1})
    .populate("interviewer","fullname email avatar username")
    .populate("interviewee","fullname email avatar username")
    .populate("createdBy","fullname email avatar username");

    return res.status(200).json(new ApiResponse(200,interviews,"Scheduled interviews fetched successfully"));
});

const getInterviewByRoomId = asyncHandler(async(req,res)=>{
    const {roomId}=req.params;
    const interview=await Interview.findOne({roomId})
        .populate("interviewer","fullname email avatar username")
        .populate("interviewee","fullname email avatar username")
        .populate("createdBy","fullname email avatar username");

    if(!interview)
    {
        return res.status(404).json(new ApiResponse(404,null,"Interview not found"));
    }

    const userId=req.user._id.toString();
    const isParticipant=interview.interviewer._id.toString()===userId || interview.interviewee._id.toString()===userId;
    if(!isParticipant)
    {
        return res.status(403).json(new ApiResponse(403,null,"You are not part of this interview"));
    }

    return res.status(200).json(new ApiResponse(200,interview,"Interview fetched successfully"));
});

const updateInterviewRoomState = asyncHandler(async(req,res)=>{
    const {roomId}=req.params;
    const {code,language,question,cases,exampleCasesExecution}=req.body;

    const interview=await Interview.findOne({roomId});

    if(!interview)
    {
        return res.status(404).json(new ApiResponse(404,null,"Interview not found"));
    }

    const userId=req.user._id.toString();
    const isParticipant=interview.interviewer.toString()===userId || interview.interviewee.toString()===userId;
    if(!isParticipant)
    {
        return res.status(403).json(new ApiResponse(403,null,"You are not part of this interview"));
    }

    const roomState={
        ...interview.roomState?.toObject?.(),
        ...(typeof code === "string" ? {code} : {}),
        ...(typeof language === "string" ? {language} : {}),
        ...(typeof question === "string" ? {question} : {}),
        ...(Array.isArray(cases) ? {cases} : {}),
        ...(Object.prototype.hasOwnProperty.call(req.body,"exampleCasesExecution") ? {exampleCasesExecution} : {}),
    };

    interview.roomState=roomState;
    await interview.save();

    return res.status(200).json(new ApiResponse(200,interview.roomState,"Room state saved successfully"));
});

const uploadInterviewVerificationVideo = asyncHandler(async(req,res)=>{
    const {roomId,code,requestId,duration}=req.body;

    if(!roomId || !code || !requestId)
    {
        return res.status(400).json(new ApiResponse(400,null,"Room, code, and request id are required"));
    }

    const videoLocalPath=req.file?.path;
    if(!videoLocalPath)
    {
        return res.status(400).json(new ApiResponse(400,null,"Verification video is required"));
    }

    const uploadResponse=await uploadOnCloudinary(videoLocalPath);
    if(!uploadResponse)
    {
        return res.status(500).json(new ApiResponse(500,null,"Unable to upload verification video"));
    }

    const verificationVideo={
        requestId,
        roomId,
        code,
        url:uploadResponse.secure_url || uploadResponse.url,
        publicId:uploadResponse.public_id,
        duration:Number(duration) || uploadResponse.duration || null,
        uploadedAt:new Date().toISOString(),
    };

    verificationUploads.set(requestId,verificationVideo);

    return res.status(200).json(new ApiResponse(200,verificationVideo,"Verification video uploaded successfully"));
});

const getInterviewVerificationUpload = asyncHandler(async(req,res)=>{
    const {requestId}=req.params;
    const verificationVideo=verificationUploads.get(requestId);

    if(!verificationVideo)
    {
        return res.status(404).json(new ApiResponse(404,null,"Verification video not uploaded yet"));
    }

    return res.status(200).json(new ApiResponse(200,verificationVideo,"Verification video fetched successfully"));
});

export {createInterview,getMyInterviews,getInterviewByRoomId,updateInterviewRoomState,uploadInterviewVerificationVideo,getInterviewVerificationUpload};
