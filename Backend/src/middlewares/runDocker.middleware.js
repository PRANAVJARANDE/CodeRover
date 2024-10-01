import { exec } from 'child_process';
import { promisify } from 'util';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { saveInputFiles } from './saveCodeFile.middleware.js';

const execPromise = promisify(exec);

function getExtension(language) {
    switch (language) {
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'python': return 'py';
        case 'java': return 'java';
        default: 
            throw new ApiError(400,"Unsupported Language");
    }
}

function getDockerImage(language) {
    switch (language) {
        case 'c': return 'gcc';
        case 'cpp': return 'gcc';
        case 'python': return 'python';
        case 'java': return 'openjdk';
        default: 
            throw new ApiError(400,"Unsupported Language");
    }
}

function getRunCMD(containerID,filename,language){
    switch (language) {
        case 'c': return `docker exec ${containerID} sh -c "g++ /usr/src/app/${filename}.c -o /usr/src/app/a && /usr/src/app/a < /usr/src/app/${filename}.txt"`;
        case 'cpp': return `docker exec ${containerID} sh -c "g++ /usr/src/app/${filename}.cpp -o /usr/src/app/a && /usr/src/app/a < /usr/src/app/${filename}.txt"`;
        case 'python': return `docker exec ${containerID} sh -c "python3 /usr/src/app/${filename}.py < /usr/src/app/${filename}.txt"`;
        case 'java': return `docker exec ${containerID} sh -c "javac /usr/src/app/${filename}.java && java -cp /usr/src/app ${filename} < /usr/src/app/${filename}.txt"`;
        default: 
            throw new ApiError(400,"Unsupported Language");
    }
}

const formatErrorMessage = (stderr) => {
    const lines = stderr.split('\n');
    const errorLines = [];
    const errorPattern = /\/usr\/src\/app\/[\w-]+\.cpp:(\d+):\d+:\s+(error|warning):\s+(.+)/;
    lines.forEach(line => {
        const match = line.match(errorPattern);
        if (match) {
            const lineNumber = match[1];
            const errorType = match[2];
            const errorMessage = match[3];
            errorLines.push(`Line ${lineNumber} - ${errorType}: ${errorMessage}`);
        }
    });
    return errorLines.length ? errorLines.join('\n') : 'Docker Connection error';
};


export const runCompilerDockerContainer = async(filename, language,res) => {
    let containerID=null;
    try {
        // Run the Docker container 
        const response = await execPromise(`docker run -d ${getDockerImage(language)}:latest sleep infinity`);
        containerID = response.stdout.trim();
        console.log("Container ID:", containerID);

        // Create the directory if it does not exist
        await execPromise(`docker exec ${containerID} sh -c "mkdir -p /usr/src/app"`);

        // Copy the source code and input files into the container
        await execPromise(`docker cp ${filename}.${getExtension(language)} ${containerID}:/usr/src/app/`);
        await execPromise(`docker cp ${filename}.txt ${containerID}:/usr/src/app/`);

        // Compile and run the code inside the container
        const result = await execPromise(getRunCMD(containerID,filename,language));
        console.log(result);

        res.status(201).json(new ApiResponse(200, result.stdout, "Executed Successfully"));
    } catch (error) {
        console.error("Error:", error);
        try {
            await execPromise(`docker rm -f ${containerID}`);
            await execPromise(`rm ${filename}.${getExtension(language)} ${filename}.txt`);
        } catch (removeError) {
            console.error('Error removing files:', removeError);
        }
        res.status(500).json({ stderr: error.stderr });

    } finally {
        if (containerID) {
            try {
                await execPromise(`docker rm -f ${containerID}`);
            } catch (removeError) {
                console.error('Error removing Docker container:', removeError);
            }
        }
        try {
            await execPromise(`rm ${filename}.${getExtension(language)} ${filename}.txt`);
        } catch (removeFileError) {
            console.error('Error removing files:', removeFileError);
        }
    }
};

export const runExampleCasesDockerContainer = async (examplecases, language, filename) => {
    let containerID = null;
    const TIME_LIMIT = 20000; 
    let res_output = [];

    try {
        const response = await execPromise(`docker run -d ${getDockerImage(language)}:latest sleep infinity`);
        containerID = response.stdout.trim();
        console.log("Container ID:", containerID);
        await execPromise(`docker exec ${containerID} sh -c "mkdir -p /usr/src/app"`);
        await execPromise(`docker cp ${filename}.${getExtension(language)} ${containerID}:/usr/src/app/`);
        for (const x of examplecases) 
        {
            saveInputFiles(x.input, filename);
            await execPromise(`docker cp ${filename}.txt ${containerID}:/usr/src/app/`);
            const executionPromise = execPromise(getRunCMD(containerID, filename, language));
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Time Limit Exceeded")), TIME_LIMIT)
            );

            try {
                const result = await Promise.race([executionPromise, timeoutPromise]); 
                const output = result.stdout.trim();
                const expectedOutput = x.output.trim();
                const isMatch = output === expectedOutput;

                res_output.push({
                    input: x.input,
                    expectedOutput,
                    actualOutput: output,
                    isMatch,
                });

                console.log(`Input: ${x.input}, Expected: ${expectedOutput}, Actual: ${output}, Match: ${isMatch}`);
            } catch (execError) {
                if (execError.message === "Time Limit Exceeded") {
                    console.error('Error: Time Limit Exceeded');
                    return { statusCode: 403, data:"TLE"}; 
                } else {
                    console.error('Execution error:', execError);
                    throw execError; 
                }
            } finally {
                try {
                    await execPromise(`docker exec ${containerID} rm -f /usr/src/app/${filename}.txt`);
                } catch (removeError) {
                    console.error('Error removing input file inside Docker:', removeError);
                }
            }
        }

        await execPromise(`docker exec ${containerID} rm -f /usr/src/app/${filename}.${getExtension(language)}`);
        return { statusCode: 200, data: res_output };

    } catch (error) {
        // Handle general errors and clean up
        try {
            await execPromise(`rm -f ${filename}.${getExtension(language)} ${filename}.txt`);
        } catch (removeError) {
            console.error('Error removing local files during error handling:', removeError);
        }

        // Return error response based on type
        if (error.stderr) {
            console.error('Standard error:', error.stderr);
            return { statusCode: 403, data: formatErrorMessage(error.stderr)}; 
        } else if (error.message === "Time Limit Exceeded") {
            console.error('Error: Time Limit Exceeded');
            return { statusCode: 403, data: "Error: Time Limit Exceeded" }; 
        }

        console.error('Server error:', error);
        return { statusCode: 500, data: "Server error" };

    } finally {
        if (containerID) {
            try {
                await execPromise(`docker rm -f ${containerID}`);
                await execPromise(`rm ${filename}.${getExtension(language)} ${filename}.txt`);
                console.log('Docker container removed successfully:', containerID);
            } catch (removeError) {
                console.error('Error removing Docker container:', removeError);
            }
        }
    }
};

export const runTestCasesDokerContainer= async(test_cases,language,filename)=>{
        let containerID = null;
        const TIME_LIMIT = 30000;
        try {
            const response = await execPromise(`docker run -d ${getDockerImage(language)}:latest sleep infinity`);
            containerID = response.stdout.trim();
            console.log("Container ID:", containerID);
            await execPromise(`docker exec ${containerID} sh -c "mkdir -p /usr/src/app"`);
            await execPromise(`docker cp ${filename}.${getExtension(language)} ${containerID}:/usr/src/app/`);
            let failedTestCase=null;
            for (const x of test_cases) 
            {
                if(failedTestCase)break;
                saveInputFiles(x.input, filename);
                await execPromise(`docker cp ${filename}.txt ${containerID}:/usr/src/app/`);
                const executionPromise = execPromise(getRunCMD(containerID, filename, language));
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Time Limit Exceeded")), TIME_LIMIT)
                );

                try {
                    const result = await Promise.race([executionPromise, timeoutPromise]);
                    const output = result.stdout.trim();
                    const expectedOutput = x.output.trim();
                    const isMatch = output === expectedOutput;
                    if (!isMatch && !failedTestCase) 
                    {
                        failedTestCase={input:x.input,output,expectedOutput};
                    }
                    console.log(`Test case passed. Input: ${x.input}, Output: ${output}`);
                } catch (execError) {
                    if (execError.message === "Time Limit Exceeded") {
                        console.error('Error: Time Limit Exceeded');
                        return { statusCode: 403, data:"TLE"}; 
                    } else {
                        console.error('Execution error:', execError);
                        throw execError; 
                    }
                } finally {
                    try {
                        await execPromise(`docker exec ${containerID} rm -f /usr/src/app/${filename}.txt`);
                    } catch (removeError) {
                        console.error('Error removing input file inside Docker:', removeError);
                    }
                }
            }
            
            await execPromise(`docker exec ${containerID} rm /usr/src/app/${filename}.${getExtension(language)}`);
            return {statusCode: 200, data: failedTestCase};
        } 
        catch (error) 
        {
            try {
                if (containerID) {
                    await execPromise(`docker exec ${containerID} rm /usr/src/app/${filename}.${getExtension(language)}`);
                }
            } catch (removeError) {
                console.error('Error removing files from container:', removeError);
            }
    
            if (error.stderr) {
                return { statusCode: 403, data: formatErrorMessage(error.stderr) };
            } else if (error.message === "Time Limit Exceeded") {
                return { statusCode: 403, data: "Time Limit Exceeded" };
            }
            return { statusCode: 500, data: "Server error" };
        } finally {
            if (containerID) {
                try {
                    await execPromise(`docker rm -f ${containerID}`);
                    await execPromise(`rm ${filename}.${getExtension(language)} ${filename}.txt`);
                } catch (removeError) {
                    console.error('Error removing Docker container:', removeError);
                }
            }
        }
};
    