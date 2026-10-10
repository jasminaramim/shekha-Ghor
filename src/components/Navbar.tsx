import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  User as UserIcon,
  BookMarked,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Compass,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'হোম', path: '/' },
    { label: 'সকল ক্যাটাগরি', path: '/categories' },
    { label: 'সকল কোর্স', path: '/courses' },
    { label: 'জনপ্রিয় ভিডিও', path: '/courses?sort=popular' },
    { label: 'আমাদের সম্পর্কে', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer group shrink-0 flex items-center"
          >
            <Logo size="md" />
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] font-medium text-slate-700">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                    isActive
                      ? 'text-[#16803C] font-semibold'
                      : 'hover:text-[#16803C]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16803C] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Box on Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                placeholder="কী শিখতে চান? খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-60 pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] focus:bg-white transition-all text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User State */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#16803C] text-white flex items-center justify-center font-semibold text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-slate-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#16803C]" />
                      আমার ড্যাশবোর্ড
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/bookmarks');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <BookMarked className="w-4 h-4 text-amber-500" />
                      সংরক্ষিত কোর্সসমূহ
                    </button>

                    {/* Admin Panel strictly visible ONLY if user is verified admin */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#16803C]" />
                        অ্যাডমিন ড্যাশবোর্ড
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট করুন
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-[#16803C] rounded-lg transition-colors cursor-pointer"
                >
                  লগইন
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#16803C] hover:bg-[#105C2B] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  নিবন্ধন
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="কী শিখতে চান? খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentPath === link.path
                    ? 'bg-emerald-50 text-[#16803C] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-[#16803C]" />
                অ্যাডমিন ড্যাশবোর্ড
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
