import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getExtension(language) {
    switch (language) {
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'python': return 'py';
        case 'java': return 'java';
        default: return 'txt';
    }
}

export const saveCodeFiles = (code,language,filename) => {
    try {
        const codeFilePath = path.join(__dirname, `../../${filename}.${getExtension(language)}`);
        fs.writeFileSync(codeFilePath, code);
        console.log(`Code saved successfully with filename: ${filename}`);
    } catch (error) {
        console.error("Error saving code and user input:", error);
        throw new ApiError(500,"Something went wrong while generating file");
    }
};

export const saveInputFiles = (userInput,filename) => {
    try {
        const userInputFilePath = path.join(__dirname, `../../${filename}.txt`);
        fs.writeFileSync(userInputFilePath, userInput);
        console.log(`User input saved successfully with filename: ${filename}`);
        return filename; 
    } catch (error) {
        console.error("Error saving user input:", error);
        throw new ApiError(500,"Something went wrong while generating file");
    }
};


