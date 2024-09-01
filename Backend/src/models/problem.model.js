import mongoose from 'mongoose'

const exampleCaseSchema = new mongoose.Schema({
    input: {
        type: String,  
        required: true
    },
    output: {
        type: String,  
        required: true
    },
    explanation: {
        type: String,
        default: "" 
    }
});

const solutionSchema = new mongoose.Schema({
    c: {
        type: String,
        default: ""  
    },
    cpp: {
        type: String,
        default: ""
    },
    java: {
        type: String,
        default: ""
    },
    python: {
        type: String,
        default: ""
    }
});

const testCaseSchema = new mongoose.Schema({
    input: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },
    constraints: {
        type: [String],  
        required: true
    },
    example_cases: {
        type: [exampleCaseSchema],
        required: true
    },
    test_cases: {
        type: [testCaseSchema],
        required: true
    },
    solution: {
        type: solutionSchema,
        required: true
    },
    input_format:{
        type:String,
        required: true,
    },
    output_format:{
        type:String,
        required: true,
    }
});

export const Problem=mongoose.model('Problem',problemSchema);