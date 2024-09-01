import { Router } from 'express';
import { createproblem, getAllproblems, getproblemById,deleteproblemById } from '../controllers/problem.controller.js';

const router = Router();

router.route('/createproblem').post(createproblem);
router.route('/').get(getAllproblems);
router.route('/:id').get(getproblemById);
router.route('/:id').delete(deleteproblemById);

export default router;