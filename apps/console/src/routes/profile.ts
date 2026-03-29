import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// All profile routes require authentication
router.use(authenticateToken);

// @route   PUT /api/profile/avatar
// @desc    Update user avatar
router.put('/avatar', async (req: any, res) => {
  const userId = req.user.userId;
  const { avatar } = req.body;

  if (!avatar) {
    return res.status(400).json({ error: 'Avatar string is required' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: {
        id: true,
        username: true,
        role: true,
        avatar: true,
      },
    });

    res.json({ message: 'Avatar updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Server error updating avatar' });
  }
});

export default router;
