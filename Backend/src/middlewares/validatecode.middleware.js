import { ApiError } from "../utils/ApiError.js";

const MAX_CODE_BYTES = 64 * 1024;
const MAX_INPUT_BYTES = 64 * 1024;

const forbiddenWords = {
    c: ["system", "exec", "pipe", "malloc", "free", "realloc", "delete", "fork", "system("],
    cpp: ["system", "exec", "pipe", "malloc", "free", "realloc", "delete", "popen", "fork", "unistd.h"],
    java: ["Runtime.exec", "ProcessBuilder", "Process", "getRuntime()", "exec(", "start()"],
    python: [
        "subprocess.run", "os.system", "os.spawn", "open", "read", "write", 
        "import os", "import subprocess", "from os import", "from subprocess import"
    ]
};

const assertStringWithinLimit = (label, value, maxBytes, { allowEmpty = true } = {}) => {
    if(typeof value !== "string")
    {
        throw new ApiError(400,`${label} must be a string`);
    }

    if(!allowEmpty && !value.trim())
    {
        throw new ApiError(400,`${label} is required`);
    }

    if(Buffer.byteLength(value,"utf8") > maxBytes)
    {
        throw new ApiError(400,`${label} is too large`);
    }
};

const validateCode = (language, code) => {
    const wordsToCheck = forbiddenWords[language];
    if (!wordsToCheck) {
        throw new ApiError(400,"Unsupported Language");
    }

    assertStringWithinLimit("Code",code,MAX_CODE_BYTES,{allowEmpty:false});

    for (const word of wordsToCheck) {
        if (code.includes(word)) {
            throw new ApiError(400,`${language.toUpperCase()} code contains forbidden word: ${word}`);
        }
    }
};

const validateInput = (language, userInput) => {
    const wordsToCheck = forbiddenWords[language];
    if (!wordsToCheck) {
        throw new ApiError(400,"Unsupported Language");
    }

    if(userInput === undefined || userInput === null)
    {
        return;
    }

    assertStringWithinLimit("User input",userInput,MAX_INPUT_BYTES);

    for (const word of wordsToCheck) {
        if (userInput && userInput.includes(word)) {
            throw new ApiError(400,`${language.toUpperCase()} user input contains forbidden word: ${word}`);
        }
    }
};

export {validateCode,validateInput};
