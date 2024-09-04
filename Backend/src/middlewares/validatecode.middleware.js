import { ApiError } from "../utils/ApiError.js";

const forbiddenWords = {
    c: ["system", "exec", "pipe", "malloc", "free", "realloc", "delete", "fork", "system("],
    cpp: ["system", "exec", "pipe", "malloc", "free", "realloc", "delete", "popen", "fork", "unistd.h"],
    java: ["Runtime.exec", "ProcessBuilder", "Process", "getRuntime()", "exec(", "start()"],
    python: [
        "subprocess.run", "os.system", "os.spawn", "open", "read", "write", 
        "import os", "import subprocess", "from os import", "from subprocess import"
    ]
};

const validateCode = (language, code) => {
    const wordsToCheck = forbiddenWords[language];
    if (!wordsToCheck) {
        throw new ApiError(400,"Unsupported Language");
    }

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

    for (const word of wordsToCheck) {
        if (userInput && userInput.includes(word)) {
            throw new ApiError(400,`${language.toUpperCase()} user input contains forbidden word: ${word}`);
        }
    }
};

export {validateCode,validateInput};
