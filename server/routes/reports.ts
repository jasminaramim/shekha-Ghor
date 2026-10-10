import { Router, Request, Response } from 'express';
import { Report } from '../db/models.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Public: Submit report
router.post('/', async (req: Request, res: Response) => {
  try {
    const { courseSlug, courseTitle, lessonId, lessonTitle, reason, details, userEmail } = req.body;

    if (!courseSlug || !reason) {
      return res.status(400).json({ success: false, message: 'রিপোর্টের কারণ ও কোর্সের তথ্য দিন।' });
    }

    const report = await Report.create({
      courseSlug,
      courseTitle: courseTitle || '',
      lessonId: lessonId || '',
      lessonTitle: lessonTitle || '',
      reason,
      details: details || '',
      userEmail: userEmail || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'আপনার রিপোর্টটি গৃহীত হয়েছে। কর্তৃপক্ষ দ্রুত বিষয়টি পর্যালোচনা করবে।',
      reportId: report._id,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'রিপোর্ট পাঠানো সম্ভব হয়নি।' });
  }
});

// Admin: View all reports
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'রিপোর্ট তালিকা লোড ব্যর্থ।' });
  }
});

// Admin: Update report status
router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'রিপোর্ট পাওয়া যায়নি।' });

    report.status = status;
    await report.save();

    res.json({ success: true, message: 'রিপোর্ট স্ট্যাটাস হালনাগাদ করা হয়েছে।', report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'স্ট্যাটাস পরিবর্তন ব্যর্থ।' });
  }
});

export default router;
