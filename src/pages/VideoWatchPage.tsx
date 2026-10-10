import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IVideo, ICategory } from '../types/index.js';
import { VideoCard } from '../components/VideoCard.js';
import { ReportModal } from '../components/ReportModal.js';
import {
  Play,
  Share2,
  Bookmark,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  CheckCircle2,
  FolderOpen,
  ArrowLeft,
} from 'lucide-react';

interface VideoWatchPageProps {
  id: string; // youtubeId or _id
  navigate: (path: string) => void;
}

export const VideoWatchPage: React.FC<VideoWatchPageProps> = ({ id, navigate }) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<IVideo[]>([]);
  const [prevVideo, setPrevVideo] = useState<{ title: string; youtubeId: string; _id: string } | null>(null);
  const [nextVideo, setNextVideo] = useState<{ title: string; youtubeId: string; _id: string } | null>(null);
  const [category, setCategory] = useState<ICategory | null>(null);
  const [subCategory, setSubCategory] = useState<ICategory | null>(null);

  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      try {
        const res = await api.videos.getById(id);
        if (res.success && res.video) {
          setVideo(res.video);
          setRelatedVideos(res.relatedVideos || []);
          setPrevVideo(res.prevVideo || null);
          setNextVideo(res.nextVideo || null);
          setCategory(res.category || null);
          setSubCategory(res.subCategory || null);
        }
      } catch (err) {
        console.error('Error loading video:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#16803C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">ভিডিও লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-emerald-100 text-[#16803C] rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">লগইন প্রয়োজন</h2>
        <p className="text-sm text-slate-600">ভিডিও দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।</p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            লগইন করুন
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-900">ভিডিওটি খুঁজে পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-500">অনুরোধকৃত ভিডিও সরানো হতে পারে বা লিংকটি ভুল।</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#16803C] text-white text-xs font-semibold rounded-lg"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarkedSlugs.includes(video.youtubeId);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmarkToggle = () => {
    if (!user) {
      alert('বুকমার্ক করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      navigate('/login');
      return;
    }
    toggleBookmark(video.youtubeId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-[#16803C] cursor-pointer">
          হোম
        </button>
        <span>/</span>
        <button
          onClick={() => navigate(`/categories/${video.categorySlug}`)}
          className="hover:text-[#16803C] cursor-pointer font-medium text-emerald-800"
        >
          {category?.name || video.categorySlug}
        </button>
        {subCategory && (
          <>
            <span>/</span>
            <span className="text-slate-700">{subCategory.name}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Big Player & Video Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Responsive YouTube Embed Player */}
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Action Bar & Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {video.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">
                    উৎস/চ্যানেল: {video.channelName || 'ইউটিউব'}
                  </span>
                  <span>·</span>
                  <span>সময়কাল: {video.duration}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {video.viewsCount || 0} ভিউ
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleBookmarkToggle}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isBookmarked
                      ? 'bg-amber-400 text-slate-900 border-amber-500'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'কপি হয়েছে!' : 'শেয়ার'}
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  title="ভিডিও সমস্যা রিপোর্ট করুন"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prev & Next Video Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {prevVideo ? (
                <button
                  onClick={() => navigate(`/video/${prevVideo.youtubeId || prevVideo._id}`)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#16803C] hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">পূর্ববর্তী: {prevVideo.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextVideo && (
                <button
                  onClick={() => navigate(`/video/${nextVideo.youtubeId || nextVideo._id}`)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16803C] hover:bg-[#105C2B] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                >
                  <span className="truncate">পরবর্তী: {nextVideo.title}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

            {/* YouTube Direct Link attribution */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>ভিডিওটি ইউটিউবে দেখতে পারেন:</span>
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#16803C] hover:underline flex items-center gap-1 font-semibold"
              >
                মূল ইউটিউব চ্যানেলে দেখুন <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Video Description */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900">ভিডিওর বিবরণ ও সারসংক্ষেপ</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {video.description ||
                'এই ভিডিওতে সংশ্লিষ্ট বিষয়ে বিস্তারিত প্র্যাকটিক্যাল আলোচনা ও নির্দেশিকা প্রদান করা হয়েছে। মনোযোগ দিয়ে দেখে অনুশীলন করুন।'}
            </p>
          </div>
        </div>

        {/* Right Column: Related Videos & Category Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Banner Card */}
          {category && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-[#16803C] uppercase tracking-wider block">
                বিষয়ভিত্তিক বিভাগ
              </span>
              <h4 className="text-base font-bold text-slate-900">{category.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
              <button
                onClick={() => navigate(`/categories/${category.slug}`)}
                className="mt-2 text-xs font-semibold text-[#16803C] hover:underline block"
              >
                এই বিষয়ের সব ভিডিও ও কোর্স দেখুন →
              </button>
            </div>
          )}

          {/* Related Videos List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">একই বিষয়ের অন্যান্য ভিডিও</h3>
            {relatedVideos.length > 0 ? (
              <div className="space-y-3">
                {relatedVideos.map((rel) => (
                  <div
                    key={rel.youtubeId}
                    onClick={() => navigate(`/video/${rel.youtubeId}`)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={rel.thumbnailUrl}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current opacity-80" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#16803C] line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                        {rel.channelName || rel.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">সম্পর্কিত অন্য কোনো ভিডিও পাওয়া যায়নি।</p>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        courseSlug={video.categorySlug}
        lessonTitle={video.title}
      />
    </div>
  );
};
