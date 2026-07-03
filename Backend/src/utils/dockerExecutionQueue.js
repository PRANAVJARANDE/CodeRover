const DEFAULT_MAX_CONTAINERS = 2;

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value,10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class DockerExecutionQueue {
    constructor(maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
        this.activeCount = 0;
        this.waitingJobs = [];
    }

    async run(task) {
        await this.acquire();
        try {
            return await task();
        } finally {
            this.release();
        }
    }

    acquire() {
        if(this.activeCount < this.maxConcurrent)
        {
            this.activeCount += 1;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.waitingJobs.push(resolve);
        });
    }

    release() {
        const nextJob = this.waitingJobs.shift();
        if(nextJob)
        {
            nextJob();
            return;
        }

        this.activeCount = Math.max(0,this.activeCount - 1);
    }

    getStats() {
        return {
            maxConcurrent:this.maxConcurrent,
            activeCount:this.activeCount,
            queuedCount:this.waitingJobs.length,
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

export const runWithDockerQueue = (task) => getDockerExecutionQueue().run(task);

export const getDockerQueueStats = () => getDockerExecutionQueue().getStats();
