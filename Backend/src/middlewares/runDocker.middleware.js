import { exec } from 'child_process';
import { promisify } from 'util';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

const executeDocker = async(filename, language,res) => {
    try {
        // Run the Docker container with the gcc image
        const response = await execPromise(`docker run -d ${getDockerImage(language)}:latest sleep infinity`);
        const containerID = response.stdout.trim();
        console.log("Container ID:", containerID);

        // Create the directory if it does not exist
        await execPromise(`docker exec ${containerID} sh -c "mkdir -p /usr/src/app"`);

        // Copy the source code and input files into the container
        await execPromise(`docker cp ${filename}.${getExtension(language)} ${containerID}:/usr/src/app/`);
        await execPromise(`docker cp ${filename}.txt ${containerID}:/usr/src/app/`);

        // Compile and run the code inside the container
        const result = await execPromise(getRunCMD(containerID,filename,language));
        console.log(result);

        // Clean up: remove the container and files
        await execPromise(`docker rm -f ${containerID}`);
        await execPromise(`rm ${filename}.${getExtension(language)} ${filename}.txt`);
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
    }
};

export const runCompilerDockerContainer = (filename,language,res)=>{
    executeDocker(filename,language,res);
};