import { Router, Request, Response } from 'express';
import { Video, Category, WatchHistory } from '../db/models.js';
import { optionalAuth, AuthRequest, authenticate, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Setup local upload directory (Acting as a mock for cloud storage until keys are provided)
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reels');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reel-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();

// GET all videos with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      subCategory,
      audience,
      search,
      sort = 'newest',
      page = 1,
      limit = 24,
    } = req.query;

    const query: any = { isPublished: true };

    if (category && category !== 'all') {
      // Matches either direct category or subcategory
      query.$or = [{ categorySlug: category }, { subCategorySlug: category }];
    }

    if (subCategory && subCategory !== 'all') {
      query.subCategorySlug = subCategory;
    }

    if (audience && audience !== 'all') {
      query.audience = audience;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { channelName: searchRegex },
            { categorySlug: searchRegex },
            { subCategorySlug: searchRegex },
          ],
        },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { viewsCount: -1 };
    } else if (sort === 'order') {
      sortOption = { order: 1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [videos, total] = await Promise.all([
      Video.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Video.countDocuments(query),
    ]);

    res.json({
      success: true,
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'ভিডিও লোড করতে সমস্যা হয়েছে।' });
  }
});

// GET single video by id or youtubeId
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let video = await Video.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { youtubeId: id }],
      isPublished: true,
    }).lean();

    if (!video) {
      return res.status(404).json({ success: false, message: 'ভিডিও পাওয়া যায়নি।' });
    }

    // Related videos in the same category/subCategory
    const relatedVideos = await Video.find({
      _id: { $ne: video._id },
      $or: [
        { subCategorySlug: video.subCategorySlug || 'none' },
        { categorySlug: video.categorySlug },
      ],
      isPublished: true,
    })
      .limit(6)
      .lean();

    // Previous and Next video in same category
    const prevVideo = await Video.findOne({
      categorySlug: video.categorySlug,
      order: { $lt: video.order },
      isPublished: true,
    })
      .sort({ order: -1 })
      .select('title youtubeId _id')
      .lean();

    const nextVideo = await Video.findOne({
      categorySlug: video.categorySlug,
      order: { $gt: video.order },
      isPublished: true,
    })
      .sort({ order: 1 })
      .select('title youtubeId _id')
      .lean();

    // Category info
    const [category, subCategory] = await Promise.all([
      Category.findOne({ slug: video.categorySlug }).lean(),
      video.subCategorySlug ? Category.findOne({ slug: video.subCategorySlug }).lean() : null,
    ]);

    // Record watch history if user logged in
    if (req.user) {
      try {
        await WatchHistory.findOneAndUpdate(
          { userId: req.user._id, youtubeId: video.youtubeId },
          {
            userId: req.user._id,
            videoId: video._id.toString(),
            youtubeId: video.youtubeId,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            channelName: video.channelName,
            categorySlug: video.categorySlug,
            watchedAt: new Date(),
          },
          { upsert: true }
        );
      } catch (err) {
        // non-fatal
      }
    }

    // Increment views
    await Video.updateOne({ _id: video._id }, { $inc: { viewsCount: 1 } });

    res.json({
      success: true,
      video,
      relatedVideos,
      prevVideo,
      nextVideo,
      category,
      subCategory,
    });
  } catch (error: any) {
    console.error('Error fetching single video:', error);
    res.status(500).json({ success: false, message: 'ভিডিওর তথ্য লোড করতে ব্যর্থ।' });
  }
});

// GET recently watched videos for current user
router.get('/user/watch-history', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.json({ success: true, history: [] });
    }

    const history = await WatchHistory.find({ userId: req.user._id })
      .sort({ watchedAt: -1 })
      .limit(8)
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'হিস্টোরি লোড করতে সমস্যা হয়েছে।' });
  }
});

// Upload Reel Route (User and Admin)
router.post('/upload-reel', authenticate, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, categorySlug, youtubeUrl } = req.body;
    
    if (!req.file && !youtubeUrl) {
      return res.status(400).json({ success: false, message: 'ভিডিও ফাইল অথবা ইউটিউব লিংক আবশ্যক।' });
    }

    let fileUrl = '';
    let mockId = '';
    let thumb = '';

    if (req.file) {
      fileUrl = `/uploads/reels/${req.file.filename}`;
      mockId = 'cloud-' + Date.now();
    } else if (youtubeUrl) {
      fileUrl = youtubeUrl;
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = youtubeUrl.match(regex);
      if (match && match[1]) {
        mockId = match[1];
        thumb = `https://img.youtube.com/vi/${mockId}/hqdefault.jpg`;
      } else {
        return res.status(400).json({ success: false, message: 'সঠিক ইউটিউব লিংক দিন।' });
      }
    }

    const existingVideo = await Video.findOne({ youtubeId: mockId });
    if (existingVideo) {
      return res.status(400).json({ success: false, message: 'এই ভিডিওটি ইতিমধ্যে সিস্টেমে রয়েছে।' });
    }

    const isAdmin = req.user?.role === 'admin';

    const newReel = new Video({
      youtubeId: mockId,
      youtubeUrl: fileUrl,
      title,
      description,
      channelName: req.user?.name || 'User',
      categorySlug: categorySlug || 'reels',
      audience: 'all',
      difficultyLevel: 'all',
      duration: '১ মিনিট',
      isPublished: isAdmin ? true : false,
      isApproved: isAdmin ? true : false,
      uploadedBy: req.user?._id,
      thumbnailUrl: thumb,
    });

    await newReel.save();

    res.json({ 
      success: true, 
      message: isAdmin ? 'রিলস সফলভাবে আপলোড এবং পাবলিশ হয়েছে।' : 'রিলস আপলোড হয়েছে! অ্যাডমিন অ্যাপ্রুভ করলে এটি সবার জন্য দৃশ্যমান হবে।', 
      video: newReel 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'আপলোড করতে সমস্যা হয়েছে।' });
  }
});

// Admin: Get Pending Reels
router.get('/admin/pending-reels', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pendingReels = await Video.find({ categorySlug: 'reels', isApproved: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, videos: pendingReels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'পেন্ডিং রিলস লোড করতে সমস্যা হয়েছে।' });
  }
});

// Admin: Approve Reel
router.put('/admin/approve-reel/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { isApproved: true, isPublished: true }, { new: true });
    if (!video) {
      return res.status(404).json({ success: false, message: 'রিলস পাওয়া যায়নি।' });
    }
    res.json({ success: true, message: 'রিলস সফলভাবে অ্যাপ্রুভ ও পাবলিশ করা হয়েছে!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'অ্যাপ্রুভ করতে সমস্যা হয়েছে।' });
  }
});

export default router;
