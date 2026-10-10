import React, { useState, useEffect } from 'react';
import { ICategory } from '../types/index.js';
import { api } from '../services/api.js';
import { CategoryCard } from '../components/CategoryCard.js';
import { Search, Compass } from 'lucide-react';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.categories.getAll();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Video Banner */}
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-lg relative group">
        <video 
          src="/allcategories.mp4" 
          autoPlay 
          controls
          loop 
          playsInline 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 sm:p-10 pointer-events-none">
          <div className="text-white space-y-2 pointer-events-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">সবগুলো বিষয় একসাথে</h2>
            <p className="text-sm sm:text-base font-medium opacity-90 drop-shadow-sm">আপনার পছন্দের বিষয় বেছে নিন এবং শেখা শুরু করুন</p>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16803C] bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>বিষয়ভিত্তিক তালিকা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            সকল ২০টি শিক্ষামূলক ক্যাটাগরি
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            যে বিষয়ে নিজের দক্ষতা বাড়াতে চান, সেই বিষয়ে ক্লিক করে কোর্সসমূহ দেখুন
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ক্যাটাগরি ফিল্টার করুন..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid of 20 categories */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              onSelect={(slug) => navigate(`/categories/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
