import React from 'react';
import { IYouTubeVideo } from '../types/index.js';
import { Play, CheckCircle2, ExternalLink, Bookmark, Clock, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface YouTubeCardProps {
  video: IYouTubeVideo;
  onSelect: (youtubeId: string) => void;
  onQuickPlay?: (video: IYouTubeVideo) => void;
  layout?: 'grid' | 'list';
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({
  video,
  onSelect,
  onQuickPlay,
  layout = 'grid',
}) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();
  const isBookmarked = bookmarkedSlugs.includes(video.youtubeId);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('বুকমার্ক সংরক্ষণ করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    toggleBookmark(video.youtubeId);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    if (onQuickPlay) {
      onQuickPlay(video);
    } else {
      onSelect(video.youtubeId);
    }
  };

  if (layout === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-red-500/50 hover:shadow-lg transition-all duration-300 p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer relative"
      >
        {/* Thumbnail (List View) */}
        <div className="relative w-full sm:w-72 md:w-80 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-xs">
          <img
            src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* YouTube Red Badge - Always Visible */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-[#FF0000] text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md tracking-wide">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>This video is on YouTube</span>
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
              {video.duration}
            </span>
          )}

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content Details (List View) */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                {video.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleBookmark}
                  title="বুকমার্ক করুন"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleOpenExternal}
                  title="সরাসরি YouTube এ খুলুন"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel info with avatar */}
            <div className="flex items-center gap-2 pt-0.5">
              {video.channelAvatar ? (
                <img
                  src={video.channelAvatar}
                  alt={video.channelName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  {video.channelName?.charAt(0) || 'Y'}
                </div>
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900">
                {video.channelName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 fill-slate-100" />
            </div>

            {/* Description Snippet */}
            {video.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                {video.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <span>{video.viewsCount || 'YouTube ভিউ'}</span>
              {video.publishedTime && (
                <>
                  <span>•</span>
                  <span>{video.publishedTime}</span>
                </>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(video.youtubeId);
              }}
              className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              ভিডিও দেখুন →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Classic YouTube Grid Card)
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-red-500/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* 16:9 Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <img
          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* The YouTube Red Badge: Explicit user requirement */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-[#FF0000] text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md tracking-wide">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>This video is on YouTube</span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          aria-label="Bookmark"
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-amber-400 text-slate-900 shadow-md'
              : 'bg-black/60 text-white hover:bg-black/85 backdrop-blur-xs'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Video Duration Pill */}
        {video.duration && (
          <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
            {video.duration}
          </span>
        )}

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Details in YouTube 2-Column Style */}
      <div className="p-4 flex gap-3 flex-1 justify-between flex-col">
        <div className="flex gap-3">
          {/* Left Column: Channel Avatar */}
          <div className="shrink-0 pt-0.5">
            {video.channelAvatar ? (
              <img
                src={video.channelAvatar}
                alt={video.channelName}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs ring-1 ring-red-200">
                {video.channelName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>

          {/* Right Column: Title and Channel Meta */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
              {video.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span className="truncate max-w-[180px] font-medium hover:text-slate-900">
                {video.channelName}
              </span>
              <CheckCircle2 className="w-3 h-3 text-slate-400 fill-slate-100 shrink-0" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
              <span>{video.viewsCount || 'ইউটিউব ভিউ'}</span>
              {video.publishedTime && (
                <>
                  <span>•</span>
                  <span>{video.publishedTime}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>YouTube এ দেখুন</span>
          </button>

          <span className="text-red-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            প্লে করুন <Play className="w-3 h-3 fill-current inline" />
          </span>
        </div>
      </div>
    </div>
  );
};
