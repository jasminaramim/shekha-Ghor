import React, { useState, useEffect } from 'react';
import { ICourse, IVideo, IYouTubeVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { VideoCard } from '../components/VideoCard.js';
import { YouTubeCard } from '../components/YouTubeCard.js';
import { YouTubePlayerModal } from '../components/YouTubePlayerModal.js';
import {
  Search,
  BookOpen,
  Video,
  Play,
  ExternalLink,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  navigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', navigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<IYouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isYouTubeFallback, setIsYouTubeFallback] = useState(false);
  const [activeTab, setActiveTab] = useState<'website' | 'youtube'>('website');
  const [modalVideo, setModalVideo] = useState<IYouTubeVideo | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const performSearch = async (searchTerm: string) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) {
      setCourses([]);
      setVideos([]);
      setYoutubeVideos([]);
      setSearched(false);
      setIsYouTubeFallback(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setIsYouTubeFallback(false);

    try {
      // 1. Search Website Courses & Videos
      const [coursesRes, videosRes] = await Promise.all([
        api.courses.getAll({ search: cleanTerm, limit: 50 }),
        api.videos.getAll({ search: cleanTerm, limit: 50 }),
      ]);

      const foundCourses = coursesRes.success && coursesRes.courses ? coursesRes.courses : [];
      const foundVideos = videosRes.success && videosRes.videos ? videosRes.videos : [];

      setCourses(foundCourses);
      setVideos(foundVideos);

      const hasWebsiteResults = foundCourses.length > 0 || foundVideos.length > 0;

      // 2. Fallback to YouTube API if not found on website
      if (!hasWebsiteResults) {
        setYoutubeLoading(true);
        const ytRes = await api.videos.searchYouTube(cleanTerm);
        if (ytRes.success && ytRes.results && ytRes.results.length > 0) {
          setYoutubeVideos(ytRes.results);
          setIsYouTubeFallback(true);
          setActiveTab('youtube');
        } else {
          setYoutubeVideos([]);
        }
        setYoutubeLoading(false);
      } else {
        // Also fetch YouTube results in background for tab toggle
        api.videos.searchYouTube(cleanTerm).then((ytRes) => {
          if (ytRes.success && ytRes.results) {
            setYoutubeVideos(ytRes.results);
          }
        });
        setActiveTab('website');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setCourses([]);
    setVideos([]);
    setYoutubeVideos([]);
    setSearched(false);
    setIsYouTubeFallback(false);
  };

  const hasWebsiteResults = courses.length > 0 || videos.length > 0;
  const hasYouTubeResults = youtubeVideos.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* YouTube Player Modal */}
      <YouTubePlayerModal
        video={modalVideo}
        onClose={() => setModalVideo(null)}
        onNavigateToWatch={(id) => navigate(`/video/${id}`)}
      />

      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold tracking-wide">
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>স্মার্ট অনুসন্ধান ও YouTube ইন্টিগ্রেশন</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          কোর্স ও ভিডিও অনুসন্ধান
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          যেকোনো বিষয়, প্রযুক্তি অথবা শিক্ষকের নাম দিয়ে খুঁজুন। ওয়েবসাইটে না থাকলে সরাসরি YouTube থেকে সেরা ভিডিও নিয়ে আসা হবে।
        </p>

        {/* YouTube-Style Pill Search Box */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-white border border-slate-300 rounded-full shadow-sm hover:border-slate-400 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100 transition-all overflow-hidden p-1"
        >
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন: রিয়্যাক্ট, পাইথন, ফটোশপ, মুনজেরিন শহীদ, এইচএসসি গণিত..."
            className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span>অনুসন্ধান</span>
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold">জনপ্রিয় অনুসন্ধান:</span>
          {['জাভাস্ক্রিপ্ট', 'Python', 'Web Development', 'গ্রাফিক্স ডিজাইন', 'স্পোকেন ইংলিশ', 'বিজ্ঞান'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  performSearch(tag);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : searched ? (
        <div className="space-y-6">
          {/* YouTube Fallback Notification Banner */}
          {isYouTubeFallback && (
            <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 border-2 border-red-200 rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span>This video is on YouTube</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    শেখাঘরে &ldquo;{query}&rdquo; এর কোনো কোর্স পাওয়া যায়নি
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    আপনার সুবিধার জন্য সরাসরি <strong>YouTube API</strong> থেকে সেরা শিক্ষামূলক ভিডিওগুলো নিয়ে আসা হয়েছে। নিচে প্রদর্শিত প্রতিটি ভিডিও <strong>YouTube</strong> এ উপলব্ধ।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Row: Count & Layout switch */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
            <div>
              &ldquo;<strong>{query}</strong>&rdquo; এর জন্য{' '}
              <strong>
                {activeTab === 'youtube'
                  ? youtubeVideos.length
                  : courses.length + videos.length}
              </strong>{' '}
              টি ফলাফল পাওয়া গেছে
            </div>

            <div className="flex items-center gap-3">
              {/* Tab toggles if both exist */}
              {hasWebsiteResults && hasYouTubeResults && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('website')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'website' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    শেখাঘর ({courses.length + videos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      activeTab === 'youtube' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <span>YouTube ({youtubeVideos.length})</span>
                  </button>
                </div>
              )}

              {/* Layout Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    layoutMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    layoutMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* YouTube Video Results */}
          {activeTab === 'youtube' || isYouTubeFallback ? (
            youtubeVideos.length > 0 ? (
              <div
                className={
                  layoutMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
                <h3 className="text-base font-bold text-slate-800">কোনো ফলাফল মেলেনি</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  বানান সঠিক আছে কি না যাচাই করুন বা আরও সাধারণ কোনো শব্দ দিয়ে খুঁজুন।
                </p>
              </div>
            )
          ) : hasWebsiteResults ? (
            <div className="space-y-8">
              {/* Courses */}
              {courses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#16803C]" />
                    <h2 className="text-lg font-bold text-slate-900">কোর্সসমূহ</h2>
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

              {/* Videos */}
              {videos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-600" />
                    <h2 className="text-lg font-bold text-slate-900">একক ভিডিও</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">কোনো ফলাফল মেলেনি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                দয়া করে অন্য কোনো বিষয় বা শব্দ দিয়ে অনুসন্ধান করুন।
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 space-y-3">
          <Search className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm">অনুসন্ধানের জন্য উপরের বক্সে শব্দ লিখে এন্টার চাপুন।</p>
        </div>
      )}
    </div>
  );
};
