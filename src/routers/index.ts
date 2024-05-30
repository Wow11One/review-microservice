import express from 'express';
import groups from './groups';
import students from './students';

const router = express.Router();

router.use('/groups', groups);
router.use('/students', students);

export default router;
