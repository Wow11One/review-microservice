import express from 'express';
import {
  countReviews,
  create,
  findAll,
} from 'src/controllers/review';

const router = express.Router();

router.post('/', create);
router.post('/_counts', countReviews);
router.get('/', findAll);

export default router;