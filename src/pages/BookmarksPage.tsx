import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ICourse } from '../types/index.js';
import { CourseCard } from '../components/CourseCard.js';
import { BookMarked, ArrowLeft } from 'lucide-react';

interface BookmarksPageProps {
  navigate: (path: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      if (!user) {
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        const res = await api.progress.getBookmarks();
        if (res.success && res.courses) {
          setCourses(res.courses);
        }
      } catch (err) {
        console.error('Bookmarks load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#16803C] transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরে যান
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          সংরক্ষিত কোর্সসমূহ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          পরবর্তীতে দেখার সুবিধার্থে আপনার পছন্দের তালিকায় রাখা সকল কোর্স
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              onSelect={(slug) => navigate(`/courses/${slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">কোনো সংরক্ষিত কোর্স নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            যেকোনো কোর্সের কার্ডে বুকমার্ক আইকনে ক্লিক করে পছন্দের তালিকায় যুক্ত করতে পারেন।
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-[#16803C] text-white text-xs font-semibold rounded-lg"
          >
            কোর্স ব্রাউজ করুন
          </button>
        </div>
      )}
    </div>
  );
};
