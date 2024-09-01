import {Router} from 'express'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar } from '../controllers/user.controller.js';

const router= Router();
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//SECURED ROUTES
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/getcurrentuser').get(verifyJWT,getCurrentUser);
router.route("/updateavatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);  
export default router;