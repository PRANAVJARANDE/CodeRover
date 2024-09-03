import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCode } from "../middlewares/validatecode.middleware.js";
import { saveCodeFiles } from "../middlewares/saveCodeFile.middleware.js";
import { runCompilerDockerContainer } from "../middlewares/runDocker.middleware.js";

const runCode = asyncHandler(async (req, res) => {
    const {language,code,input} = req.body;
    try {
        validateCode(language,code,input);
        console.log("code is validated");
        const filename=saveCodeFiles(code,input,language);
        runCompilerDockerContainer(filename,language,res);
    } catch (error) {
        console.error(`Validation error for ${language}: ${error.message}`);
    }
});

export { runCode };