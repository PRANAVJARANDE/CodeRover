import { languageConfig } from "../config/language.config.js";
import { ApiError } from "./ApiError.js";

export const getLanguageConfig = (language) => {
    const config = languageConfig[language];
    if(!config)
    {
        throw new ApiError(400,"Unsupported Language");
    }
    return config;
};

export const normalizeExecutionCase = (testCase = {}) => ({
    input:testCase.input || "",
    expectedOutput:testCase.expectedOutput ?? testCase.output ?? "",
});
