import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"

function getExtension(language) {
    switch (language) {
        case 'cpp': return 'cpp';
        case 'python': return 'py';
        case 'java': return 'java';
        default: return 'txt';
    }
}

function getDockerCommand(language, filePath, input) {
    switch (language) {
        case 'cpp':
            return `docker run --rm -v ${filePath}:/app/code.cpp gcc:latest g++ /app/code.cpp -o /app/code && /app/code < ${input}`;
        case 'python':
            return `docker run --rm -v ${filePath}:/app/code.py python:latest python /app/code.py < ${input}`;
        case 'java':
            return `docker run --rm -v ${filePath}:/app/Main.java openjdk:latest javac /app/Main.java && java -cp /app Main < ${input}`;
        default:
            return '';
    }
}

const runCode = asyncHandler(async (req, res) => {
    try {
        const {language,code,input}=req.body;
        const filePath = path.join(__dirname, `code.${getExtension(language)}`);
        fs.writeFileSync(filePath, code);
        
        const command = getDockerCommand(language, filePath, input);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(200).json(new ApiResponse(200,{ success: false, output: stderr },"Code executed Successfully"));
            }
            return res.status(200).json(new ApiResponse(200,{ success: true, output: stdout },"Code executed Successfully"));
        });
    
    } catch (error) {
        return res.status(200).json(new ApiResponse(500,{ success: false, output: "" },"SERVER ERROR"));
    }
});

export {runCode}