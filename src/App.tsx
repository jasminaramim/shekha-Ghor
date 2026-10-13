import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

import { HomePage } from './pages/HomePage.js';
import { CoursesPage } from './pages/CoursesPage.js';
import { CourseDetailPage } from './pages/CourseDetailPage.js';
import { LearnPage } from './pages/LearnPage.js';
import { VideoWatchPage } from './pages/VideoWatchPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { CategoryDetailPage } from './pages/CategoryDetailPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { BookmarksPage } from './pages/BookmarksPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { KidsPage } from './pages/KidsPage.js';
import { ReelsPage } from './pages/ReelsPage.js';
import { UploadReelPage } from './pages/UploadReelPage.js';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, DonatePage } from './pages/StaticPages.js';
import { useGlobalVideoScrollSync } from './hooks/useGlobalVideoScrollSync.js';

export default function App() {
  useGlobalVideoScrollSync();

  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Dispatcher
  const renderCurrentPage = () => {
    const url = new URL(currentPath, 'http://localhost');
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Home
    if (pathname === '/' || pathname === '') {
      return <HomePage navigate={navigate} />;
    }

    // Courses List
    if (pathname === '/courses') {
      const sort = searchParams.get('sort') || 'newest';
      return <CoursesPage navigate={navigate} initialSort={sort} />;
    }

    // Course Detail: /courses/:slug
    const courseDetailMatch = pathname.match(/^\/courses\/([^/]+)$/);
    if (courseDetailMatch) {
      return <CourseDetailPage slug={courseDetailMatch[1]} navigate={navigate} />;
    }

    // Standalone Video Player: /video/:id
    const videoMatch = pathname.match(/^\/video\/([^/]+)$/);
    if (videoMatch) {
      return <VideoWatchPage id={videoMatch[1]} navigate={navigate} />;
    }

    // Video Learning Classroom: /learn/:courseSlug/:lessonSlug
    const learnMatch = pathname.match(/^\/learn\/([^/]+)\/([^/]+)$/);
    if (learnMatch) {
      return (
        <LearnPage
          courseSlug={learnMatch[1]}
          lessonSlug={learnMatch[2]}
          navigate={navigate}
        />
      );
    }

    // Categories List
    if (pathname === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    // Category Detail: /categories/:slug
    const categoryDetailMatch = pathname.match(/^\/categories\/([^/]+)$/);
    if (categoryDetailMatch) {
      return <CategoryDetailPage slug={categoryDetailMatch[1]} navigate={navigate} />;
    }

    // Search: /search
    if (pathname === '/search') {
      const query = searchParams.get('q') || '';
      return <SearchPage initialQuery={query} navigate={navigate} />;
    }

    // Kids Corner
    if (pathname === '/kids') {
      return <KidsPage navigate={navigate} />;
    }

    // Reels
    if (pathname === '/reels') {
      return <ReelsPage navigate={navigate} />;
    }
    if (pathname === '/upload-reel') {
      return <UploadReelPage navigate={navigate} />;
    }

    // Auth
    if (pathname === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (pathname === '/register') {
      return <RegisterPage navigate={navigate} />;
    }

    // Student Dashboard
    if (pathname === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }

    // Bookmarks
    if (pathname === '/bookmarks') {
      return <BookmarksPage navigate={navigate} />;
    }

    // Admin Panel
    if (pathname === '/admin') {
      return <AdminPage navigate={navigate} />;
    }

    // Static Pages
    if (pathname === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (pathname === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (pathname === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }
    if (pathname === '/terms') {
      return <TermsPage navigate={navigate} />;
    }
    if (pathname === '/donate') {
      return <DonatePage navigate={navigate} />;
    }

    // Fallback: 404
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900">৪০৪ — পৃষ্ঠাটি পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500">অনুরোধকৃত ঠিকানাটি সঠিক নয় অথবা সরিয়ে ফেলা হয়েছে।</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#16803C] text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  };

  const isLearningPage = currentPath.startsWith('/learn/');

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#F7FAF5] text-[#1F2937]">
        {/* Navbar is hidden on full-screen learning mode for maximum immersion, or stays pinned */}
        <Navbar currentPath={currentPath} navigate={navigate} />

        <main className="flex-1">
          {renderCurrentPage()}
        </main>

        {!isLearningPage && <Footer navigate={navigate} />}
      </div>
    </AuthProvider>
  );
}
