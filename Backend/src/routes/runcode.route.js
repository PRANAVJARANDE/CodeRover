import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { run_example_cases, runCode } from '../controllers/runcode.controller.js';
const router = Router();

router.route('/').post(verifyJWT,runCode);
router.route('/runexaplecases').post(verifyJWT,run_example_cases);

export default router;