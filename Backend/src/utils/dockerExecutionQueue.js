const DEFAULT_MAX_CONTAINERS = 2;

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value,10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class DockerExecutionQueue {
    constructor(maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
        this.runningJobs = 0;
        this.waitingRequests = [];
    }

    async run(task) {
        await this.waitForTurn();
        try {
            return await task();
        } finally {
            this.finishCurrentJob();
        }
    }

    async waitForTurn() {
        if(this.runningJobs < this.maxConcurrent)
        {
            this.runningJobs += 1;
            return;
        }

        await new Promise((resolve) => {
            this.waitingRequests.push(resolve);
        });
    }

    finishCurrentJob() {
        const nextWaitingRequest = this.waitingRequests.shift();
        if(nextWaitingRequest)
        {
            nextWaitingRequest();
            return;
        }

        this.runningJobs = Math.max(0,this.runningJobs - 1);
    }

    getStats() {
        return {
            maxConcurrent:this.maxConcurrent,
            activeCount:this.runningJobs,
            queuedCount:this.waitingRequests.length,
        };
    }
}

let dockerQueue;

export const getDockerExecutionQueue = () => {
    if(!dockerQueue)
    {
        const maxContainers = parsePositiveInt(process.env.MAX_DOCKER_CONTAINERS,DEFAULT_MAX_CONTAINERS);
        dockerQueue = new DockerExecutionQueue(maxContainers);
    }
    return dockerQueue;
};

export const runWithDockerQueue = async (task) => {
    const queue = getDockerExecutionQueue();
    return await queue.run(task);
};

export const getDockerQueueStats = () => getDockerExecutionQueue().getStats();
