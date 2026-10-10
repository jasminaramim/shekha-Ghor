import React, { useState, useEffect } from 'react';
import { ICategory, ICourse } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface CategoryDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ slug, navigate }) => {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);
      try {
        const res = await api.categories.getBySlug(slug);
        if (res.success && res.category) {
          setCategory(res.category);
          setCourses(res.courses || []);
        }
      } catch (err) {
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#16803C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-sm text-slate-500">ক্যাটাগরি ডেটা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-900">ক্যাটাগরিটি পাওয়া যায়নি</h3>
        <button
          onClick={() => navigate('/categories')}
          className="px-4 py-2 bg-[#16803C] text-white text-xs font-semibold rounded-lg"
        >
          সকল ক্যাটাগরি দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & Title Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/categories')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#16803C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          সকল ক্যাটাগরিতে ফিরে যান
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-[#16803C] uppercase tracking-wider block mb-1">
            ক্যাটাগরি আর্কাইভ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {category.description || 'এই বিষয়ের আওতাধীন সকল কোর্স ও ভিডিও টিউটোরিয়াল।'}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            মোট <strong>{courses.length}</strong> টি কোর্স উপলব্ধ
          </div>
        </div>
      </div>

      {/* Courses in this category */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">কোর্স ও টিউটোরিয়াল তালিকা</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                onSelect={(cSlug) => navigate(`/courses/${cSlug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              এই ক্যাটাগরিতে এখনো কোনো কোর্স প্রকাশিত হয়নি
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আমাদের টিম দ্রুত এই বিষয়ে নতুন ভিডিও ও প্লেলিস্ট যুক্ত করছে। আপনি অন্যান্য বিষয়ের কোর্সগুলো দেখতে পারেন।
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 text-xs font-semibold text-[#16803C] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              অন্যান্য কোর্স ব্রাউজ করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
