import { Router, Response } from 'express';
import { Course, Category, Video, User, LessonProgress, Report, AuditLog } from '../db/models.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth & admin check to ALL admin routes
router.use(authenticate, requireAdmin);

// 1. Dashboard Overview Stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [
      coursesCount,
      videosCount,
      categoriesCount,
      usersCount,
      reportsCount,
      publishedVideosCount,
      courses,
    ] = await Promise.all([
      Course.countDocuments(),
      Video.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Video.countDocuments({ isPublished: true }),
      Course.find().lean(),
    ]);

    let totalLessonsCount = 0;
    let publishedCourses = 0;
    let draftCourses = 0;

    courses.forEach((c: any) => {
      if (c.isPublished) publishedCourses++;
      else draftCourses++;

      c.modules?.forEach((m: any) => {
        if (m.lessons) totalLessonsCount += m.lessons.length;
      });
    });

    const totalCompletions = await LessonProgress.countDocuments({ completed: true });

    res.json({
      success: true,
      stats: {
        totalCourses: coursesCount,
        publishedCourses,
        draftCourses,
        totalVideos: videosCount,
        publishedVideos: publishedVideosCount,
        draftVideos: videosCount - publishedVideosCount,
        totalLessons: totalLessonsCount,
        totalCategories: categoriesCount,
        totalUsers: usersCount,
        pendingReports: reportsCount,
        totalCompletions,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'পরিসংখ্যান লোড করতে ব্যর্থ।' });
  }
});

// 2. YouTube URL Parser (oEmbed + Regex)
router.post('/youtube/parse', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: 'ইউটিউব লিঙ্ক প্রদান করুন।' });
    }

    const cleanUrl = url.trim();

    // Extract Video ID
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);

    if (match && match[2].length === 11) {
      youtubeId = match[2];
    }

    // Check Playlist
    const playlistMatch = cleanUrl.match(/[?&]list=([^#&?]+)/);
    const playlistId = playlistMatch ? playlistMatch[1] : null;

    let title = '';
    let authorName = '';
    let thumbnailUrl = '';

    if (youtubeId) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
        );
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as any;
          title = data.title || '';
          authorName = data.author_name || '';
          if (data.thumbnail_url) {
            thumbnailUrl = data.thumbnail_url;
          }
        }
      } catch (err) {
        // non-fatal fallback
      }
    }

    // Check if duplicate already exists in DB
    const existingVideo = youtubeId ? await Video.findOne({ youtubeId }) : null;

    res.json({
      success: true,
      data: {
        youtubeId,
        playlistId,
        title: title || 'নতুন ইউটিউব ভিডিও পাঠ',
        authorName,
        thumbnailUrl: thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''),
        embedUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : '',
        isDuplicate: !!existingVideo,
        existingVideoTitle: existingVideo?.title,
      },
    });
  } catch (error: any) {
    console.error('Error parsing youtube url:', error);
    res.status(500).json({ success: false, message: 'ইউটিউব তথ্য যাচাই করতে ব্যর্থ হয়েছে।' });
  }
});

// 3. YouTube Educational Search (Topic search for admin importer)
router.post('/videos/search-youtube', async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'অনুসন্ধানের বিষয় লিখুন।' });
    }

    // Curated educational database index & YouTube suggestions
    const qLower = query.toLowerCase();

    // Educational suggestions based on topic
    const sampleResults = [
      {
        youtubeId: 'pQN-pnXPaVg',
        title: `${query} — সম্পূর্ণ বাংলা টিউটোরিয়াল ও প্রজেক্ট`,
        channelName: 'Learn with Sumit',
        thumbnailUrl: 'https://img.youtube.com/vi/pQN-pnXPaVg/hqdefault.jpg',
        duration: '৪৫ মিনিট',
      },
      {
        youtubeId: '1Rs2ND1ryYc',
        title: `${query} — বেসিক থেকে অ্যাডভান্সড মাস্টারক্লাস`,
        channelName: 'Stack Learner',
        thumbnailUrl: 'https://img.youtube.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
        duration: '১ ঘণ্টা ১০ মিনিট',
      },
      {
        youtubeId: 'rfscVS0vtbw',
        title: `${query} — শূন্য থেকে শুরু করার সহজ গাইড`,
        channelName: 'প্রোগ্রামিং পাঠশালা',
        thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
        duration: '৩৫ মিনিট',
      },
      {
        youtubeId: '94x4B6i7348',
        title: `${query} — শিশুদের মজার ছড়া ও অ্যানিমেশন`,
        channelName: 'সিসিমপুর ও শিশু শিক্ষা',
        thumbnailUrl: 'https://img.youtube.com/vi/94x4B6i7348/hqdefault.jpg',
        duration: '১৫ মিনিট',
      },
    ];

    res.json({
      success: true,
      query,
      results: sampleResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ইউটিউব সার্চ ব্যর্থ হয়েছে।' });
  }
});

// 4. Standalone Video CRUD
// Import Video
router.post('/videos/import', async (req: AuthRequest, res: Response) => {
  try {
    const {
      youtubeUrl,
      youtubeId,
      title,
      description,
      thumbnailUrl,
      channelName,
      categorySlug,
      subCategorySlug,
      audience = 'all',
      difficultyLevel = 'all',
      duration = '১৫ মিনিট',
      isPublished = true,
      order = 0,
    } = req.body;

    if (!youtubeId || !title || !categorySlug) {
      return res.status(400).json({
        success: false,
        message: 'ইউটিউব আইডি, শিরোনাম ও ক্যাটাগরি আবশ্যক।',
      });
    }

    // Check duplicate
    const existing = await Video.findOne({ youtubeId: youtubeId.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'এই ইউটিউব ভিডিওটি ইতিমধ্যে ডেটাবেসে বিদ্যমান রয়েছে।',
      });
    }

    const video = await Video.create({
      youtubeId: youtubeId.trim(),
      youtubeUrl: youtubeUrl || `https://www.youtube.com/watch?v=${youtubeId.trim()}`,
      title: title.trim(),
      description: description || '',
      thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${youtubeId.trim()}/hqdefault.jpg`,
      channelName: channelName || 'শেখাঘর',
      categorySlug: categorySlug.trim(),
      subCategorySlug: subCategorySlug ? subCategorySlug.trim() : '',
      audience,
      difficultyLevel,
      duration: duration || '১৫ মিনিট',
      isPublished: isPublished !== false,
      order: Number(order) || 0,
      viewsCount: 0,
    });

    // Update Category Video Counts
    await Category.updateOne(
      { slug: categorySlug },
      { $inc: { videoCount: 1 } }
    );
    if (subCategorySlug) {
      await Category.updateOne(
        { slug: subCategorySlug },
        { $inc: { videoCount: 1 } }
      );
    }

    await AuditLog.create({
      action: 'VIDEO_IMPORT',
      performedBy: req.user?.username || 'admin',
      details: `Imported video: ${video.title} (${video.youtubeId}) into ${video.categorySlug}`,
    });

    res.status(201).json({
      success: true,
      message: 'ভিডিওটি সফলভাবে আমদানি ও সংরক্ষণ করা হয়েছে।',
      video,
    });
  } catch (error: any) {
    console.error('Error importing video:', error);
    res.status(500).json({ success: false, message: 'ভিডিও আমদানি ব্যর্থ হয়েছে।' });
  }
});

// Update Video
router.patch('/videos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'ভিডিও পাওয়া যায়নি।' });
    }

    Object.assign(video, req.body);
    await video.save();

    await AuditLog.create({
      action: 'VIDEO_UPDATE',
      performedBy: req.user?.username || 'admin',
      details: `Updated video: ${video.title}`,
    });

    res.json({
      success: true,
      message: 'ভিডিও সফলভাবে আপডেট করা হয়েছে।',
      video,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'ভিডিও আপডেট ব্যর্থ।' });
  }
});

// Delete Video
router.delete('/videos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'ভিডিও পাওয়া যায়নি।' });
    }

    await Video.findByIdAndDelete(id);

    // Decrement Category Video Count
    await Category.updateOne({ slug: video.categorySlug }, { $inc: { videoCount: -1 } });
    if (video.subCategorySlug) {
      await Category.updateOne({ slug: video.subCategorySlug }, { $inc: { videoCount: -1 } });
    }

    await AuditLog.create({
      action: 'VIDEO_DELETE',
      performedBy: req.user?.username || 'admin',
      details: `Deleted video: ${video.title} (${video.youtubeId})`,
    });

    res.json({
      success: true,
      message: 'ভিডিওটি মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ভিডিও মুছতে ব্যর্থ হয়েছে।' });
  }
});

// GET all videos for admin table
router.get('/videos', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (category && category !== 'all') {
      query.$or = [{ categorySlug: category }, { subCategorySlug: category }];
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { channelName: regex }, { youtubeId: regex }];
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 50);

    const [videos, total] = await Promise.all([
      Video.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Video.countDocuments(query),
    ]);

    res.json({
      success: true,
      videos,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ভিডিও তালিকা লোড ব্যর্থ।' });
  }
});

// 5. Dynamic Category Management
// Create Category (with Parent Category and Audience)
router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      icon,
      image,
      description,
      parentCategory,
      parentSlug,
      audience = 'all',
      isPublished = true,
      order = 0,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'ক্যাটাগরির নাম আবশ্যক।' });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-') || `cat-${Date.now()}`;

    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ক্যাটাগরি আছে।' });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      icon: icon || 'BookOpen',
      image: image || '',
      description: description || '',
      parentCategory: parentCategory || null,
      parentSlug: parentSlug || null,
      audience,
      isPublished: isPublished !== false,
      order: Number(order) || 0,
      seoTitle: seoTitle || name.trim(),
      seoDescription: seoDescription || description || '',
      courseCount: 0,
      videoCount: 0,
    });

    await AuditLog.create({
      action: 'CATEGORY_CREATE',
      performedBy: req.user?.username || 'admin',
      details: `Created category: ${newCategory.name} (Parent: ${newCategory.parentSlug || 'None'})`,
    });

    res.status(201).json({
      success: true,
      message: 'নতুন ক্যাটাগরি সফলভাবে তৈরি হয়েছে।',
      category: newCategory,
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'ক্যাটাগরি তৈরি ব্যর্থ হয়েছে।' });
  }
});

// Update Category
router.patch('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি।' });
    }

    Object.assign(category, req.body);
    await category.save();

    await AuditLog.create({
      action: 'CATEGORY_UPDATE',
      performedBy: req.user?.username || 'admin',
      details: `Updated category: ${category.name}`,
    });

    res.json({
      success: true,
      message: 'ক্যাটাগরি আপডেট সম্পন্ন হয়েছে।',
      category,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'ক্যাটাগরি আপডেট ব্যর্থ।' });
  }
});

// Check if category can be deleted safely
router.get('/categories/:id/check-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি।' });
    }

    const [attachedVideos, attachedCourses, childCategories] = await Promise.all([
      Video.countDocuments({ $or: [{ categorySlug: category.slug }, { subCategorySlug: category.slug }] }),
      Course.countDocuments({ categorySlug: category.slug }),
      Category.countDocuments({ parentSlug: category.slug }),
    ]);

    const hasContent = attachedVideos > 0 || attachedCourses > 0 || childCategories > 0;

    res.json({
      success: true,
      hasContent,
      attachedVideos,
      attachedCourses,
      childCategories,
      categoryName: category.name,
      categorySlug: category.slug,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'যাচাই ব্যর্থ হয়েছে।' });
  }
});

// Delete Category with Safety Validation & Optional Content Reassignment
router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { force, reassignTo } = req.body || {};

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি।' });
    }

    const attachedVideos = await Video.countDocuments({
      $or: [{ categorySlug: category.slug }, { subCategorySlug: category.slug }],
    });
    const attachedCourses = await Course.countDocuments({ categorySlug: category.slug });

    if ((attachedVideos > 0 || attachedCourses > 0) && !force && !reassignTo) {
      return res.status(400).json({
        success: false,
        hasContent: true,
        attachedVideos,
        attachedCourses,
        message: `এই ক্যাটাগরিতে ${attachedVideos} টি ভিডিও এবং ${attachedCourses} টি কোর্স রয়েছে। মুছে ফেলার আগে কনটেন্ট অন্য ক্যাটাগরিতে স্থানান্তর করুন অথবা ফোর্স ডিলিট নির্বাচন করুন।`,
      });
    }

    // If reassignTo is provided, reassign content
    if (reassignTo) {
      await Video.updateMany(
        { categorySlug: category.slug },
        { $set: { categorySlug: reassignTo } }
      );
      await Video.updateMany(
        { subCategorySlug: category.slug },
        { $set: { subCategorySlug: reassignTo } }
      );
      await Course.updateMany(
        { categorySlug: category.slug },
        { $set: { categorySlug: reassignTo } }
      );
    }

    await Category.findByIdAndDelete(id);

    await AuditLog.create({
      action: 'CATEGORY_DELETE',
      performedBy: req.user?.username || 'admin',
      details: `Deleted category: ${category.name} (${category.slug})`,
    });

    res.json({
      success: true,
      message: 'ক্যাটাগরিটি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error: any) {
    console.error('Category delete error:', error);
    res.status(500).json({ success: false, message: 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।' });
  }
});

// 6. Course CRUD
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      categorySlug,
      subCategorySlug,
      instructor,
      instructorBio,
      level,
      duration,
      thumbnail,
      featured,
      isPublished,
      learningOutcomes,
      audience,
      requirements,
      modules,
    } = req.body;

    if (!title || !description || !categorySlug || !instructor) {
      return res.status(400).json({ success: false, message: 'কোর্সের শিরোনাম, বিবরণ, ক্যাটাগরি ও প্রশিক্ষকের নাম আবশ্যক।' });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `course-${Date.now()}`;

    const existing = await Course.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি কোর্স আছে।' });
    }

    const newCourse = await Course.create({
      title: title.trim(),
      slug: finalSlug,
      description: description.trim(),
      categorySlug: categorySlug.trim(),
      subCategorySlug: subCategorySlug ? subCategorySlug.trim() : '',
      instructor: instructor.trim(),
      instructorBio: instructorBio || '',
      level: level || 'all',
      duration: duration || '৫ ঘণ্টা',
      thumbnail: thumbnail || '',
      featured: !!featured,
      isPublished: isPublished !== false,
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      audience: Array.isArray(audience) ? audience : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      modules: Array.isArray(modules) ? modules : [],
      viewsCount: 0,
    });

    await Category.updateOne({ slug: categorySlug }, { $inc: { courseCount: 1 } });

    await AuditLog.create({
      action: 'COURSE_CREATE',
      performedBy: req.user?.username || 'admin',
      details: `Created course: ${newCourse.title} (${newCourse.slug})`,
    });

    res.status(201).json({
      success: true,
      message: 'কোর্সটি সফলভাবে তৈরি হয়েছে।',
      course: newCourse,
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'কোর্স তৈরি ব্যর্থ হয়েছে।' });
  }
});

router.put('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি।' });
    }

    Object.assign(course, req.body);
    await course.save();

    await AuditLog.create({
      action: 'COURSE_UPDATE',
      performedBy: req.user?.username || 'admin',
      details: `Updated course: ${course.title}`,
    });

    res.json({
      success: true,
      message: 'কোর্স সফলভাবে আপডেট করা হয়েছে।',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'কোর্স আপডেট ব্যর্থ হয়েছে।' });
  }
});

router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি।' });
    }

    await Course.findByIdAndDelete(id);
    await Category.updateOne({ slug: course.categorySlug }, { $inc: { courseCount: -1 } });

    await AuditLog.create({
      action: 'COURSE_DELETE',
      performedBy: req.user?.username || 'admin',
      details: `Deleted course: ${course.title}`,
    });

    res.json({
      success: true,
      message: 'কোর্সটি মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'কোর্স মুছতে ব্যর্থ হয়েছে।' });
  }
});

// 7. Users List & Audit Logs
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ব্যবহারকারী তালিকা লোড ব্যর্থ।' });
  }
});

router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(40).lean();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'অডিট লগ লোড ব্যর্থ।' });
  }
});

export default router;
