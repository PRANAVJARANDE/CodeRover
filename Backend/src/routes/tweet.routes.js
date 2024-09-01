import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createTweet, getAllTweets,getTweetsofProblem} from '../controllers/tweets.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
const router = Router();

router.route('/createtweet').post(verifyJWT,upload.single("image"),createTweet);
router.route('/').get(getAllTweets);
router.route('/problem/:id').get(getTweetsofProblem);

export default router;