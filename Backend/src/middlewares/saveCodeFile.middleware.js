import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

export const saveCodeFiles = (code, userInput, language) => {
        try {
            const filename = language==='java' ? 'Main':uuidv4();
            const codeFilePath = path.join(__dirname, `../../${filename}.${getExtension(language)}`);
            const userInputFilePath = path.join(__dirname, `../../${filename}.txt`);
            fs.writeFileSync(codeFilePath, code);
            fs.writeFileSync(userInputFilePath, userInput);
            console.log(`Code and user input saved successfully with filename: ${filename}`);
            return filename; 
        } catch (error) {
            console.error("Error saving code and user input:", error);
            throw new ApiError(500,"Something went wrong while generating file");
        }
};

