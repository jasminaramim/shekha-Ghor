import React from 'react';
import { ICategory } from '../types/index.js';
import {
  Code,
  Smartphone,
  Terminal,
  Palette,
  TrendingUp,
  Briefcase,
  Cpu,
  Languages,
  GraduationCap,
  Atom,
  Building2,
  Video,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Award,
  BookOpen,
  Globe,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

interface CategoryCardProps {
  category: ICategory;
  onSelect: (slug: string) => void;
  compact?: boolean;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Code,
  Smartphone,
  Terminal,
  Palette,
  TrendingUp,
  Briefcase,
  Cpu,
  Languages,
  GraduationCap,
  Atom,
  Building2,
  Video,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Award,
  BookOpen,
  Globe,
  Sparkles,
  Lightbulb,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onSelect,
  compact = false,
}) => {
  const IconComponent = iconMap[category.icon] || BookOpen;

  if (compact) {
    return (
      <button
        onClick={() => onSelect(category.slug)}
        className="group text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-[#16803C] hover:bg-emerald-50/40 transition-all flex items-center gap-3 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-lg bg-emerald-100/60 text-[#16803C] group-hover:bg-[#16803C] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#16803C] truncate">
            {category.name}
          </h4>
          <span className="text-xs text-slate-500">
            {category.courseCount > 0 ? `${category.courseCount} টি কোর্স` : 'শীঘ্রই আসছে'}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => onSelect(category.slug)}
      className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-[#16803C] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16803C] group-hover:bg-[#16803C] group-hover:text-white flex items-center justify-center mb-4 transition-colors">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#16803C] transition-colors mb-1.5">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {category.description || 'সম্পূর্ণ বাংলায় শিক্ষামূলক ভিডিও ও কোর্স।'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{category.courseCount > 0 ? `${category.courseCount} টি কোর্স` : 'আপলোড চলছে'}</span>
        <span className="text-[#16803C] font-semibold group-hover:translate-x-0.5 transition-transform">
          দেখুন →
        </span>
      </div>
    </div>
  );
};
