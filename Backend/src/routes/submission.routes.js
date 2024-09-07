import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getMySubmissions, getSuccessfullySolvedProblems } from '../controllers/submissions.controller.js';
const router = Router();

router.route('/').post(verifyJWT,getMySubmissions);
router.route('/').get(verifyJWT,getSuccessfullySolvedProblems);
export default router;