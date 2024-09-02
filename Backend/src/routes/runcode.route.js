import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { runCode } from '../controllers/runcode.controller.js';
const router = Router();

router.route('/').post(verifyJWT,runCode);

export default router;