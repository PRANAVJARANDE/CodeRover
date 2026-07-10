import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getLanguageConfig, normalizeExecutionCase } from "../utils/codeExecution.utils.js";

const jobRoot = path.join(os.tmpdir(),"coderover");
const OUTPUT_FILE_BLOCK_LIMIT = 128;
const DOCKER_CASE_TIMEOUT_MS = 4000;

export const cleanupExecutionJobs = async(jobs = []) => {
    await Promise.allSettled(
        jobs.filter((job) => job?.jobDir).map((job) => fs.rm(job.jobDir,{recursive:true,force:true}))
    );
};

export const saveExecutionFiles = async({language,code,input = "",jobLabel}) => {
    const config = getLanguageConfig(language);
    const jobId = `${jobLabel}_${Date.now()}_${randomUUID()}`;
    const jobDir = path.join(jobRoot,jobId);

    try {
        await fs.mkdir(jobDir,{recursive:true});
        await fs.writeFile(path.join(jobDir,config.fileName),code || "","utf8");
        await fs.writeFile(path.join(jobDir,"input.txt"),input || "","utf8");
        console.log(`Execution files saved with job id: ${jobId}`);
        return {language,jobId,jobDir,input};
    } catch (error) {
        await cleanupExecutionJobs([{jobDir}]);
        console.error("Error saving execution files:", error);
        throw new ApiError(500,"Something went wrong while generating file");
    }
};

const buildCaseRunnerScript = (config,caseCount) => `#!/bin/sh
set -u

mkdir -p outputs errors statuses runs

${config.compileCommand} > compile_stdout.txt 2> compile_stderr.txt
compile_status=$?
echo "$compile_status" > compile_status.txt
if [ "$compile_status" -ne 0 ]; then
    exit "$compile_status"
fi

i=0
while [ "$i" -lt "${caseCount}" ]; do
    mkdir -p "runs/$i"
    (
        cd "runs/$i" || exit 1
        ulimit -f ${OUTPUT_FILE_BLOCK_LIMIT}
        ${config.executeCommand} < "/workspace/inputs/$i.txt" > "/workspace/outputs/$i.txt" 2> "/workspace/errors/$i.txt"
    )
    status=$?
    echo "$status" > "statuses/$i.txt"
    if [ "$status" -ne 0 ]; then
        exit "$status"
    fi
    i=$((i + 1))
done
`;

export const saveCaseExecutionFiles = async(cases,language,code,jobLabel) => {
    const config = getLanguageConfig(language);
    const jobId = `${jobLabel}_${Date.now()}_${randomUUID()}`;
    const jobDir = path.join(jobRoot,jobId);

    try {
        await fs.mkdir(path.join(jobDir,"inputs"),{recursive:true});
        await fs.writeFile(path.join(jobDir,config.fileName),code || "","utf8");

        const executionCases = [];
        for(const [index,testCase] of cases.entries())
        {
            const {input, expectedOutput} = normalizeExecutionCase(testCase);
            await fs.writeFile(path.join(jobDir,"inputs",`${index}.txt`),input,"utf8");
            executionCases.push({input,expectedOutput});
        }

        await fs.writeFile(
            path.join(jobDir,"run-cases.sh"),
            buildCaseRunnerScript(config,executionCases.length),
            "utf8"
        );

        console.log(`Execution case files saved with job id: ${jobId}`);
        return {
            language,
            jobId,
            jobDir,
            command:"sh run-cases.sh",
            cases:executionCases,
            timeoutMs:Math.max(10000,(executionCases.length + 1) * DOCKER_CASE_TIMEOUT_MS),
        };
    } catch (error) {
        await cleanupExecutionJobs([{jobDir}]);
        console.error("Error saving execution case files:", error);
        throw new ApiError(500,"Something went wrong while generating file");
    }
};

export const saveSingleExecutionFile = asyncHandler(async(req,res,next) => {
    const {language,code,input} = req.body;
    req.executionJob = await saveExecutionFiles({
        language,
        code,
        input:input || "",
        jobLabel:"single",
    });
    next();
});

export const saveExampleExecutionFiles = asyncHandler(async(req,res,next) => {
    const {language,code,example_cases} = req.body;
    req.executionJob = await saveCaseExecutionFiles(example_cases,language,code,"example");
    next();
});

export const saveTestExecutionFiles = asyncHandler(async(req,res,next) => {
    const {language,code} = req.body;
    req.executionJob = await saveCaseExecutionFiles(req.problem.test_cases,language,code,"test");
    next();
});
