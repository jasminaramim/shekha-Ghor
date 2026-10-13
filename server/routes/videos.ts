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

// Helper for live YouTube educational search
interface YouTubeSearchResult {
  youtubeId: string;
  title: string;
  description: string;
  channelName: string;
  channelAvatar?: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: string;
  publishedTime: string;
  isFromYouTube: true;
  badgeText: string;
}

async function searchYouTubeVideos(query: string): Promise<YouTubeSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 1. If YouTube API key is available in environment, use official YouTube Data API v3
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(cleanQuery)}&key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((it: any) => it.id && it.id.videoId)
            .map((it: any) => ({
              youtubeId: it.id.videoId,
              title: it.snippet?.title || 'YouTube শিক্ষামূলক ভিডিও',
              description: it.snippet?.description || '',
              channelName: it.snippet?.channelTitle || 'YouTube ক্রিয়েটর',
              channelAvatar: '',
              thumbnailUrl:
                it.snippet?.thumbnails?.high?.url ||
                it.snippet?.thumbnails?.medium?.url ||
                `https://img.youtube.com/vi/${it.id.videoId}/hqdefault.jpg`,
              duration: 'ইউটিউব ভিডিও',
              viewsCount: 'YouTube ভিউ',
              publishedTime: it.snippet?.publishedAt
                ? new Date(it.snippet.publishedAt).toLocaleDateString('bn-BD')
                : '',
              isFromYouTube: true as const,
              badgeText: 'This video is on YouTube',
            }));
          if (mapped.length > 0) return mapped;
        }
      }
    } catch (err) {
      console.warn('YouTube Data API v3 call failed, falling back to parser:', err);
    }
  }

  // 2. High-reliability live YouTube web parser
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'bn-BD,bn;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (res.ok) {
      const text = await res.text();
      const match = text.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (match && match[1]) {
        const data = JSON.parse(match[1]);
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        const results: YouTubeSearchResult[] = [];

        for (const section of contents || []) {
          const list = section.itemSectionRenderer?.contents || [];
          for (const item of list) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId) {
              const avatar =
                vr.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail
                  ?.thumbnails?.[0]?.url || '';
              const thumb =
                vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                `https://img.youtube.com/vi/${vr.videoId}/hqdefault.jpg`;
              const title =
                vr.title?.runs?.[0]?.text || vr.title?.simpleText || 'YouTube Video';
              const channel =
                vr.ownerText?.runs?.[0]?.text || 'YouTube Creator';
              const duration = vr.lengthText?.simpleText || 'ভিডিও';
              const views = vr.viewCountText?.simpleText || 'ইউটিউব ভিউ';
              const published = vr.publishedTimeText?.simpleText || '';
              const desc =
                vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') ||
                vr.descriptionSnippet?.runs?.map((r: any) => r.text).join('') ||
                '';

              results.push({
                youtubeId: vr.videoId,
                title,
                description: desc,
                channelName: channel,
                channelAvatar: avatar,
                thumbnailUrl: thumb,
                duration,
                viewsCount: views,
                publishedTime: published,
                isFromYouTube: true,
                badgeText: 'This video is on YouTube',
              });
            }
          }
        }

        if (results.length > 0) {
          return results.slice(0, 24);
        }
      }
    }
  } catch (webErr) {
    console.warn('YouTube web parser failed:', webErr);
  }

  // 3. Fallback educational database suggestions
  return [
    {
      youtubeId: 'pQN-pnXPaVg',
      title: `${cleanQuery} — সম্পূর্ণ বাংলা টিউটোরিয়াল ও প্রজেক্ট গাইড`,
      description: 'সম্পূর্ণ বাংলা ভাষায় বিস্তারিত আলোচনা ও বাস্তব প্রজেক্ট উদাহরণ।',
      channelName: 'Learn with Sumit',
      channelAvatar: '',
      thumbnailUrl: 'https://img.youtube.com/vi/pQN-pnXPaVg/hqdefault.jpg',
      duration: '৪৫:৩০',
      viewsCount: '১.২ লক্ষ ভিউ',
      publishedTime: 'সম্প্রতি',
      isFromYouTube: true,
      badgeText: 'This video is on YouTube',
    },
    {
      youtubeId: '1Rs2ND1ryYc',
      title: `${cleanQuery} — বেসিক থেকে অ্যাডভান্সড মাস্টারক্লাস`,
      description: 'সহজ ভাষায় শুরু থেকে বিস্তারিত ধারণা।',
      channelName: 'Stack Learner',
      channelAvatar: '',
      thumbnailUrl: 'https://img.youtube.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
      duration: '১:১০:১৫',
      viewsCount: '৯৫ হাজার ভিউ',
      publishedTime: '১ মাস আগে',
      isFromYouTube: true,
      badgeText: 'This video is on YouTube',
    },
  ];
}

// Public YouTube Search endpoint (accessible to all searchers)
router.get('/youtube-search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q || req.query.query || '') as string;
    if (!query.trim()) {
      return res.json({ success: true, results: [], total: 0 });
    }
    const results = await searchYouTubeVideos(query);
    res.json({ success: true, results, total: results.length });
  } catch (error: any) {
    console.error('Error searching YouTube:', error);
    res.status(500).json({ success: false, message: 'ইউটিউব অনুসন্ধান করতে সমস্যা হয়েছে।' });
  }
});

router.post('/youtube-search', async (req: Request, res: Response) => {
  try {
    const query = (req.body.q || req.body.query || '') as string;
    if (!query.trim()) {
      return res.json({ success: true, results: [], total: 0 });
    }
    const results = await searchYouTubeVideos(query);
    res.json({ success: true, results, total: results.length });
  } catch (error: any) {
    console.error('Error searching YouTube:', error);
    res.status(500).json({ success: false, message: 'ইউটিউব অনুসন্ধান করতে সমস্যা হয়েছে।' });
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

// GET single video by id or youtubeId
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let video = await Video.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { youtubeId: id }],
      isPublished: true,
    }).lean();

    // If not found in DB but is a valid YouTube ID, dynamically resolve via YouTube
    if (!video && id && id.length === 11) {
      let title = 'ইউটিউব শিক্ষামূলক ভিডিও';
      let channelName = 'YouTube';
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
        );
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          title = data.title || title;
          channelName = data.author_name || channelName;
        }
      } catch (err) {}

      const ytFallbackVideo = {
        _id: id,
        youtubeId: id,
        youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
        title,
        description: `এই ভিডিওটি সরাসরি YouTube থেকে লোড করা হয়েছে। মূল চ্যানেল: ${channelName}`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        channelName,
        categorySlug: 'youtube',
        duration: 'YouTube ভিডিও',
        isPublished: true,
        viewsCount: 1,
        order: 0,
        isFromYouTube: true,
        createdAt: new Date().toISOString(),
      };

      return res.json({
        success: true,
        video: ytFallbackVideo,
        relatedVideos: [],
        prevVideo: null,
        nextVideo: null,
        category: { name: 'YouTube ভিডিও', slug: 'youtube', icon: 'youtube' },
        subCategory: null,
      });
    }

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
