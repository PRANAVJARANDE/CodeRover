import {Problem} from "../models/problem.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createproblem = asyncHandler(async (req, res) => {
    const { title, description, difficulty, constraints, example_cases, test_cases, solution,input_format,output_format } = req.body;
    const problem = new Problem({
        title,
        description,
        difficulty,
        constraints,
        example_cases,
        test_cases,
        solution,
        input_format,
        output_format
    });
    const savedProblem = await problem.save();
    if(!savedProblem)return res.status(500).json(new ApiResponse(500,null,"Server Errror"));
    return res.status(200).json(new ApiResponse(200,savedProblem,"Problem created successfully"));
});

const getAllproblems = asyncHandler(async (req, res) => {
    const problems = await Problem.aggregate([
        {
            $addFields: {
                sortOrder: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$difficulty", "easy"] }, then: 1 },
                            { case: { $eq: ["$difficulty", "medium"] }, then: 2 },
                            { case: { $eq: ["$difficulty", "hard"] }, then: 3 }
                        ],
                        default: 4
                    }
                }
            }
        },
        {
            $sort: {
                sortOrder: 1 
            }
        },
        {
            $project: {
                title: 1,
                difficulty: 1
            }
        },
        
    ]);

    res.status(200).json(new ApiResponse(true, problems, "Problems retrieved successfully"));
});


const getproblemById = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const problem = await Problem.findById(id).select('-test_cases');
    if (!problem) return res.status(404).json(new ApiResponse(false,null,"Problem not found"));
    return res.status(200).json(new ApiResponse(true, problem,"Problem retrieved successfully"));
});

const deleteproblemById = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) return res.status(404).json(new ApiResponse(false,null,"Problem not found"));
    return res.status(200).json(new ApiResponse(true, problem,"Problem Deleted successfully"));
});


export {createproblem,getproblemById,getAllproblems,deleteproblemById}