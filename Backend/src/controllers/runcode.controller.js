import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCode, validateInput } from "../middlewares/validatecode.middleware.js";
import { saveCodeFiles, saveInputFiles } from "../middlewares/saveCodeFile.middleware.js";
import { runCompilerDockerContainer, runExampleCasesDockerContainer } from "../middlewares/runDocker.middleware.js";
import { v4 as uuidv4 } from 'uuid';

const runCode = asyncHandler(async (req, res) => {
    const {language,code,input} = req.body;
    try {
        validateCode(language,code);
        validateInput(language,input);
        console.log("code and input is validated");
        const filename = language==='java' ? 'Main':uuidv4();
        saveCodeFiles(code,language,filename);
        saveInputFiles(input,filename);
        runCompilerDockerContainer(filename,language,res);
    } catch (error) {
        console.error(`Validation error for ${language}: ${error.message}`);
    }
});

const run_example_cases=asyncHandler(async(req,res)=>{
    const {language,code,example_cases}=req.body;
    try {
        validateCode(language,code);
        example_cases.map(x => {
            validateInput(language,x?.input);
        });
        console.log("code and input is validated");
        const filename = language==='java' ? 'Main':uuidv4();
        saveCodeFiles(code,language,filename);
        runExampleCasesDockerContainer(example_cases,language,filename,res);
    } catch (error) {
        console.error(`Validation error for ${language}: ${error.message}`);
    }


})

export { runCode,run_example_cases };