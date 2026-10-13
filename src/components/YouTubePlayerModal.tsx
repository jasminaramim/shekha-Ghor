import React, { useEffect } from 'react';
import { IYouTubeVideo } from '../types/index.js';
import { X, ExternalLink, Share2, Check, CheckCircle2, Bookmark, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface YouTubePlayerModalProps {
  video: IYouTubeVideo | null;
  onClose: () => void;
  onNavigateToWatch?: (youtubeId: string) => void;
}

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({
  video,
  onClose,
  onNavigateToWatch,
}) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (video) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  const isBookmarked = bookmarkedSlugs.includes(video.youtubeId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmarkToggle = () => {
    if (!user) {
      alert('বুকমার্ক করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    toggleBookmark(video.youtubeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#FF0000] text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-xs">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>This video is on YouTube</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">শেখাঘর থিয়েটার প্লেয়ার</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToWatch && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToWatch(video.youtubeId);
                }}
                className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="পূর্ণাঙ্গ ভিডিও পেজে দেখুন"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সম্পূর্ণ পেজে দেখুন</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player (16:9) */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Info & Controls */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {video.title}
              </h2>

              <div className="flex items-center gap-3">
                {video.channelAvatar ? (
                  <img
                    src={video.channelAvatar}
                    alt={video.channelName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    {video.channelName?.charAt(0) || 'Y'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-200">
                    <span>{video.channelName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 fill-slate-700" />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{video.viewsCount || 'YouTube'}</span>
                    {video.publishedTime && (
                      <>
                        <span>•</span>
                        <span>{video.publishedTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleBookmarkToggle}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#FF0000] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>YouTube এ খুলুন</span>
              </a>
            </div>
          </div>

          {video.description && (
            <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800">
              <p className="line-clamp-3">{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
