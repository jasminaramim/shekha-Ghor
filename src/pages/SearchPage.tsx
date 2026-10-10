import React, { useState, useEffect } from 'react';
import { ICourse } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { Search, BookOpen } from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  navigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', navigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCourses([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.courses.getAll({ search: searchTerm.trim() });
      if (res.success && res.courses) {
        setCourses(res.courses);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          কোর্স ও ভিডিও অনুসন্ধান
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          যেকোনো বিষয়ের নাম, প্রযুক্তি, প্রোগ্রামিং ল্যাঙ্গুয়েজ অথবা শিক্ষকের নাম দিয়ে খুঁজুন
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 p-1.5 bg-white border border-slate-300 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-[#16803C]">
          <div className="flex-1 flex items-center pl-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেমন: রিয়্যাক্ট, পাইথন, ফটোশপ, মুনজেরিন শহীদ..."
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            অনুসন্ধান
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              &ldquo;{query}&rdquo; এর জন্য <strong>{courses.length}</strong> টি ফলাফল পাওয়া গেছে
            </span>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  onSelect={(slug) => navigate(`/courses/${slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">কোনো ফলাফল মেলেনি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                বানান সঠিক আছে কি না যাচাই করুন বা আরও সাধারণ কোনো শব্দ দিয়ে খুঁজুন।
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">
          অনুসন্ধানের জন্য উপরের বক্সে শব্দ লিখে এন্টার চাপুন।
        </div>
      )}
    </div>
  );
};
