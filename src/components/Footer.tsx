import React from 'react';
import { Logo } from './Logo.js';
import { Mail, Phone, MapPin, Youtube, Facebook, Github } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer inline-block"
            >
              <Logo size="md" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              “শিখুন নিজের গতিতে, এগিয়ে যান আত্মবিশ্বাসে।”
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              শেখাঘর হলো বাংলাদেশের প্রথম সারির উন্মুক্ত বাংলা শিক্ষামূলক ভিডিও ও কোর্স প্ল্যাটফর্ম। দেশসেরা মেন্টরদের ভিডিও টিউটোরিয়াল ও প্লেলিস্ট এখন এক ঠিকানায়।
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: জনপ্রিয় বিষয়সমূহ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">জনপ্রিয় ক্যাটাগরি</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/categories/web-development')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  ওয়েব ডেভেলপমেন্ট
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories/programming')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  পাইথন ও প্রোগ্রামিং
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories/graphic-design')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  গ্রাফিক ডিজাইন ও ফ্রিল্যান্সিং
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories/digital-marketing')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  ডিজিটাল মার্কেটিং ও এসইও
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories/artificial-intelligence')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  কৃত্রিম বুদ্ধিমত্তা ও এআই
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories/spoken-english')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  স্পোকেন ইংলিশ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: গুরুত্বপূর্ণ লিংক */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/courses')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  সকল কোর্স তালিকা
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  সকল ২০টি ক্যাটাগরি
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  যোগাযোগ ও সহায়তা
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  গোপনীয়তা নীতি
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  ব্যবহারের শর্তাবলী
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: যোগাযোগ ও সহায়তা */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">যোগাযোগ</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@shekhaghor.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+৮৮০ ১৭০০-০০০০০০</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-400">
                কোনো সমস্যা থাকলে ভিডিও প্লেয়ার পেজ থেকে সরাসরি রিপোর্ট করতে পারেন।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} শেখাঘর (Shekhaghor)। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-slate-400">
            জ্ঞান ছড়িয়ে দিন বিনামূল্যে · প্রযুক্তির সেবায় বাংলা
          </p>
        </div>
      </div>
    </footer>
  );
};
