import { asyncHandler } from "../utils/asyncHandler.js";
import { runCompilerDockerContainer, runExampleCasesDockerContainer, runTestCasesDokerContainer } from "../middlewares/dockerExecutor.middleware.js";
import { Problem } from "../models/problem.model.js";
import {Submission} from '../models/submission.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { cleanupExecutionJobs } from "../middlewares/saveCodeFile.middleware.js";

const sendCompilerResponse = (res,response) => {
    return res.status(response.httpStatusCode).json(new ApiResponse(response.statusCode,response.data,response.message));
};

const sendCaseResponse = (res,response) => {
    return res.status(response.statusCode).json(new ApiResponse(response.statusCode,response,"Executed Successfully"));
};

const getRequestExecutionJobs = (req) => {
    if(req.executionJobs) return Array.isArray(req.executionJobs) ? req.executionJobs : [req.executionJobs];
    if(req.executionJob) return [req.executionJob];
    return [];
};

const loadProblemTestCases = asyncHandler(async(req,res,next) => {
    const problem = await Problem.findById(req.body.problem_id).select("test_cases");
    if(!problem)throw new ApiError(404,"Problem not found");
    req.problem = problem;
    next();
});

const runCode = asyncHandler(async (req, res) => {
    const response = await runCompilerDockerContainer(req.executionJob);
    return sendCompilerResponse(res,response);
});

const run_example_cases=asyncHandler(async(req,res)=>{
    const response=await runExampleCasesDockerContainer(req.executionJob);
    return sendCaseResponse(res,response);
});

const runtestcases = asyncHandler(async (req, res) => {
    const { language, problem_id, code } = req.body;
    const submissionStatus = await runTestCasesDokerContainer(req.executionJob);
    const status=(submissionStatus.data)? false:true;
    console.log("Submission Status: ",status);
    console.log("Status Code: ",submissionStatus.statusCode);
    await Submission.create({
        problem: problem_id,
        madeBy: req.user._id,
        status,
        code,
        language,
    });
    return sendCaseResponse(res,submissionStatus);
});

const handleCodeRunError = async(error,req,res,next) => {
    if(res.headersSent)
    {
        return next(error);
    }

    await cleanupExecutionJobs(getRequestExecutionJobs(req));
    const statusCode = error.statusCode || 500;
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode,null,error.message || "Server error"));
};
 
export { runCode, run_example_cases, runtestcases, loadProblemTestCases, handleCodeRunError}
