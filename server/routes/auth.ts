import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models.js';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res: Response) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'সবগুলো ঘর পূরণ করা বাধ্যতামূলক।' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existing) {
      if (existing.username === cleanUsername) {
        return res.status(400).json({ success: false, message: 'এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে।' });
      }
      return res.status(400).json({ success: false, message: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত আছে।' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=16803c`,
      bookmarks: [],
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15d' });

    res.status(201).json({
      success: true,
      message: 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'ইউজারনেম/ইমেইল এবং পাসওয়ার্ড আবশ্যক।' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি। সঠিক তথ্য দিন।' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15d' });

    res.json({
      success: true,
      message: 'সফলভাবে লগইন হয়েছে।',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'লগইন করতে সমস্যা হয়েছে। সার্ভার ত্রুটি।' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        bookmarks: req.user.bookmarks,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'প্রোফাইল লোড করতে ব্যর্থ।' });
  }
});

// Update Profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি।' });

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar.trim();

    await user.save();

    res.json({
      success: true,
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
  }
});

export default router;
