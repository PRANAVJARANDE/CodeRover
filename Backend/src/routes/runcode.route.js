import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { handleCodeRunError, loadProblemTestCases, run_example_cases, runCode, runtestcases } from '../controllers/runcode.controller.js';
import { saveExampleExecutionFiles, saveSingleExecutionFile, saveTestExecutionFiles } from '../middlewares/saveCodeFile.middleware.js';
import { validateExampleCasesPayload, validateProblemTestCasesPayload, validateRunCodePayload, validateSubmitCodePayload } from '../middlewares/validatecode.middleware.js';
const router = Router();

router.route('/').post(verifyJWT,validateRunCodePayload,saveSingleExecutionFile,runCode);

router.route('/runexaplecases').post(verifyJWT,
    validateExampleCasesPayload,
    saveExampleExecutionFiles,
    run_example_cases
);

router.route('/submitcode').post(verifyJWT,
    validateSubmitCodePayload,
    loadProblemTestCases,
    validateProblemTestCasesPayload,
    saveTestExecutionFiles,
    runtestcases
);

router.use(handleCodeRunError);

export default router;
