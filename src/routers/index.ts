import express from 'express';
import reviews from './review';
import students from './students';

const router = express.Router();

router.use('/reviews', reviews);
router.use('/students', students);

export default router;
