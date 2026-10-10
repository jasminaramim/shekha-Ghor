import React, { useState, useEffect } from 'react';
import { ICourse } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CourseCard } from '../components/CourseCard.js';
import { ReportModal } from '../components/ReportModal.js';
import {
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle,
  Share2,
  Bookmark,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  ArrowRight,
} from 'lucide-react';

interface CourseDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ slug, navigate }) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      try {
        const res = await api.courses.getBySlug(slug);
        if (res.success && res.course) {
          setCourse(res.course);
          setRelatedCourses(res.relatedCourses || []);
          // Increment views
          api.courses.recordView(slug);
        }
      } catch (err) {
        console.error('Course detail error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#16803C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">কোর্সের বিবরণ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">কোর্সটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-600">অনুরোধকৃত কোর্সটি সরিয়ে নেওয়া হতে পারে অথবা লিংকটি ভুল।</p>
        <button
          onClick={() => navigate('/courses')}
          className="px-5 py-2.5 bg-[#16803C] text-white text-sm font-semibold rounded-lg"
        >
          সকল কোর্স দেখুন
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarkedSlugs.includes(course.slug);

  const firstLesson =
    course.modules?.[0]?.lessons?.[0]?.slug || 'lesson-1';

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-20 space-y-12">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-emerald-900 to-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <button
                  onClick={() => navigate('/courses')}
                  className="hover:underline cursor-pointer"
                >
                  সকল কোর্স
                </button>
                <span>/</span>
                <button
                  onClick={() => navigate(`/categories/${course.categorySlug}`)}
                  className="hover:underline cursor-pointer text-amber-300 font-semibold"
                >
                  {course.category?.name || course.categorySlug}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Quiet unboxed metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 pt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>প্রশিক্ষক: <strong>{course.instructor}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>সময়কাল: <strong>{course.duration}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>মোট পাঠ: <strong>{course.totalLessons} টি</strong></span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => navigate(`/learn/${course.slug}/${firstLesson}`)}
                  className="px-6 py-3 bg-[#FACC15] hover:bg-yellow-400 text-slate-900 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-5 h-5 fill-current" />
                  শেখা শুরু করুন (বিনামূল্যে)
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      alert('বুকমার্ক করতে লগইন প্রয়োজন।');
                      return;
                    }
                    toggleBookmark(course.slug);
                  }}
                  className={`p-3 rounded-xl border border-white/20 transition-colors cursor-pointer ${
                    isBookmarked ? 'bg-amber-400 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="বুকমার্ক করুন"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'লিংক কপি হয়েছে!' : 'শেয়ার করুন'}
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3 py-3 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  রিপোর্ট করুন
                </button>
              </div>
            </div>

            {/* Right Card (Course Preview Image) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black aspect-video group cursor-pointer"
                   onClick={() => navigate(`/learn/${course.slug}/${firstLesson}`)}>
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-950">
                    <PlayCircle className="w-16 h-16 text-[#FACC15]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white text-[#16803C] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Body: Syllabus & Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">এই কোর্স থেকে আপনি কী কী শিখবেন?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-[#16803C] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Syllabus / Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">কোর্সের সম্পূর্ণ সিলেবাস</h3>
                <span className="text-xs text-slate-500">
                  {course.modules?.length || 0} টি অধ্যায় · {course.totalLessons} টি ভিডিও পাঠ
                </span>
              </div>

              <div className="space-y-3">
                {course.modules?.map((mod, mIdx) => {
                  const isExpanded = !!expandedModules[mIdx];
                  return (
                    <div
                      key={mIdx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleModule(mIdx)}
                        className="w-full p-4 text-left flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#16803C] bg-emerald-100/80 px-2 py-0.5 rounded">
                            অধ্যায় {mIdx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{mod.lessons?.length || 0} টি পাঠ</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="divide-y divide-slate-100">
                          {mod.lessons?.map((lesson, lIdx) => (
                            <div
                              key={lIdx}
                              onClick={() => navigate(`/learn/${course.slug}/${lesson.slug}`)}
                              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-[#16803C] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#16803C] truncate">
                                    {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
                                <span>{lesson.duration || '১৫ মিনিট'}</span>
                                <span className="text-[#16803C] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                                  দেখুন →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Audience & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.audience && course.audience.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">কারা এই কোর্সটি করবেন?</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {course.audience.map((aud, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#16803C] font-bold">✓</span>
                        <span>{aud}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">প্রয়োজনীয় পূর্বশর্ত</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Instructor Bio Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-semibold text-slate-400 block uppercase">প্রশিক্ষকের পরিচিতি</span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#16803C] font-bold flex items-center justify-center text-lg">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{course.instructor}</h4>
                  <span className="text-xs text-slate-500">কনটেন্ট ক্রিয়েটর ও মেন্টর</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {course.instructorBio || 'অভিজ্ঞ প্রশিক্ষক ও ইন্ডাস্ট্রি স্পেশালিস্ট।'}
              </p>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">সম্পর্কিত অন্যান্য কোর্স</h4>
                <div className="space-y-3">
                  {relatedCourses.map((rel) => (
                    <div
                      key={rel.slug}
                      onClick={() => navigate(`/courses/${rel.slug}`)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-16 h-10 rounded-md bg-slate-200 overflow-hidden shrink-0">
                        {rel.thumbnail ? (
                          <img
                            src={rel.thumbnail}
                            alt={rel.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-800 flex items-center justify-center text-white text-[10px]">
                            শেখাঘর
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#16803C] truncate">
                          {rel.title}
                        </p>
                        <span className="text-[11px] text-slate-500">{rel.instructor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        courseSlug={course.slug}
        courseTitle={course.title}
      />
    </div>
  );
};
