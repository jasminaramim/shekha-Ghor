import React, { useState, useEffect } from 'react';
import { ICourse, ICategory, IVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { VideoCard } from '../components/VideoCard.js';
import { Search, BookOpen, Video } from 'lucide-react';

interface CoursesPageProps {
  navigate: (path: string) => void;
  initialSort?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  navigate,
  initialSort = 'newest',
}) => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadCategories() {
      const res = await api.categories.getAll();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }
    loadCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, videosRes] = await Promise.all([
        api.courses.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortOption,
          search: searchQuery.trim() || undefined,
          limit: 100,
        }),
        api.videos.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortOption,
          search: searchQuery.trim() || undefined,
          limit: 100,
        }),
      ]);

      if (coursesRes.success && coursesRes.courses) {
        setCourses(coursesRes.courses);
      } else {
        setCourses([]);
      }

      if (videosRes.success && videosRes.videos) {
        setVideos(videosRes.videos);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const hasResults = courses.length > 0 || videos.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Video Banner */}
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-lg relative group">
        <video 
          src="/allcrouse.mp4" 
          autoPlay 
          controls
          loop 
          playsInline 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 sm:p-10 pointer-events-none">
          <div className="text-white space-y-2 pointer-events-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">সকল কোর্স ও ভিডিও</h2>
            <p className="text-sm sm:text-base font-medium opacity-90 drop-shadow-sm">আপনার পছন্দের কোর্স বেছে নিন এবং শেখা শুরু করুন</p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          সকল কোর্স ও ভিডিও সংগ্রহ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          শেখাঘরের বিশেষায়িত প্লেলিস্ট ও ভিডিও থেকে আপনার পছন্দের বিষয়টি বেছে নিন
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কোর্স বা ভিডিওর নাম লিখুন..."
              className="w-full pl-9 pr-20 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              খুঁজুন
            </button>
          </form>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] text-slate-800"
            >
              <option value="all">সকল বিষয় / ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] text-slate-800"
            >
              <option value="newest">নতুন প্রথমে</option>
              <option value="popular">জনপ্রিয় প্রথমে</option>
              <option value="title">নাম অনুযায়ী</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#16803C] text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব ক্যাটাগরি
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-[#16803C] text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : hasResults ? (
        <div className="space-y-12">
          {courses.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#16803C]" />
                <h2 className="text-xl font-bold text-slate-900">পূর্ণাঙ্গ কোর্স ও প্লেলিস্ট</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    onSelect={(slug) => navigate(`/courses/${slug}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">একক শিক্ষামূলক ভিডিও</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.youtubeId}
                    video={video}
                    onSelect={(id) => navigate(`/video/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            আপনার নির্বাচিত ফিল্টার বা সার্চ শব্দের সাথে মিল রেখে কোনো কোর্স বা ভিডিও নেই। দয়া করে অন্য কোনো বিষয় বা শব্দ দিয়ে অনুসন্ধান করুন।
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSortOption('newest');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#16803C] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      )}
    </div>
  );
};
