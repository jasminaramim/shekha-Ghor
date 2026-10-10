import React from 'react';
import { ICourse } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { PlayCircle, Bookmark, Clock, BookOpen, Eye } from 'lucide-react';

interface CourseCardProps {
  course: ICourse;
  onSelect: (slug: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const { bookmarkedSlugs, toggleBookmark, user } = useAuth();
  const isBookmarked = bookmarkedSlugs.includes(course.slug);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('বুকমার্ক করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    toggleBookmark(course.slug);
  };

  return (
    <div
      onClick={() => onSelect(course.slug)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#16803C]/40 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-slate-900 text-white">
            <PlayCircle className="w-12 h-12 text-[#FACC15] opacity-80" />
          </div>
        )}

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 text-[#16803C] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <PlayCircle className="w-7 h-7 fill-current" />
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          aria-label="Bookmark Course"
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'bg-black/50 text-white hover:bg-black/75'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Zero-Pill Metadata Line: Quiet unboxed inline text with typographic separators */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-medium text-[#16803C]">{course.categorySlug}</span>
          <span aria-hidden="true">·</span>
          <span>{course.duration || '৪ ঘন্টা'}</span>
          <span aria-hidden="true">·</span>
          <span>{course.totalLessons || 0} টি পাঠ</span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#16803C] transition-colors line-clamp-2 leading-snug mb-2">
          {course.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor & CTA Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="text-xs text-slate-700">
            <span className="text-slate-400 block text-[11px]">প্রশিক্ষক</span>
            <span className="font-semibold truncate block max-w-[140px]">{course.instructor}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(course.slug);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#16803C] bg-emerald-50 group-hover:bg-[#16803C] group-hover:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            কোর্সটি দেখুন →
          </button>
        </div>
      </div>
    </div>
  );
};
