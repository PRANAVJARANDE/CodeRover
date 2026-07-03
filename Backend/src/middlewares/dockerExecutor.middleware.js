import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { languageConfig } from "../config/language.config.js";
import { runWithDockerQueue } from "../utils/dockerExecutionQueue.js";

const execFilePromise = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname,"../..");
const jobRoot = path.join(os.tmpdir(),"coderover");
const MAX_OUTPUT_BYTES = 64 * 1024;

const getConfig = (language) => {
    const config = languageConfig[language];
    if(!config)
    {
        throw new ApiError(400,"Unsupported Language");
    }
    return config;
};

const readSavedCode = async(filename, language) => {
    const config = getConfig(language);
    const sourcePath = path.join(backendRoot,`${filename}.${config.extension}`);
    return fs.readFile(sourcePath,"utf8");
};

const cleanupSavedFiles = async(filename, language) => {
    const config = getConfig(language);
    await Promise.allSettled([
        fs.rm(path.join(backendRoot,`${filename}.${config.extension}`),{force:true}),
        fs.rm(path.join(backendRoot,`${filename}.txt`),{force:true}),
    ]);
};

const truncateOutput = (value = "") => {
    if(Buffer.byteLength(value,"utf8") <= MAX_OUTPUT_BYTES)
    {
        return value;
    }
    return `${value.slice(0,MAX_OUTPUT_BYTES)}\n[Output truncated after 64KB]`;
};

const normalizeError = (error) => {
    const stderr = truncateOutput(error.stderr || "");
    const stdout = truncateOutput(error.stdout || "");

    if(error.killed || error.signal === "SIGTERM")
    {
        return {status:"timeout", output:stdout, error:"Time limit exceeded"};
    }

    if(stderr.includes("Command terminated") || stderr.toLowerCase().includes("timeout"))
    {
        return {status:"timeout", output:stdout, error:"Time limit exceeded"};
    }

    return {status:"error", output:stdout, error:stderr || error.message || "Execution failed"};
};

const runDockerJobNow = async({language,code,input,jobLabel}) => {
    const config = getConfig(language);
    const jobId = `${jobLabel}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
    const jobDir = path.join(jobRoot,jobId);

    await fs.mkdir(jobDir,{recursive:true});
    await fs.writeFile(path.join(jobDir,config.fileName),code || "","utf8");
    await fs.writeFile(path.join(jobDir,"input.txt"),input || "","utf8");

    const dockerArgs = [
        "run",
        "--rm",
        "--network","none",
        "--cpus","0.5",
        "--memory",config.memory,
        "--pids-limit","64",
        "--read-only",
        "--tmpfs","/tmp:rw,size=64m",
        "--security-opt","no-new-privileges",
        "--cap-drop","ALL",
        "--label","app=coderover",
        "--label",`jobId=${jobId}`,
        "-v",`${jobDir}:/workspace:rw`,
        "-w","/workspace",
        config.image,
        "sh","-c",config.command,
    ];

    try {
        const result = await execFilePromise("docker",dockerArgs,{
            timeout:10000,
            maxBuffer:MAX_OUTPUT_BYTES * 2,
            windowsHide:true,
        });

        return {
            status:"success",
            output:truncateOutput(result.stdout || ""),
            error:truncateOutput(result.stderr || ""),
        };
    } catch (error) {
        return normalizeError(error);
    } finally {
        await fs.rm(jobDir,{recursive:true,force:true});
    }
};

const runDockerJob = (job) => runWithDockerQueue(() => runDockerJobNow(job));

export const runCompilerDockerContainer = async(filename, language, res) => {
    try {
        const code = await readSavedCode(filename,language);
        const input = await fs.readFile(path.join(backendRoot,`${filename}.txt`),"utf8").catch(()=>"");
        const result = await runDockerJob({language,code,input,jobLabel:"single"});

        if(result.status === "success")
        {
            return res.status(201).json(new ApiResponse(200,result.output,"Executed Successfully"));
        }

        return res.status(403).json(new ApiResponse(403,result,"Execution failed"));
    } finally {
        await cleanupSavedFiles(filename,language);
    }
};

export const runExampleCasesDockerContainer = async(examplecases, language, filename) => {
    try {
        const code = await readSavedCode(filename,language);
        const results = [];

        for(const example of examplecases)
        {
            const result = await runDockerJob({
                language,
                code,
                input:example.input || "",
                jobLabel:"example",
            });

            if(result.status !== "success")
            {
                return {statusCode:403,data:result.error || result.status};
            }

            const actualOutput = result.output.trim();
            const expectedOutput = (example.output || "").trim();
            results.push({
                input:example.input,
                expectedOutput,
                actualOutput,
                isMatch:actualOutput === expectedOutput,
            });
        }

        return {statusCode:200,data:results};
    } catch (error) {
        return {statusCode:500,data:error.message || "Server error"};
    } finally {
        await cleanupSavedFiles(filename,language);
    }
};

export const runTestCasesDokerContainer = async(testCases, language, filename) => {
    try {
        const code = await readSavedCode(filename,language);
        let failedTestCase = null;

        for(const testCase of testCases)
        {
            const result = await runDockerJob({
                language,
                code,
                input:testCase.input || "",
                jobLabel:"test",
            });

            if(result.status !== "success")
            {
                return {statusCode:403,data:result.error || result.status};
            }

            const output = result.output.trim();
            const expectedOutput = (testCase.output || "").trim();
            if(output !== expectedOutput)
            {
                failedTestCase = {input:testCase.input,output,expectedOutput};
                break;
            }
        }

        return {statusCode:200,data:failedTestCase};
    } catch (error) {
        return {statusCode:500,data:error.message || "Server error"};
    } finally {
        await cleanupSavedFiles(filename,language);
    }
};
