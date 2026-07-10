import fs from "fs/promises";
import path from "path";
import { cleanupDockerJobs, runDockerJob } from "./runDocker.middleware.js";

const MAX_OUTPUT_BYTES = 64 * 1024;

const truncateOutput = (value = "") => {
    if(Buffer.byteLength(value,"utf8") <= MAX_OUTPUT_BYTES)
    {
        return value;
    }
    return `${value.slice(0,MAX_OUTPUT_BYTES)}\n[Output truncated after 64KB]`;
};

const readJobFile = async(job,...segments) => {
    const value = await fs.readFile(path.join(job.jobDir,...segments),"utf8").catch(() => "");
    return truncateOutput(value);
};

const buildExecutionErrorResponse = (message) => ({
    statusCode:403,
    data:message || "Execution failed",
});

const buildCaseResult = (testCase) => {
    const actualOutput = testCase.output.trim();
    const expectedOutput = (testCase.expectedOutput || "").trim();
    return {
        input:testCase.input,
        expectedOutput,
        actualOutput,
        isMatch:actualOutput === expectedOutput,
    };
};

const getCompileError = async(job,dockerResult) => {
    const compileStatus = (await readJobFile(job,"compile_status.txt")).trim();
    if(!compileStatus || compileStatus === "0")
    {
        return null;
    }

    const stderr = await readJobFile(job,"compile_stderr.txt");
    const stdout = await readJobFile(job,"compile_stdout.txt");
    return stderr || stdout || dockerResult.error;
};

const getCaseResults = async(job) => {
    const results = [];

    for(const [index,testCase] of job.cases.entries())
    {
        const statusText = (await readJobFile(job,"statuses",`${index}.txt`)).trim();
        const exitCode = Number.parseInt(statusText,10);

        results.push({
            ...testCase,
            output:await readJobFile(job,"outputs",`${index}.txt`),
            error:await readJobFile(job,"errors",`${index}.txt`),
            exitCode:Number.isFinite(exitCode) ? exitCode : null,
        });
    }

    return results;
};

const getCaseRuntimeError = (testCase,dockerResult) => {
    if(testCase.exitCode === 0)
    {
        return null;
    }

    if(testCase.exitCode === 124 || dockerResult.status === "timeout")
    {
        return "Time limit exceeded";
    }

    if(testCase.exitCode === null)
    {
        return dockerResult.error || "Execution failed";
    }

    return testCase.error || dockerResult.error || "Execution failed";
};

const runCaseContainer = async(job) => {
    const dockerResult = await runDockerJob(job);
    const compileError = await getCompileError(job,dockerResult);
    if(compileError)
    {
        return {dockerResult, setupError:compileError, cases:[]};
    }

    return {
        dockerResult,
        setupError:null,
        cases:await getCaseResults(job),
    };
};

export const runCompilerDockerContainer = async(job) => {
    try {
        const result = await runDockerJob(job);
        if(result.status === "success")
        {
            return {
                httpStatusCode:201,
                statusCode:200,
                data:result.output,
                message:"Executed Successfully",
            };
        }

        return {
            httpStatusCode:403,
            statusCode:403,
            data:result,
            message:"Execution failed",
        };
    } finally {
        await cleanupDockerJobs([job]);
    }
};

export const runExampleCasesDockerContainer = async(exampleJob) => {
    try {
        const {dockerResult, setupError, cases} = await runCaseContainer(exampleJob);
        if(setupError) return buildExecutionErrorResponse(setupError);

        const runtimeError = cases.map((testCase) => getCaseRuntimeError(testCase,dockerResult)).find(Boolean);
        if(runtimeError) return buildExecutionErrorResponse(runtimeError);

        return {statusCode:200,data:cases.map(buildCaseResult)};
    } catch (error) {
        return {statusCode:500,data:error.message || "Server error"};
    } finally {
        await cleanupDockerJobs([exampleJob]);
    }
};

export const runTestCasesDokerContainer = async(testCaseJob) => {
    try {
        const {dockerResult, setupError, cases} = await runCaseContainer(testCaseJob);
        if(setupError) return buildExecutionErrorResponse(setupError);

        const runtimeError = cases.map((testCase) => getCaseRuntimeError(testCase,dockerResult)).find(Boolean);
        if(runtimeError) return buildExecutionErrorResponse(runtimeError);

        const failedTestCase = cases
            .map(buildCaseResult)
            .find((testCase) => !testCase.isMatch);

        if(failedTestCase)
        {
            return {
                statusCode:200,
                data:{
                    input:failedTestCase.input,
                    output:failedTestCase.actualOutput,
                    expectedOutput:failedTestCase.expectedOutput,
                },
            };
        }

        return {statusCode:200,data:null};
    } catch (error) {
        return {statusCode:500,data:error.message || "Server error"};
    } finally {
        await cleanupDockerJobs([testCaseJob]);
    }
};
