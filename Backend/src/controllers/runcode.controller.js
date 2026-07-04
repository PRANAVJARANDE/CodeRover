import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCode, validateInput } from "../middlewares/validatecode.middleware.js";
import { saveCodeFiles, saveInputFiles } from "../middlewares/saveCodeFile.middleware.js";
import { runCompilerDockerContainer, runExampleCasesDockerContainer, runTestCasesDokerContainer } from "../middlewares/dockerExecutor.middleware.js";
import { v4 as uuidv4 } from 'uuid';
import { Problem } from "../models/problem.model.js";
import {Submission} from '../models/submission.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const runCode = asyncHandler(async (req, res) => {
    const {language,code,input} = req.body;
    let filename;
    try {
        validateCode(language,code);
        validateInput(language,input);
        console.log("code and input is validated");
        filename = uuidv4();
        saveCodeFiles(code,language,filename);
        saveInputFiles(input,filename);
        await runCompilerDockerContainer(filename,language,res);
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json(new ApiResponse(statusCode,null,error.message || "Error"));
    }
});

const run_example_cases=asyncHandler(async(req,res)=>{
    const {language,code,example_cases}=req.body;
    let filename;
    try {
        if(!Array.isArray(example_cases))
        {
            throw new ApiError(400,"Example cases must be an array");
        }
        validateCode(language,code);
        example_cases.forEach(x => {
            validateInput(language,x?.input);
        });
        console.log("code and input is validated");
        filename = uuidv4();
        saveCodeFiles(code,language,filename);
        const response=await runExampleCasesDockerContainer(example_cases,language,filename,res);
        return res.status(response.statusCode).json(new ApiResponse(response.statusCode,response,"Executed Successfully"));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json(new ApiResponse(statusCode,null,error.message || "Server error"));
    }
});

const runtestcases = asyncHandler(async (req, res) => {
    const { language, problem_id, code } = req.body;
    let filename;
    try {
        validateCode(language, code);
        const problem = await Problem.findById(problem_id).select("test_cases");
        if(!problem)
        {
            throw new ApiError(404,"Problem not found");
        }
        problem.test_cases.forEach(x => {
            validateInput(language, x.input);
        });
        console.log("code and input is validated");
        filename = uuidv4();
        saveCodeFiles(code, language, filename);
        
        const submissionStatus = await runTestCasesDokerContainer(problem?.test_cases, language, filename);
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
        return res.status(submissionStatus.statusCode).json(new ApiResponse(submissionStatus.statusCode, submissionStatus, "Executed Successfully"));

    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json(new ApiResponse(statusCode,null,error.message || "Server error"));
    }
});
 
export { runCode, run_example_cases, runtestcases}
