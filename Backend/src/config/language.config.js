export const languageConfig = {
    c: {
        image: "coderover-cpp-runner",
        fileName: "main.c",
        extension: "c",
        command: "gcc main.c -O2 -o main && timeout 3s ./main < input.txt",
        memory: "256m",
    },
    cpp: {
        image: "coderover-cpp-runner",
        fileName: "main.cpp",
        extension: "cpp",
        command: "g++ main.cpp -std=c++17 -O2 -o main && timeout 3s ./main < input.txt",
        memory: "256m",
    },
    java: {
        image: "coderover-java-runner",
        fileName: "Main.java",
        extension: "java",
        command: "javac Main.java && timeout 3s java Main < input.txt",
        memory: "512m",
    },
    python: {
        image: "coderover-python-runner",
        fileName: "main.py",
        extension: "py",
        command: "timeout 3s python3 main.py < input.txt",
        memory: "256m",
    },
};
