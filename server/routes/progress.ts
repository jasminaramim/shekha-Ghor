import { Router, Response } from 'express';
import { LessonProgress, Course, User } from '../db/models.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET all progress for logged-in user
router.get('/my-progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const progressRecords = await LessonProgress.find({ userId: req.user._id }).lean();

    // Group by courseSlug
    const courseProgressMap: Record<
      string,
      { completedLessonIds: string[]; notesCount: number; totalCompleted: number }
    > = {};

    progressRecords.forEach((item) => {
      if (!courseProgressMap[item.courseSlug]) {
        courseProgressMap[item.courseSlug] = {
          completedLessonIds: [],
          notesCount: 0,
          totalCompleted: 0,
        };
      }
      if (item.completed) {
        courseProgressMap[item.courseSlug].completedLessonIds.push(item.lessonId);
        courseProgressMap[item.courseSlug].totalCompleted += 1;
      }
      if (item.notes && item.notes.trim() !== '') {
        courseProgressMap[item.courseSlug].notesCount += 1;
      }
    });

    res.json({
      success: true,
      progress: courseProgressMap,
      raw: progressRecords,
    });
  } catch (error) {
    console.error('Error fetching my-progress:', error);
    res.status(500).json({ success: false, message: 'অগ্রগতি তথ্য লোড করতে ব্যর্থ।' });
  }
});

// GET progress for a single course
router.get('/course/:courseSlug', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseSlug } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const [progressList, course] = await Promise.all([
      LessonProgress.find({ userId: req.user._id, courseSlug }).lean(),
      Course.findOne({ slug: courseSlug }).lean(),
    ]);

    if (!course) {
      return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি।' });
    }

    let totalLessons = 0;
    course.modules?.forEach((m: any) => {
      if (m.lessons) totalLessons += m.lessons.length;
    });

    const completedLessonIds = progressList
      .filter((p) => p.completed)
      .map((p) => p.lessonId);

    const notesMap: Record<string, string> = {};
    progressList.forEach((p) => {
      if (p.notes) notesMap[p.lessonId] = p.notes;
    });

    const completionPercentage =
      totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

    res.json({
      success: true,
      courseSlug,
      completedLessonIds,
      notesMap,
      totalCompleted: completedLessonIds.length,
      totalLessons,
      completionPercentage,
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ success: false, message: 'কোর্সের অগ্রগতি লোড করতে ব্যর্থ।' });
  }
});

// Toggle Lesson Completion
router.post('/toggle-lesson', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseSlug, lessonId, completed } = req.body;

    if (!courseSlug || !lessonId) {
      return res.status(400).json({ success: false, message: 'কোর্স ও পাঠের তথ্য আবশ্যক।' });
    }

    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    let record = await LessonProgress.findOne({
      userId: req.user._id,
      courseSlug,
      lessonId,
    });

    const shouldComplete = typeof completed === 'boolean' ? completed : !record?.completed;

    if (record) {
      record.completed = shouldComplete;
      record.lastWatchedAt = new Date();
      await record.save();
    } else {
      record = await LessonProgress.create({
        userId: req.user._id,
        courseSlug,
        lessonId,
        completed: shouldComplete,
        notes: '',
        lastWatchedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: shouldComplete ? 'পাঠটি সম্পন্ন হিসেবে চিহ্নিত হয়েছে।' : 'পাঠটি অসম্পূর্ণ হিসেবে চিহ্নিত হয়েছে।',
      completed: shouldComplete,
      lessonId,
    });
  } catch (error) {
    console.error('Error toggling lesson progress:', error);
    res.status(500).json({ success: false, message: 'অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে।' });
  }
});

// Save or Update Personal Note for a lesson
router.post('/note', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseSlug, lessonId, notes } = req.body;

    if (!courseSlug || !lessonId) {
      return res.status(400).json({ success: false, message: 'কোর্স ও পাঠের তথ্য আবশ্যক।' });
    }

    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const updated = await LessonProgress.findOneAndUpdate(
      { userId: req.user._id, courseSlug, lessonId },
      { notes: notes || '', lastWatchedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'নোট সফলভাবে সংরক্ষিত হয়েছে।',
      notes: updated.notes,
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ success: false, message: 'নোট সংরক্ষণ ব্যর্থ হয়েছে।' });
  }
});

// Toggle Course Bookmark
router.post('/bookmarks/toggle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseSlug } = req.body;
    if (!courseSlug) return res.status(400).json({ success: false, message: 'কোর্স আবশ্যক।' });
    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি।' });

    const isBookmarked = user.bookmarks.includes(courseSlug);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((slug: string) => slug !== courseSlug);
    } else {
      user.bookmarks.push(courseSlug);
    }

    await user.save();

    res.json({
      success: true,
      isBookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
      message: !isBookmarked ? 'কোর্সটি সংরক্ষিত তালিকায় যোগ হয়েছে।' : 'সংরক্ষিত তালিকা থেকে সরানো হয়েছে।',
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ success: false, message: 'বুকমার্ক পরিবর্তন ব্যর্থ।' });
  }
});

// GET user bookmarked courses
router.get('/bookmarks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি।' });

    const courses = await Course.find({ slug: { $in: user.bookmarks }, isPublished: true }).lean();

    const formattedCourses = courses.map((c: any) => {
      let totalLessons = 0;
      if (c.modules) {
        c.modules.forEach((m: any) => {
          if (m.lessons) totalLessons += m.lessons.length;
        });
      }
      return { ...c, totalLessons };
    });

    res.json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ success: false, message: 'বুকমার্ক তালিকা লোড করতে ব্যর্থ।' });
  }
});

export default router;
