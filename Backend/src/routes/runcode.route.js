import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { run_example_cases, runCode, runtestcases } from '../controllers/runcode.controller.js';
const router = Router();

router.route('/').post(verifyJWT,runCode);
router.route('/runexaplecases').post(verifyJWT,run_example_cases);
router.route('/submitcode').post(verifyJWT,runtestcases);

export default router;