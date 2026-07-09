import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweetById, getAllTweets,getTweetsofProblem} from '../controllers/tweets.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
const router = Router();

router.route('/createtweet').post(verifyJWT,upload.single("image"),createTweet);
router.route('/discuss').get(getAllTweets);
router.route('/').get(getAllTweets);
router.route('/problem/:id').get(getTweetsofProblem);
router.route('/:tweet_id').delete(deleteTweetById);

export default router;
