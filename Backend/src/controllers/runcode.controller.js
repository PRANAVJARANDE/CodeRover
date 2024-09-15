import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCode, validateInput } from "../middlewares/validatecode.middleware.js";
import { saveCodeFiles, saveInputFiles } from "../middlewares/saveCodeFile.middleware.js";
import { runCompilerDockerContainer, runExampleCasesDockerContainer, runTestCasesDokerContainer } from "../middlewares/runDocker.middleware.js";
import { v4 as uuidv4 } from 'uuid';
import { Problem } from "../models/problem.model.js";
import {Submission} from '../models/submission.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

function getExtension(language) {
    switch (language) {
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'python': return 'py';
        case 'java': return 'java';
        default: 
            throw new ApiError(400,"Unsupported Language");
    }
}

const runCode = asyncHandler(async (req, res) => {
    const {language,code,input} = req.body;
    let filename;
    try {
        validateCode(language,code);
        validateInput(language,input);
        console.log("code and input is validated");
        filename = language==='java' ? 'Main':uuidv4();
        saveCodeFiles(code,language,filename);
        saveInputFiles(input,filename);
        runCompilerDockerContainer(filename,language,res);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400,error,"Error"));
    }
});

const run_example_cases=asyncHandler(async(req,res)=>{
    const {language,code,example_cases}=req.body;
    let filename;
    try {
        validateCode(language,code);
        example_cases.map(x => {
            validateInput(language,x?.input);
        });
        console.log("code and input is validated");
        filename = language==='java' ? 'Main':uuidv4();
        saveCodeFiles(code,language,filename);
        const response=await runExampleCasesDockerContainer(example_cases,language,filename,res);
        return res.status(response.statusCode).json(new ApiResponse(response.statusCode,response,"Executed Successfully"));
    } catch (error) {
        throw new ApiError(500,"Server error");
    }
});

const runtestcases = asyncHandler(async (req, res) => {
    const { language, problem_id, code } = req.body;
    let filename;
    try {
        validateCode(language, code);
        const problem = await Problem.findById(problem_id).select("test_cases");
        problem.test_cases.forEach(x => {
            validateInput(language, x.input);
        });
        console.log("code and input is validated");
        filename = language === 'java' ? 'Main' : uuidv4();
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
        throw new ApiError(500,"Server error");
    }
});
 
export { runCode, run_example_cases, runtestcases}