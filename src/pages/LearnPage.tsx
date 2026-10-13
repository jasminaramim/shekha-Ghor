import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { ReportModal } from '../components/ReportModal.js';
import { ILesson, ICourseProgress } from '../types/index.js';
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Edit3,
  Save,
  AlertTriangle,
  Bookmark,
  Share2,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface LearnPageProps {
  courseSlug: string;
  lessonSlug: string;
  navigate: (path: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  courseSlug,
  lessonSlug,
  navigate,
}) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<{ slug: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ slug: string; title: string } | null>(null);

  const [progress, setProgress] = useState<ICourseProgress | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load lesson & course info
  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      try {
        const res = await api.courses.getLesson(courseSlug, lessonSlug);
        if (res.success && res.currentLesson) {
          setCourseData(res.course);
          setCurrentLesson(res.currentLesson);
          setPrevLesson(res.prevLesson);
          setNextLesson(res.nextLesson);
        }

        // If user logged in, load progress & notes
        if (user) {
          const progRes = await api.progress.getCourseProgress(courseSlug);
          if (progRes.success && progRes.data) {
            setProgress(progRes.data);
            const lessonId = res.currentLesson?._id || res.currentLesson?.slug || lessonSlug;
            setIsCompleted(progRes.data.completedLessonIds.includes(lessonId));
            setNoteContent(progRes.data.notesMap[lessonId] || '');
          }
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [courseSlug, lessonSlug, user]);

  const activeLessonId = currentLesson?._id || currentLesson?.slug || lessonSlug;

  // Toggle Completion
  const handleToggleCompletion = async () => {
    if (!user) {
      alert('অগ্রগতি সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন।');
      navigate('/login');
      return;
    }

    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);

      await api.progress.toggleLesson(courseSlug, activeLessonId, newStatus);

      // Refresh course progress percentage
      const progRes = await api.progress.getCourseProgress(courseSlug);
      if (progRes.success && progRes.data) {
        setProgress(progRes.data);
      }
    } catch (err) {
      console.error('Toggle completion error:', err);
    }
  };

  // Save Note
  const handleSaveNote = async () => {
    if (!user) {
      alert('নোট সেভ করতে লগইন প্রয়োজন।');
      return;
    }

    setSavingNote(true);
    try {
      await api.progress.saveNote(courseSlug, activeLessonId, noteContent);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    } catch (err) {
      console.error('Note save error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#16803C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">ভিডিও ক্লাসরুম প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">ভিডিও পাঠটি পাওয়া যায়নি</h3>
        <button
          onClick={() => navigate(`/courses/${courseSlug}`)}
          className="px-4 py-2 bg-[#16803C] text-white text-xs font-semibold rounded-lg"
        >
          কোর্স পাতায় ফিরুন
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarkedSlugs.includes(courseSlug);

  // Extract or ensure valid embed URL
  let embedUrl = '';
  if (currentLesson.youtubeId) {
    embedUrl = `https://www.youtube.com/embed/${currentLesson.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  } else if (currentLesson.videoUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = currentLesson.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    } else {
      embedUrl = currentLesson.videoUrl;
    }
  }

  return (
    <div className="bg-[#0F172A] min-h-screen text-slate-100 flex flex-col">
      {/* 1. Learning Top Sub-Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <button
          onClick={() => navigate(`/courses/${courseSlug}`)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="truncate max-w-[200px] sm:max-w-md">{courseData?.title}</span>
        </button>

        <div className="flex items-center gap-3">
          {progress && (
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span>অগ্রগতি:</span>
              <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16803C] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              <span className="font-mono text-emerald-400 font-semibold">
                {progress.completionPercentage}%
              </span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-medium transition-colors"
          >
            {sidebarOpen ? 'পাঠতালিকা লুকান' : 'পাঠতালিকা দেখুন'}
          </button>
        </div>
      </div>

      {/* 2. Main Stage & Sidebar Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Video Stage & Details */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* YouTube Responsive Video Container */}
          <div className="w-full bg-black aspect-video max-h-[72vh] flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-2">
                <PlayCircle className="w-16 h-16 mx-auto text-emerald-500 opacity-60" />
                <p>ভিডিও লিংক যুক্ত করা হয়নি।</p>
              </div>
            )}
          </div>

          {/* Action Navigation Bar (Prev / Next & Complete) */}
          <div className="bg-slate-900 border-y border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && navigate(`/learn/${courseSlug}/${prevLesson.slug}`)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                আগের পাঠ
              </button>

              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && navigate(`/learn/${courseSlug}/${nextLesson.slug}`)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                পরের পাঠ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleToggleCompletion}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                  isCompleted
                    ? 'bg-[#16803C] text-white hover:bg-[#105C2B]'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#FACC15]" />
                    সম্পন্ন হয়েছে
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    সম্পন্ন হিসেবে চিহ্নিত করুন
                  </>
                )}
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="ভিডিও সমস্যা রিপোর্ট"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lesson Description & Personal Notes */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span>{currentLesson.moduleTitle || 'মূল অধ্যায়'}</span>
                <span>·</span>
                <span>{currentLesson.duration || '১৫ মিনিট'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {currentLesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
                {currentLesson.description ||
                  'এই পাঠে আলোচিত প্রতিটি কনসেপ্ট মনোযোগ সহকারে অনুশীলন করুন। কোনো সমস্যা হলে নিচে ব্যক্তিগত নোট লিখে রাখুন।'}
              </p>
            </div>

            {/* Personal Notes Section */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>ব্যক্তিগত নোট (ক্লাসরুম ডায়রি)</span>
                </div>
                {noteSavedFeedback && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> নোট সংরক্ষিত হয়েছে!
                  </span>
                )}
              </div>

              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={
                  user
                    ? 'এই ভিডিও থেকে গুরুত্বপূর্ণ পয়েন্ট, কোড স্নিপেট বা সূত্র লিখে রাখুন...'
                    : 'নোট লিখতে ও সেভ রাখতে দয়া করে লগইন করুন...'
                }
                disabled={!user}
                className="w-full p-3 text-xs sm:text-sm bg-slate-950/70 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] text-slate-200 placeholder-slate-600 resize-y"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {user
                    ? 'আপনার নোট আপনার শেখাঘর অ্যাকাউন্টে সুরক্ষিতভাবে সংরক্ষিত থাকে।'
                    : 'লগইন ছাড়া নোট সংরক্ষণ করা যাবে না।'}
                </span>
                {user && (
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-4 py-1.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingNote ? 'সেভ হচ্ছে...' : 'নোট সেভ করুন'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right Curriculum Playlist Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-80 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 max-h-[50vh] lg:max-h-none overflow-y-auto">
            <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">কোর্স কারিকুলাম</h3>
                <span className="text-xs text-slate-400">
                  {courseData?.totalLessons || 0} টি পাঠ
                </span>
              </div>
              {progress && (
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {progress.totalCompleted}/{progress.totalLessons} সম্পন্ন
                </span>
              )}
            </div>

            <div className="p-3 space-y-4">
              {courseData?.modules?.map((mod: any, mIdx: number) => (
                <div key={mIdx} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    {mod.title}
                  </span>

                  <div className="space-y-1">
                    {mod.lessons?.map((les: ILesson, lIdx: number) => {
                      const isActive =
                        les.slug === lessonSlug || les._id === lessonSlug || les.id === lessonSlug;
                      const isLesCompleted =
                        progress?.completedLessonIds.includes(les._id || les.slug || '') || false;

                      return (
                        <button
                          key={lIdx}
                          onClick={() => navigate(`/learn/${courseSlug}/${les.slug}`)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#16803C] text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          {isLesCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-[#FACC15]' : 'text-emerald-500'
                              }`}
                            />
                          ) : (
                            <PlayCircle
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-white' : 'text-slate-500'
                              }`}
                            />
                          )}

                          <span className="truncate flex-1">{les.title}</span>

                          <span
                            className={`text-[10px] shrink-0 ${
                              isActive ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                          >
                            {les.duration || '১৫ মি.'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        courseSlug={courseSlug}
        courseTitle={courseData?.title}
        lessonId={activeLessonId}
        lessonTitle={currentLesson.title}
      />
    </div>
  );
};
