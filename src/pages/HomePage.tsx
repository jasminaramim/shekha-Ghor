import React, { useState, useEffect } from 'react';
import { ICourse, ICategory, IVideo, IWatchHistoryItem, IYouTubeVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { VideoCard } from '../components/VideoCard.js';
import { CategoryCard } from '../components/CategoryCard.js';
import { YouTubeCard } from '../components/YouTubeCard.js';
import { YouTubePlayerModal } from '../components/YouTubePlayerModal.js';
import { Logo } from '../components/Logo.js';
import { ScrollVideo } from '../components/ScrollVideo.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  Sparkles,
  BookOpen,
  CheckCircle,
  Video,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Play,
  Code,
  Zap,
  GraduationCap,
  Baby,
  FlaskConical,
  Palette,
  Terminal,
  History,
  Heart,
  Leaf,
  Smile
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allVideos, setAllVideos] = useState<IVideo[]>([]);
  const [reelsVideos, setReelsVideos] = useState<IVideo[]>([]);
  const [watchHistory, setWatchHistory] = useState<IWatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // YouTube category-wise section state
  const [youtubeCategory, setYoutubeCategory] = useState<string>('all');
  const [youtubeVideos, setYoutubeVideos] = useState<IYouTubeVideo[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState<boolean>(false);
  const [modalVideo, setModalVideo] = useState<IYouTubeVideo | null>(null);

  const youtubeCategories = [
    { id: 'all', label: 'সব বিষয় (All)', query: 'বাংলা শিক্ষামূলক কোর্স ও টিউটোরিয়াল' },
    { id: 'web-dev', label: '💻 ওয়েব ডেভেলপমেন্ট', query: 'web development bangla tutorial' },
    { id: 'python', label: '🐍 পাইথন ও কোডিং', query: 'python programming bangla tutorial' },
    { id: 'design', label: '🎨 ডিজাইন ও ফ্রিল্যান্সিং', query: 'graphics design freelancing bangla' },
    { id: 'english', label: '🗣️ স্পোকেন ইংলিশ', query: 'spoken english bangla class' },
    { id: 'kids', label: '👶 শিশু ও কিশোর শিক্ষা', query: 'kids rhymes educational cartoon bangla' },
    { id: 'math', label: '📐 গণিত ও বিজ্ঞান', query: 'math shortcut tricks science bangla' },
  ];

  useEffect(() => {
    const selected = youtubeCategories.find((c) => c.id === youtubeCategory);
    const q = selected ? selected.query : 'বাংলা শিক্ষামূলক কোর্স ও ভিডিও';

    async function loadYouTubeCategoryVideos() {
      setYoutubeLoading(true);
      try {
        const res = await api.videos.searchYouTube(q);
        if (res.success && res.results && res.results.length > 0) {
          setYoutubeVideos(res.results.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching youtube videos on homepage:', err);
      } finally {
        setYoutubeLoading(false);
      }
    }

    loadYouTubeCategoryVideos();
  }, [youtubeCategory]);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, catRes, videoRes, reelsRes] = await Promise.all([
          api.courses.getAll({ limit: 6, sort: 'popular' }),
          api.categories.getAll(),
          api.videos.getAll({ limit: 30, sort: 'popular' }),
          api.videos.getAll({ limit: 10, category: 'reels', sort: 'newest' })
        ]);

        if (courseRes.success && courseRes.courses) {
          setCourses(courseRes.courses);
        }
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
        if (videoRes.success && videoRes.videos) {
          setAllVideos(videoRes.videos);
        }
        if (reelsRes.success && reelsRes.videos) {
          setReelsVideos(reelsRes.videos);
        }

        // Load watch history if logged in
        if (user) {
          const histRes = await api.videos.getWatchHistory();
          if (histRes.success && histRes.history) {
            setWatchHistory(histRes.history);
          }
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Video Section Splits by Category
  const kidsVideos = allVideos.filter(
    (v) => v.categorySlug === 'children-education' || v.audience === 'children'
  );
  const webDevVideos = allVideos.filter(
    (v) => v.categorySlug === 'web-development' || v.subCategorySlug?.includes('html') || v.subCategorySlug?.includes('javascript') || v.subCategorySlug?.includes('react')
  );
  const programmingVideos = allVideos.filter(
    (v) => v.categorySlug === 'programming-tech' || v.subCategorySlug?.includes('python') || v.subCategorySlug?.includes('ai')
  );
  const designVideos = allVideos.filter(
    (v) => v.categorySlug === 'design-creative' || v.categorySlug === 'other-skills'
  );

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* YouTube Theater Modal Player */}
      <YouTubePlayerModal
        video={modalVideo}
        onClose={() => setModalVideo(null)}
        onNavigateToWatch={(id) => navigate(`/video/${id}`)}
      />

      {/* 1. Hero Section (Meticulously matched to user's uploaded banner image) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#F0F7ED] via-[#F7FAF5] to-[#FEFDF2] pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-emerald-950/10">
        {/* Soft Natural Atmospheric Background Ornaments */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Slogan, Search, & Trust Strip */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Shekhaghor House Emblem with Sprout */}
              <div className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 100 80"
                  className="w-10 h-8 sm:w-12 sm:h-9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 42L50 14L85 42"
                    stroke="#16803C"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Sprout leaf */}
                  <path
                    d="M75 18C75 18 85 15 88 24C88 33 76 34 76 34"
                    fill="#16803C"
                  />
                  {/* Windows */}
                  <rect x="42" y="24" width="7" height="7" rx="1.5" fill="#FACC15" />
                  <rect x="51" y="24" width="7" height="7" rx="1.5" fill="#FACC15" />
                  <rect x="42" y="33" width="7" height="7" rx="1.5" fill="#FACC15" />
                  <rect x="51" y="33" width="7" height="7" rx="1.5" fill="#FACC15" />
                </svg>
                <span className="text-xs font-semibold text-[#16803C] tracking-wide">
                  শেখাঘর শিক্ষামূলক প্ল্যাটফর্ম
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight leading-tight sm:leading-[1.18]">
                <span className="text-[#105C2B] block">শেখার নতুন ঠিকানা,</span>
                <span className="block mt-1">
                  <span className="text-[#105C2B]">আপনার </span>
                  <span className="text-[#105C2B]">শেখা</span>
                  <span className="text-[#FACC15]">ঘর</span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                প্রযুক্তি, শিক্ষা, দক্ষতা ও ক্যারিয়ারের জন্য প্রয়োজনীয় ভিডিও খুঁজুন এক জায়গায়।
              </p>

              {/* Integrated Search Bar with "ভিডিও খুঁজুন" and "ক্যাটাগরি দেখুন" */}
              <form
                onSubmit={handleSearch}
                className="max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#16803C] transition-all"
              >
                <div className="relative flex-1 flex items-center w-full pl-3.5">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="কী শিখতে চান? এখানে লিখুন..."
                    className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#16803C] hover:bg-[#105C2B] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    ভিডিও খুঁজুন
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#16803C] bg-[#FEF9C3] hover:bg-yellow-200 border border-[#FACC15] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <span>⊞</span>
                    ক্যাটাগরি দেখুন
                  </button>
                </div>
              </form>

              {/* 4-Item Feature Trust Strip Underneath */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">হাজারো ভিডিও</span>
                    <span className="text-[10px] text-slate-500">ইউটিউব শিক্ষামূলক সংগ্রহ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">বিভিন্ন ক্যাটাগরি</span>
                    <span className="text-[10px] text-slate-500">শিশু থেকে প্রফেশনাল</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">সব বয়সের জন্য</span>
                    <span className="text-[10px] text-slate-500">সহজ ও আনন্দময় পাঠ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">নিজের গতিতে শিখুন</span>
                    <span className="text-[10px] text-slate-500">১০০% সম্পূর্ণ ফ্রি</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image & Floating Elements */}
            <div className="lg:col-span-6 relative flex justify-center items-center mt-12 lg:mt-0">
              
              {/* Floating Elements */}
              <div className="absolute -top-5 -left-5 sm:top-2 sm:-left-8 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-emerald-100 animate-bounce z-20" style={{ animationDuration: '3s' }}>
                <Code className="w-6 h-6 text-[#16803C]" />
              </div>
              <div className="absolute -top-7 right-6 sm:-top-8 sm:right-12 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-blue-100 animate-bounce z-20" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div className="absolute top-1/2 -left-8 sm:-left-12 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-amber-100 animate-bounce z-20" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                <Smile className="w-6 h-6 text-amber-500" />
              </div>
              <div className="absolute -bottom-5 right-6 sm:-bottom-7 sm:right-12 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-green-100 animate-bounce z-20" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
                <Leaf className="w-6 h-6 text-green-500" />
              </div>

              <style>{`
                @keyframes run-border {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .animated-gradient-border {
                  background: linear-gradient(90deg, #16803C, #FACC15, #105C2B, #FACC15);
                  background-size: 300% 300%;
                  animation: run-border 5s linear infinite;
                  padding: 6px;
                  border-radius: 2.3rem;
                }
              `}</style>

              {/* Main Image Container */}
              <div className="animated-gradient-border w-full max-w-2xl shadow-[0_20px_50px_-12px_rgba(22,128,60,0.45)] relative z-10 group">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-inner">
                  <img 
                    src="/hero.jpg" 
                    alt="শেখাঘর — আনন্দময় বাংলা অনলাইন শিক্ষা" 
                    className="w-full h-auto object-cover rounded-[2rem] transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  
                  {/* Subtle decorative bottom gradient vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-b-[2rem]" />

                  {/* Floating badge inside image: Bottom-Left */}
                  <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 bg-white/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl border border-white/70 flex items-center gap-2.5 z-20">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0 shadow-sm">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">আনন্দময় ও আধুনিক শিক্ষা</span>
                      <span className="text-[10px] sm:text-[11px] text-[#16803C] font-semibold">ছোট-বড় সবার জন্য উন্মুক্ত</span>
                    </div>
                  </div>

                  {/* Floating pill inside image: Top-Right */}
                  <div className="absolute top-4 right-4 bg-emerald-700/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20 z-20">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    <span>বাংলায় ১০০% ফ্রি</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ওয়েব ডেভেলপমেন্ট শেখার বিভাগ (HTML, CSS, JS, React, Node) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16803C] bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <Code className="w-3.5 h-3.5" />
              <span>HTML, CSS, JavaScript, React, Node.js</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার ইঞ্জিনিয়ারিং
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ফ্রন্টএন্ড ও ব্যাকএন্ডের সেরা বাংলা টিউটোরিয়াল নিয়ে ক্যারিয়ার শুরু করুন
            </p>
          </div>

          <button
            onClick={() => navigate('/categories/web-development')}
            className="text-xs sm:text-sm font-bold text-[#16803C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            সব ওয়েব ভিডিও দেখুন <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full mb-6 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <ScrollVideo
            src="/techvideo.mp4"
            controls
            muted
            loop
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {webDevVideos.map((video) => (
            <VideoCard
              key={video.youtubeId}
              video={video}
              onSelect={(id) => navigate(`/video/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 3. শিশুদের শেখার বিভাগ (Kids Education Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-emerald-50/60 p-6 sm:p-8 rounded-3xl border border-amber-200/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-[#FEF9C3] px-3 py-1 rounded-full mb-2">
                <span>👶 শিশুদের জন্য বিশেষ সংগ্রহ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ছোট্টমণিদের আনন্দের পাঠশালা
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                বাংলা বর্ণমালা, ছড়া, গল্প, সহজে সংখ্যা গণনা ও সাধারণ জ্ঞান
              </p>
            </div>

            <button
              onClick={() => navigate('/kids')}
              className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-2xs self-start sm:self-auto"
            >
              শিশুদের সব ভিডিও দেখুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full mb-6 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
            <ScrollVideo
              src="/kidsvideo.mp4"
              controls
              muted
              loop
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Kids Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {kidsVideos.map((video) => (
              <VideoCard
                key={video.youtubeId}
                video={video}
                onSelect={(id) => navigate(`/video/${id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Recently Watched Videos (for logged-in student) */}
      {user && watchHistory.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#16803C]" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                সম্প্রতি দেখা ভিডিও (চালিয়ে যান)
              </h2>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold text-[#16803C] hover:underline cursor-pointer"
            >
              ড্যাশবোর্ডে দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchHistory.slice(0, 4).map((item) => (
              <div
                key={item.youtubeId}
                onClick={() => navigate(`/video/${item.youtubeId}`)}
                className="group bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex gap-3 items-center"
              >
                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#16803C] line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1 block truncate">
                    {item.channelName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* 2.5 Latest Courses (Module-wise structured courses) */}
      {courses && courses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#16803C]" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                নতুন কোর্সসমূহ (মডিউল-ভিত্তিক)
              </h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs font-semibold text-[#16803C] hover:underline cursor-pointer"
            >
              সব কোর্স দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                onSelect={(slug) => navigate(`/courses/${slug}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5.5 ভিডিও ফ্রম ইউটিউব (Videos from YouTube - Category-wise) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-red-50/70 via-white to-rose-50/60 p-6 sm:p-8 rounded-3xl border border-red-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>সরাসরি YouTube সংগ্রহ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>ভিডিও ফ্রম ইউটিউব (Videos from YouTube)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                শেখাঘরের বাইরেও সরাসরি YouTube থেকে ক্যাটাগরিভিত্তিক সেরা বাংলা শিক্ষামূলক ভিডিও ও টিউটোরিয়ালগুলো এক ক্লিকে উপভোগ করুন
              </p>
            </div>

            <button
              onClick={() => navigate('/courses?sort=popular')}
              className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer bg-white px-4 py-2 rounded-xl border border-red-200 shadow-2xs self-start sm:self-auto hover:bg-red-50/50 transition-colors"
            >
              <span>সব YouTube ভিডিও দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Category Tabs / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
            {youtubeCategories.map((cat) => {
              const isActive = youtubeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setYoutubeCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-700'
                      : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200/90 hover:border-red-200'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* YouTube Video Cards Grid */}
          {youtubeLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-video bg-slate-200 rounded-xl w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {youtubeVideos.map((video) => (
                <YouTubeCard
                  key={video.youtubeId}
                  video={video}
                  layout="grid"
                  onSelect={(id) => navigate(`/video/${id}`)}
                  onQuickPlay={(v) => setModalVideo(v)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              প্রোগ্রামিং, এআই, ডিজাইন ও ফ্রিল্যান্সিং
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Python, AI প্রম্পট ইঞ্জিনিয়ারিং, ফটোশপ ও স্পোকেন ইংলিশ
            </p>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="text-xs sm:text-sm font-bold text-[#16803C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            আরও দেখুন <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...programmingVideos, ...designVideos].slice(0, 4).map((video) => (
            <VideoCard
              key={video.youtubeId}
              video={video}
              onSelect={(id) => navigate(`/video/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 6.5 শিক্ষামূলক রিলস (Reels) */}
      {reelsVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                শিক্ষামূলক রিলস (১০ সেকেন্ড)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                টিকটকের মতো শর্ট ভিডিওতে শিখুন নতুন কিছু
              </p>
            </div>

            <button
              onClick={() => navigate('/reels')}
              className="text-xs sm:text-sm font-bold text-[#16803C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              সব রিলস দেখুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {reelsVideos.slice(0, 3).map((video) => (
              <div 
                key={video.youtubeId} 
                className="w-full aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden relative shadow-lg cursor-pointer group" 
                onClick={() => navigate(`/reels`)}
              >
                {video.youtubeId.startsWith('cloud-') ? (
                  <video src={video.youtubeUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" muted loop playsInline />
                ) : (
                  <img src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/95 flex flex-col justify-end p-5">
                  <h3 className="text-white font-bold text-base line-clamp-2 leading-tight drop-shadow-md">{video.title}</h3>
                  <p className="text-emerald-400 font-semibold text-xs mt-1">@{video.channelName}</p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform border border-white/30">
                   <Play className="w-6 h-6 text-white fill-current ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. সকল ক্যাটাগরি ব্রাউজিং সেকশন */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                সকল বিষয়ভিত্তিক ক্যাটাগরি
              </h2>
            </div>

            <button
              onClick={() => navigate('/categories')}
              className="text-xs sm:text-sm font-bold text-[#16803C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              সকল ক্যাটাগরি তালিকা ({categories.length}) →
            </button>
          </div>

          {/* সুন্দর ক্যাটাগরি ব্যানার */}
          <div className="w-full h-40 sm:h-56 md:h-72 rounded-2xl overflow-hidden shadow-md relative group">
            <img 
              src="/category.jpg" 
              alt="Category Banner" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((cat) => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                onSelect={(slug) => navigate(`/categories/${slug}`)}
                compact
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7.5 Donate Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 text-center md:text-left max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100/50 px-3 py-1 rounded-full text-xs text-emerald-700 font-bold border border-emerald-200">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>আমাদের সমর্থন করুন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              দান করতে চান? নির্দ্বিধায় করুন
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              শেখাঘরের মাধ্যমে হাজারো শিক্ষার্থী বিনামূল্যে শিখছে। এই মহৎ উদ্যোগকে এগিয়ে নিতে এবং সার্ভার খরচ ও নতুন কন্টেন্ট তৈরিতে সহায়তা করতে আপনার অনুদান আমাদের জন্য অনেক মূল্যবান।
            </p>
          </div>

          <div className="shrink-0 relative z-10">
            <button
              onClick={() => navigate('/donate')}
              className="px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#16803C] to-[#105C2B] hover:from-[#105C2B] hover:to-emerald-800 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white" />
              অনুদান দিন
            </button>
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#105C2B] via-[#16803C] to-emerald-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-8 text-center lg:text-left max-w-xl flex-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>বিনামূল্যে উন্মুক্ত বাংলা শিক্ষা</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                আজই শুরু করুন আপনার পছন্দের বিষয়ের ভিডিও দেখা
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                শেখাঘরের ফ্রি অ্যাকাউন্টে লগইন করে নিজের দেখা ভিডিওর হিস্টোরি, বুকমার্ক এবং অগ্রগতি সংরক্ষণ করুন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3.5 text-sm font-bold text-slate-900 bg-[#FACC15] hover:bg-yellow-400 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap w-full sm:w-auto"
              >
                বিনামূল্যে অ্যাকাউন্ট খুলুন
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="px-5 py-3.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors cursor-pointer whitespace-nowrap w-full sm:w-auto"
              >
                ক্যাটাগরি দেখুন
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-lg shrink-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 relative">
            <ScrollVideo
              src="/login.mp4"
              controls
              muted
              loop
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
