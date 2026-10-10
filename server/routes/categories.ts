import { Router, Request, Response } from 'express';
import { Category, Course } from '../db/models.js';

const router = Router();

// GET all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();

    // Recalculate courseCount dynamically
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Course.countDocuments({ categorySlug: cat.slug, isPublished: true });
        return {
          ...cat,
          courseCount: count,
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'ক্যাটাগরি তালিকা লোড করতে ব্যর্থ।' });
  }
});

// GET single category by slug + courses
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরিটি পাওয়া যায়নি।' });
    }

    const courses = await Course.find({ categorySlug: slug, isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    const formattedCourses = courses.map((c: any) => {
      let totalLessons = 0;
      if (c.modules) {
        c.modules.forEach((m: any) => {
          if (m.lessons) totalLessons += m.lessons.length;
        });
      }
      return {
        ...c,
        totalLessons,
      };
    });

    res.json({
      success: true,
      category: {
        ...category,
        courseCount: formattedCourses.length,
      },
      courses: formattedCourses,
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'ক্যাটাগরির তথ্য লোড করতে ব্যর্থ।' });
  }
});

export default router;
