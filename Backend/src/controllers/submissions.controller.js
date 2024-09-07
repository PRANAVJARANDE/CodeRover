import {Submission} from '../models/submission.model.js'
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from 'mongoose';

const getMySubmissions = asyncHandler(async(req, res)=>{
    const {problem_id}=req.body;
    let match={
        madeBy:req.user._id,
    }
    if(problem_id)match.problem= new mongoose.Types.ObjectId(problem_id);
    else match.status=true;
    const submissions = await Submission.aggregate([
        {
            $match: match
        },
        {
            $lookup: {
                from: 'problems',
                localField: 'problem',
                foreignField: '_id',
                as: 'problem',
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            title:1,
                            difficulty:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                problem: {
                    $first: "$problem"
                }
            }
        },
        
        {
            $sort: { createdAt: -1 },
        },
    ]);
    if (submissions.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Submissions"));
    }
    return res.status(200).json(new ApiResponse(200, submissions, "Submissions fetched Successfully"));
});


const getSuccessfullySolvedProblems=async(req,res)=>{
    try {
        const solvedProblems=await Submission.aggregate([
            {
                $match:{
                    madeBy:req.user._id,
                    status:true,
                }
            },
            {
                $group: {
                    _id: "$problem"      
                }
            },
            {
                $lookup: {               
                    from: "problems",    
                    localField: "_id",   
                    foreignField: "_id", 
                    as: "problemDetails", 
                    pipeline:[
                        {
                            $project:{
                                title:1,
                                _id:1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$problemDetails" 
            },
            {
                $project: {
                    _id: 0,                
                    problem: "$problemDetails" 
                }
            }
            
        ]);
        return res.status(200).json(new ApiResponse(200,solvedProblems,"Solved Problems Fetched"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,[],"Server Error"));
    }
}


export {getMySubmissions,getSuccessfullySolvedProblems}