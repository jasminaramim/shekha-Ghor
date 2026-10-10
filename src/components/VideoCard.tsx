import React from 'react';
import { IVideo } from '../types/index.js';
import { Play, Eye, Clock, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface VideoCardProps {
  video: IVideo;
  onSelect: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const { user, bookmarkedSlugs, toggleBookmark } = useAuth();
  const isBookmarked = bookmarkedSlugs.includes(video.youtubeId);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('বুকমার্ক করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    toggleBookmark(video.youtubeId);
  };

  return (
    <div
      onClick={() => onSelect(video.youtubeId || video._id || '')}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#16803C]/40 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <img
          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Play Icon Badge */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono px-2 py-0.5 rounded">
          {video.duration || '১৫ মিনিট'}
        </span>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          aria-label="Bookmark Video"
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-amber-400 text-slate-900'
              : 'bg-black/50 text-white hover:bg-black/75'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Metadata line without pills */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-[#16803C] truncate max-w-[120px]">
              {video.categorySlug}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[140px]">{video.channelName || 'ইউটিউব'}</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#16803C] transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {video.viewsCount || 0} বার দেখা হয়েছে
          </span>
          <span className="text-[#16803C] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            ভিডিও দেখুন →
          </span>
        </div>
      </div>
    </div>
  );
};
