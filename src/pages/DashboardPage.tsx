import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ICourse } from '../types/index.js';
import { CourseCard } from '../components/CourseCard.js';
import {
  LayoutDashboard,
  CheckCircle2,
  BookMarked,
  BookOpen,
  Edit3,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<ICourse[]>([]);
  const [progressSummary, setProgressSummary] = useState<Record<string, any>>({});
  const [allCourses, setAllCourses] = useState<ICourse[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        const [bmRes, progRes, courseRes] = await Promise.all([
          api.progress.getBookmarks(),
          api.progress.getMyProgress(),
          api.courses.getAll({ limit: 50 }),
        ]);

        if (bmRes.success && bmRes.courses) {
          setBookmarkedCourses(bmRes.courses);
        }
        if (progRes.success && progRes.progress) {
          setProgressSummary(progRes.progress);
        }
        if (courseRes.success && courseRes.courses) {
          setAllCourses(courseRes.courses);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) return null;

  // Courses in progress (courses where user has completed at least 1 lesson)
  const inProgressCourses = allCourses.filter(
    (c) => progressSummary[c.slug]?.totalCompleted > 0
  );

  let totalCompletedLessonsAcrossAll = 0;
  Object.values(progressSummary).forEach((p: any) => {
    totalCompletedLessonsAcrossAll += p.totalCompleted || 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#16803C] text-white text-3xl font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-xs text-slate-500">
              ইউজারনেম: <span className="font-mono text-slate-700">@{user.username}</span> · ইমেইল:{' '}
              {user.email}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                শিক্ষার্থী অ্যাকাউন্ট
              </span>
              {user.role === 'admin' && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  সিস্টেম অ্যাডমিন
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">সম্পন্ন পাঠ</span>
            <span className="text-xl font-bold text-[#16803C]">
              {totalCompletedLessonsAcrossAll}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">সংরক্ষিত কোর্স</span>
            <span className="text-xl font-bold text-amber-600">{bookmarkedCourses.length}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/upload-reel')}
          className="px-6 py-3 bg-[#16803C] hover:bg-[#105C2B] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          রিলস যোগ করুন
        </button>
      </div>

      {/* 2. Ongoing Learning Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">আপনার চলমান শেখার অগ্রগতি</h2>

        {inProgressCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {inProgressCourses.map((c) => {
              const prog = progressSummary[c.slug];
              const totalLessons = c.totalLessons || 1;
              const percent = Math.min(
                100,
                Math.round(((prog?.totalCompleted || 0) / totalLessons) * 100)
              );
              const firstLesson = c.modules?.[0]?.lessons?.[0]?.slug || 'lesson-1';

              return (
                <div
                  key={c.slug}
                  className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#16803C]">{c.categorySlug}</span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-500">{c.instructor}</p>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>অগ্রগতি</span>
                        <span className="font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#16803C] h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {prog?.totalCompleted || 0} / {totalLessons} পাঠ সম্পন্ন
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/learn/${c.slug}/${firstLesson}`)}
                    className="w-full mt-3 py-2 text-xs font-semibold text-white bg-[#16803C] hover:bg-[#105C2B] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    শেখা চালিয়ে যান →
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              আপনি এখনো কোনো কোর্সের ভিডিও সম্পন্ন হিসেবে চিহ্নিত করেননি।
            </p>
            <p className="text-xs text-slate-500">
              যেকোনো কোর্সে প্রবেশ করে ভিডিও পাঠ দেখা শুরু করুন এবং আপনার অগ্রগতি ট্র্যাক করুন।
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-[#16803C] text-white text-xs font-semibold rounded-lg"
            >
              কোর্স এক্সপ্লোর করুন
            </button>
          </div>
        )}
      </section>

      {/* 3. Bookmarked Courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">সংরক্ষিত কোর্সসমূহ (বুকমার্ক)</h2>
          <button
            onClick={() => navigate('/bookmarks')}
            className="text-xs font-semibold text-[#16803C] hover:underline"
          >
            সব দেখুন ({bookmarkedCourses.length})
          </button>
        </div>

        {bookmarkedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedCourses.slice(0, 3).map((c) => (
              <CourseCard key={c.slug} course={c} onSelect={(slug) => navigate(`/courses/${slug}`)} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              আপনার পছন্দের কোনো কোর্স বুকমার্ক করে রাখলে তা এখানে দেখতে পাবেন।
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
