import React, { useState, useEffect, useRef } from 'react';
import { ICourse, ICategory, IVideo, IYouTubeVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { VideoCard } from '../components/VideoCard.js';
import { YouTubeCard } from '../components/YouTubeCard.js';
import { YouTubePlayerModal } from '../components/YouTubePlayerModal.js';
import { ScrollVideo } from '../components/ScrollVideo.js';
import {
  Search,
  BookOpen,
  Video,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
  X,
  Play,
  ExternalLink,
  Flame,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

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
  const [youtubeVideos, setYoutubeVideos] = useState<IYouTubeVideo[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  // Filter & Search states
  const [selectedPill, setSelectedPill] = useState<string>('all'); // 'all', 'courses', 'videos', 'youtube', or category slug
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastSearchedTerm, setLastSearchedTerm] = useState<string>('');
  const [isYouTubeFallback, setIsYouTubeFallback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'website' | 'youtube'>('website');

  // YouTube modal player
  const [modalVideo, setModalVideo] = useState<IYouTubeVideo | null>(null);

  // Layout view: grid or list
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Pill scroll container ref
  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check URL params on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q') || urlParams.get('search');
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      const res = await api.categories.getAll();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }
    loadCategories();
  }, []);

  // Pill scroll indicators
  const updateScrollButtons = () => {
    if (pillsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillsContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollPills = (direction: 'left' | 'right') => {
    if (pillsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      pillsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Perform search and load data
  const fetchData = async (termToSearch: string = searchQuery) => {
    setLoading(true);
    setIsYouTubeFallback(false);
    setLastSearchedTerm(termToSearch.trim());

    const isCategoryFilter =
      selectedPill !== 'all' &&
      selectedPill !== 'courses' &&
      selectedPill !== 'videos' &&
      selectedPill !== 'youtube';

    try {
      // 1. Fetch website courses & videos
      const [coursesRes, videosRes] = await Promise.all([
        selectedPill === 'videos' || selectedPill === 'youtube'
          ? Promise.resolve({ success: true, courses: [] })
          : api.courses.getAll({
              category: isCategoryFilter ? selectedPill : undefined,
              sort: sortOption,
              search: termToSearch.trim() || undefined,
              limit: 100,
            }),
        selectedPill === 'courses' || selectedPill === 'youtube'
          ? Promise.resolve({ success: true, videos: [] })
          : api.videos.getAll({
              category: isCategoryFilter ? selectedPill : undefined,
              sort: sortOption,
              search: termToSearch.trim() || undefined,
              limit: 100,
            }),
      ]);

      const foundCourses = coursesRes.success && coursesRes.courses ? coursesRes.courses : [];
      const foundVideos = videosRes.success && videosRes.videos ? videosRes.videos : [];

      setCourses(foundCourses);
      setVideos(foundVideos);

      const hasWebsiteResults = foundCourses.length > 0 || foundVideos.length > 0;

      // 2. USER REQUIREMENT:
      // "if website e jodi available na thake tahole youtube er api theke search kore niye ashbe then dekhabe this video show on youtubte"
      if (termToSearch.trim()) {
        if (!hasWebsiteResults || selectedPill === 'youtube') {
          // No website results found! Trigger YouTube API fallback immediately!
          await triggerYouTubeSearch(termToSearch.trim(), true);
        } else {
          // Website has results, also pre-fetch YouTube in background so user can switch tabs effortlessly
          triggerYouTubeSearch(termToSearch.trim(), false);
        }
      } else if (selectedPill === 'youtube') {
        // Pill is YouTube and no query, fetch default educational YouTube videos
        await triggerYouTubeSearch('বাংলা শিক্ষামূলক টিউটোরিয়াল ও কোর্স', false);
      } else {
        setYoutubeVideos([]);
        setActiveTab('website');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // YouTube API Search Trigger
  const triggerYouTubeSearch = async (query: string, isFallback: boolean) => {
    setYoutubeLoading(true);
    try {
      const ytRes = await api.videos.searchYouTube(query);
      if (ytRes.success && ytRes.results) {
        setYoutubeVideos(ytRes.results);
        if (isFallback) {
          setIsYouTubeFallback(true);
          setActiveTab('youtube');
        }
      } else {
        setYoutubeVideos([]);
      }
    } catch (ytErr) {
      console.error('YouTube search error:', ytErr);
      setYoutubeVideos([]);
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchData();
  }, [selectedPill, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchData('');
  };

  const hasWebsiteResults = courses.length > 0 || videos.length > 0;
  const hasYouTubeResults = youtubeVideos.length > 0;

  // Preset YouTube chips
  const popularPills = [
    { id: 'all', label: 'সব (All)' },
    { id: 'courses', label: '🎓 কোর্সসমূহ' },
    { id: 'videos', label: '🎬 একক ভিডিও' },
    { id: 'youtube', label: '▶ YouTube ভিডিও' },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 pb-16">
      {/* YouTube Player Theater Modal */}
      <YouTubePlayerModal
        video={modalVideo}
        onClose={() => setModalVideo(null)}
        onNavigateToWatch={(id) => navigate(`/video/${id}`)}
      />

      {/* Top Banner (YouTube Video Showcase) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="w-full h-40 sm:h-56 md:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-lg relative group bg-slate-900">
          <ScrollVideo
            src="/allcrouse.mp4"
            controls
            muted
            loop
            playsInline
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-5 sm:p-8 pointer-events-none">
            <div className="text-white space-y-1.5 sm:space-y-2 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>YouTube শৈলীতে শেখাঘর</span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
                সকল কোর্স ও শিক্ষামূলক ভিডিও
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl opacity-90">
                ওয়েবসাইট ও সরাসরি YouTube-এর সেরা শিক্ষামূলক বাংলা কন্টেন্ট এখন এক ঠিকানায়
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky YouTube Header Bar: Search & Category Pills */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#F9FAFB]/95 backdrop-blur-md border-b border-slate-200/80 py-3 mt-4 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Main YouTube Search Bar + Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* YouTube-Style Pill Search Box */}
            <form onSubmit={handleSearchSubmit} className="w-full md:max-w-2xl relative flex items-center">
              <div className="relative w-full flex items-center bg-white border border-slate-300 rounded-full shadow-2xs focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100 transition-all overflow-hidden">
                <div className="pl-4 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কী শিখতে চান? কোর্স, ভিডিও বা ইউটিউব অনুসন্ধান করুন..."
                  className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">খুঁজুন</span>
                </button>
              </div>
            </form>

            {/* Layout switch & Sort options */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Sort selector */}
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-medium text-slate-700 shadow-2xs cursor-pointer"
                >
                  <option value="newest">নতুন প্রথমে</option>
                  <option value="popular">জনপ্রিয় প্রথমে</option>
                  <option value="title">নাম অনুযায়ী</option>
                </select>
              </div>

              {/* Grid / List Layout Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setLayoutMode('grid')}
                  title="গ্রিড ভিউ"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  title="লিস্ট ভিউ"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    layoutMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* YouTube Category / Tag Filter Pills (Scrollable) */}
          <div className="relative flex items-center">
            {canScrollLeft && (
              <button
                onClick={() => scrollPills('left')}
                className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div
              ref={pillsContainerRef}
              onScroll={updateScrollButtons}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full px-1"
            >
              {popularPills.map((pill) => {
                const isActive = selectedPill === pill.id;
                const isYouTubePill = pill.id === 'youtube';
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setSelectedPill(pill.id);
                      if (pill.id === 'youtube') {
                        setActiveTab('youtube');
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? isYouTubePill
                          ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-700'
                          : 'bg-slate-900 text-white shadow-sm'
                        : isYouTubePill
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
                    }`}
                  >
                    {isYouTubePill && (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    )}
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scrollPills('right')}
                className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* AUTOMATIC YOUTUBE FALLBACK BANNER (When no results found on website) */}
        {isYouTubeFallback && lastSearchedTerm && (
          <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 border-2 border-red-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span>সরাসরি YouTube অনুসন্ধান ফলাফল</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    &ldquo;{lastSearchedTerm}&rdquo; এর কোনো কোর্স শেখাঘরে সংরক্ষিত নেই
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    আপনার সুবিধার্থে সরাসরি <strong>YouTube API</strong> থেকে সেরা শিক্ষামূলক ভিডিওগুলো প্রদর্শন করা হচ্ছে। নিচে প্রদর্শিত প্রতিটি ভিডিও <strong>YouTube</strong> প্ল্যাটফর্মের।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs">
                  {youtubeVideos.length} টি YouTube ভিডিও
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab switchers if both website and YouTube results exist */}
        {hasWebsiteResults && lastSearchedTerm && hasYouTubeResults && (
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('website')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'website'
                  ? 'bg-[#16803C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>শেখাঘর ফলাফল ({courses.length + videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube থেকেও দেখুন ({youtubeVideos.length})</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading || (activeTab === 'youtube' && youtubeLoading) ? (
          <div
            className={
              layoutMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3"
              >
                <div className="aspect-video bg-slate-200 rounded-xl w-full" />
                <div className="flex gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'youtube' || isYouTubeFallback ? (
          /* YOUTUBE RESULTS DISPLAY */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  YouTube ভিডিও সংগ্রহ
                </h2>
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  This video is on YouTube
                </span>
              </div>
              <span className="text-xs text-slate-500">
                মোট {youtubeVideos.length} টি ফলাফল
              </span>
            </div>

            {youtubeVideos.length > 0 ? (
              <div
                className={
                  layoutMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6'
                    : 'space-y-4'
                }
              >
                {youtubeVideos.map((yt) => (
                  <YouTubeCard
                    key={yt.youtubeId}
                    video={yt}
                    layout={layoutMode}
                    onSelect={(id) => navigate(`/video/${id}`)}
                    onQuickPlay={(v) => setModalVideo(v)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">কোনো YouTube ভিডিও মেলেনি</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  দয়া করে ভিন্ন কোনো শব্দ বা বিষয়ের নাম লিখে অনুসন্ধান করুন।
                </p>
              </div>
            )}
          </div>
        ) : hasWebsiteResults ? (
          /* WEBSITE RESULTS DISPLAY */
          <div className="space-y-12">
            {/* Courses section */}
            {courses.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        পূর্ণাঙ্গ কোর্স ও প্লেলিস্ট
                      </h2>
                      <p className="text-xs text-slate-500">শেখাঘরের প্রিমিয়াম পাঠ্যসূচি</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {courses.length} টি কোর্স
                  </span>
                </div>

                <div
                  className={
                    layoutMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
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

            {/* Standalone Videos section */}
            {videos.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        একক শিক্ষামূলক ভিডিও
                      </h2>
                      <p className="text-xs text-slate-500">টপিকভিত্তিক দ্রুত শেখার ভিডিও</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {videos.length} টি ভিডিও
                  </span>
                </div>

                <div
                  className={
                    layoutMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }
                >
                  {videos.map((v) => (
                    <VideoCard
                      key={v.youtubeId || v._id}
                      video={v}
                      onSelect={(id) => navigate(`/video/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick banner to explore YouTube results as well */}
            {hasYouTubeResults && (
              <div className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 text-white text-xs font-bold">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>This video is on YouTube</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    YouTube-এ এই বিষয়ের আরও {youtubeVideos.length}টি ভিডিও উপলব্ধ আছে!
                  </h3>
                  <p className="text-xs text-rose-100">
                    শেখাঘর ছাড়াও সরাসরি YouTube ক্রিয়েটরদের ভিডিও দেখতে চান?
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('youtube')}
                  className="px-5 py-2.5 bg-white text-red-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>YouTube ফলাফল দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* COMPLETELY EMPTY (No website results and no YouTube results) */
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার ফিল্টার বা সার্চ শব্দের সাথে মিল রেখে কোনো কন্টেন্ট খুঁজে পাওয়া যায়নি।
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedPill('all');
                  setSearchQuery('');
                  setSortOption('newest');
                  fetchData('');
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
              <button
                onClick={() => {
                  setSelectedPill('youtube');
                  triggerYouTubeSearch(searchQuery || 'বাংলা কোর্স', false);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>YouTube এ খুঁজুন</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
