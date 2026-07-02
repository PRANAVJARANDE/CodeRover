import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createInterview, getInterviewByRoomId, getInterviewVerificationUpload, getMyInterviews, updateInterviewRoomState, uploadInterviewVerificationVideo } from '../controllers/interview.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router=Router();

router.route('/').post(verifyJWT,createInterview);
router.route('/my').get(verifyJWT,getMyInterviews);
router.route('/verification/upload').post(upload.single("video"),uploadInterviewVerificationVideo);
router.route('/verification/:requestId').get(verifyJWT,getInterviewVerificationUpload);
router.route('/room/:roomId').get(verifyJWT,getInterviewByRoomId);
router.route('/room/:roomId/state').patch(verifyJWT,updateInterviewRoomState);

export default router;
