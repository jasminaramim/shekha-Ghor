import { Router, Request, Response } from 'express';
import { Course, Category } from '../db/models.js';

const router = Router();

// GET all courses with filter, search, sort
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sort, featured, page = 1, limit = 12 } = req.query;

    const query: any = { isPublished: true };

    if (category && category !== 'all') {
      query.categorySlug = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { instructor: searchRegex },
        { categorySlug: searchRegex },
        { 'modules.lessons.title': searchRegex },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { viewsCount: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Course.countDocuments(query),
    ]);

    // Enhance courses with lessons count
    const formattedCourses = courses.map((course: any) => {
      let totalLessons = 0;
      if (course.modules) {
        course.modules.forEach((mod: any) => {
          if (mod.lessons) totalLessons += mod.lessons.length;
        });
      }
      return {
        ...course,
        totalLessons,
      };
    });

    res.json({
      success: true,
      courses: formattedCourses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'কোর্স তালিকা লোড করতে সমস্যা হয়েছে।' });
  }
});

// GET single course by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug, isPublished: true }).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'কোর্সটি পাওয়া যায়নি।' });
    }

    // Get Category details
    const category = await Category.findOne({ slug: course.categorySlug }).lean();

    // Related courses in the same category
    const relatedCourses = await Course.find({
      categorySlug: course.categorySlug,
      slug: { $ne: course.slug },
      isPublished: true,
    })
      .limit(3)
      .lean();

    let totalLessons = 0;
    if (course.modules) {
      course.modules.forEach((mod: any) => {
        if (mod.lessons) totalLessons += mod.lessons.length;
      });
    }

    res.json({
      success: true,
      course: {
        ...course,
        totalLessons,
        category,
      },
      relatedCourses,
    });
  } catch (error: any) {
    console.error('Error fetching single course:', error);
    res.status(500).json({ success: false, message: 'কোর্সের তথ্য লোড করতে ব্যর্থ।' });
  }
});

// Increment views count
router.post('/:slug/view', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    await Course.updateOne({ slug }, { $inc: { viewsCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// GET lesson details for video learning page
router.get('/:courseSlug/lessons/:lessonSlug', async (req: Request, res: Response) => {
  try {
    const { courseSlug, lessonSlug } = req.params;
    const course = await Course.findOne({ slug: courseSlug, isPublished: true }).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'কোর্সটি পাওয়া যায়নি।' });
    }

    // Flatten all lessons across all modules to find current, prev, and next
    const allLessons: any[] = [];
    course.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((l: any) => {
        allLessons.push({
          ...l,
          moduleTitle: mod.title,
        });
      });
    });

    const currentIndex = allLessons.findIndex(
      (l) => l.slug === lessonSlug || l._id?.toString() === lessonSlug || l.id === lessonSlug
    );

    if (currentIndex === -1) {
      return res.status(404).json({ success: false, message: 'ভিডিও পাঠ পাওয়া যায়নি।' });
    }

    const currentLesson = allLessons[currentIndex];
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    res.json({
      success: true,
      course: {
        title: course.title,
        slug: course.slug,
        instructor: course.instructor,
        instructorBio: course.instructorBio,
        categorySlug: course.categorySlug,
        modules: course.modules,
        totalLessons: allLessons.length,
      },
      currentLesson,
      prevLesson: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
      nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
      currentIndex,
      totalLessons: allLessons.length,
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, message: 'পাঠের তথ্য লোড করতে ব্যর্থ।' });
  }
});

export default router;
