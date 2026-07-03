# CodeRover Docker Runners

Build these images once before using code execution:

```powershell
docker build -t coderover-cpp-runner .\docker\cpp-runner
docker build -t coderover-java-runner .\docker\java-runner
docker build -t coderover-python-runner .\docker\python-runner
```

Limit concurrent Docker executions in `.env`:

```env
MAX_DOCKER_CONTAINERS=2
```

When all slots are busy, new code-run requests wait in the server queue instead of starting more containers.

Each run request creates a fresh temporary container with:

- `--rm`
- `--network none`
- CPU and memory limits
- `--read-only`
- `--tmpfs /tmp`
- dropped capabilities
- a unique temp workspace mounted at `/workspace`
