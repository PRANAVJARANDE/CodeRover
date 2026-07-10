import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import { getLanguageConfig } from "../utils/codeExecution.utils.js";
import { runWithDockerQueue } from "../utils/dockerExecutionQueue.js";

const execFilePromise = promisify(execFile);
const MAX_OUTPUT_BYTES = 64 * 1024;

const truncateOutput = (value = "") => {
    if(Buffer.byteLength(value,"utf8") <= MAX_OUTPUT_BYTES)
    {
        return value;
    }
    return `${value.slice(0,MAX_OUTPUT_BYTES)}\n[Output truncated after 64KB]`;
};

const normalizeDockerError = (error) => {
    const stderr = truncateOutput(error.stderr || "");
    const stdout = truncateOutput(error.stdout || "");

    if(error.killed || error.signal === "SIGTERM" || error.code === 124)
    {
        return {status:"timeout", output:stdout, error:"Time limit exceeded"};
    }

    if(stderr.includes("Command terminated") || stderr.toLowerCase().includes("timeout"))
    {
        return {status:"timeout", output:stdout, error:"Time limit exceeded"};
    }

    return {status:"error", output:stdout, error:stderr || error.message || "Execution failed"};
};

const buildDockerArgs = (job,config) => [
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
    "--label",`jobId=${job.jobId}`,
    "-v",`${job.jobDir}:/workspace:rw`,
    "-w","/workspace",
    config.image,
    "sh","-c",job.command || config.command,
];

export const cleanupDockerJobs = async(jobs = []) => {
    await Promise.allSettled(
        jobs
            .filter((job) => job?.jobDir)
            .map((job) => fs.rm(job.jobDir,{recursive:true,force:true}))
    );
};

const runDockerJobNow = async(job,{cleanup = false} = {}) => {
    try {
        const config = getLanguageConfig(job.language);
        const result = await execFilePromise("docker",buildDockerArgs(job,config),{
            timeout:job.timeoutMs || 10000,
            maxBuffer:MAX_OUTPUT_BYTES * 2,
            windowsHide:true,
        });

        return {
            status:"success",
            output:truncateOutput(result.stdout || ""),
            error:truncateOutput(result.stderr || ""),
        };
    } catch (error) {
        return normalizeDockerError(error);
    } finally {
        if(cleanup)
        {
            await cleanupDockerJobs([job]);
        }
    }
};

export const runDockerJob = (job,options) => runWithDockerQueue(() => runDockerJobNow(job,options));
