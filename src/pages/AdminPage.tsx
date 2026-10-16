import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  IAdminStats,
  ICourse,
  ICategory,
  IVideo,
  IReport,
  IAuditLog,
} from '../types/index.js';
import {
  ShieldCheck,
  PlusCircle,
  Video,
  BookOpen,
  FolderPlus,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
  FolderOpen,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  FolderTree,
  Baby,
  RefreshCw,
  X,
} from 'lucide-react';
import { CourseEditorModal } from '../components/admin/CourseEditorModal.js';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { user, isAdmin, login } = useAuth();

  // Admin inline login state if not already logged in as admin
  const [adminUsername, setAdminUsername] = useState('jasmin');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'categories' | 'youtube-import' | 'video-upload' | 'videos-list' | 'pending-reels' | 'courses' | 'reports' | 'logs'
  >('categories');

  const [pendingReels, setPendingReels] = useState<IVideo[]>([]);
  
  // Local Video Upload State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('');

  // Data States
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // YouTube Importer Form State
  const [ytUrl, setYtUrl] = useState('');
  const [ytParsing, setYtParsing] = useState(false);
  const [ytPreview, setYtPreview] = useState<any>(null);
  const [ytVideoTitle, setYtVideoTitle] = useState('');
  const [ytVideoDescription, setYtVideoDescription] = useState('');
  const [ytCategorySlug, setYtCategorySlug] = useState('web-development');
  const [ytSubCategorySlug, setYtSubCategorySlug] = useState('');
  const [ytAudience, setYtAudience] = useState<'all' | 'children' | 'adults'>('all');
  const [ytDifficulty, setYtDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [ytDuration, setYtDuration] = useState('১৫ মিনিট');
  const [ytSuccessMsg, setYtSuccessMsg] = useState('');

  // YouTube Topic Search State
  const [searchTopic, setSearchTopic] = useState('');
  const [topicSearching, setTopicSearching] = useState(false);
  const [topicResults, setTopicResults] = useState<any[]>([]);

  // Category Modal / Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catParent, setCatParent] = useState<string>('');
  const [catAudience, setCatAudience] = useState<'children' | 'all' | 'adults'>('all');
  const [catIcon, setCatIcon] = useState('BookOpen');
  const [catDesc, setCatDesc] = useState('');
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDesc, setCatSeoDesc] = useState('');
  const [catOrder, setCatOrder] = useState(0);
  const [catSuccessMsg, setCatSuccessMsg] = useState('');

  // Delete Category Safety Modal State
  const [deleteSafetyModal, setDeleteSafetyModal] = useState<{
    isOpen: boolean;
    catId: string;
    catName: string;
    attachedVideos: number;
    attachedCourses: number;
    reassignTarget: string;
  }>({
    isOpen: false,
    catId: '',
    catName: '',
    attachedVideos: 0,
    attachedCourses: 0,
    reassignTarget: '',
  });

  // Course Editor State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null);

  // Video Editor State & Filters
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
  const [videoEditTitle, setVideoEditTitle] = useState('');
  const [videoEditDesc, setVideoEditDesc] = useState('');
  const [videoEditYoutubeUrl, setVideoEditYoutubeUrl] = useState('');
  const [videoEditCategory, setVideoEditCategory] = useState('');
  const [videoEditSubCategory, setVideoEditSubCategory] = useState('');
  const [videoEditAudience, setVideoEditAudience] = useState<'all' | 'children' | 'adults'>('all');
  const [videoEditDifficulty, setVideoEditDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [videoEditDuration, setVideoEditDuration] = useState('১৫ মিনিট');
  const [videoEditChannel, setVideoEditChannel] = useState('');
  const [videoSaving, setVideoSaving] = useState(false);

  // Video List Filters
  const [videoListSearch, setVideoListSearch] = useState('');
  const [videoListCatFilter, setVideoListCatFilter] = useState('all');
  const [videoLanguageFilter, setVideoLanguageFilter] = useState<'all' | 'bengali_only' | 'english_check'>('all');

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, coursesRes, catsRes, videosRes, reportsRes, logsRes] = await Promise.all([
        api.admin.getStats(),
        api.courses.getAll({ limit: 100 }),
        api.categories.getAll(),
        api.admin.getVideos({ limit: 100 }),
        api.reports.getAll(),
        api.admin.getAuditLogs(),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
      if (catsRes.success && catsRes.categories) setCategories(catsRes.categories);
      if (videosRes.success && videosRes.videos) setVideos(videosRes.videos);
      if (reportsRes.success && reportsRes.reports) setReports(reportsRes.reports);
      if (logsRes.success && logsRes.logs) setAuditLogs(logsRes.logs);

      // Load pending reels
      try {
        const pReelsRes = await fetch('/api/videos/admin/pending-reels', {
          headers: { Authorization: `Bearer ${localStorage.getItem('shekhaghor_token')}` }
        });
        const pReelsData = await pReelsRes.json();
        if (pReelsData.success) {
          setPendingReels(pReelsData.videos);
        }
      } catch (err) {
        console.error('Pending reels load error:', err);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle Admin Inline Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await login(adminUsername, adminPassword);
      if (!res.success) {
        setLoginError(res.message || 'ভুল ইউজারনেম বা পাসওয়ার্ড।');
      }
    } catch (err) {
      setLoginError('লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. YouTube URL Parser
  const handleParseYoutube = async () => {
    if (!ytUrl.trim()) return;
    setYtParsing(true);
    setYtSuccessMsg('');
    try {
      const res = await api.admin.parseYoutube(ytUrl.trim());
      const payload = (res as any).data?.data || (res as any).data;
      if (res.success && payload) {
        setYtPreview(payload);
        setYtVideoTitle(payload.title || '');
      } else {
        alert(res.message || 'ইউটিউব লিঙ্ক যাচাই করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('ইউটিউব লিঙ্ক পার্স করতে ব্যর্থ।');
    } finally {
      setYtParsing(false);
    }
  };

  // 2. YouTube Topic Search
  const handleSearchYoutubeTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTopic.trim()) return;
    setTopicSearching(true);
    try {
      const res = await api.admin.searchYoutube(searchTopic.trim());
      if (res.success && res.results) {
        setTopicResults(res.results);
      }
    } catch (err) {
      alert('ইউটিউব সার্চ ব্যর্থ।');
    } finally {
      setTopicSearching(false);
    }
  };

  // Pick searched video into URL import form
  const handleSelectTopicResult = (item: any) => {
    setYtUrl(`https://www.youtube.com/watch?v=${item.youtubeId}`);
    setYtPreview(item);
    setYtVideoTitle(item.title);
    setYtDuration(item.duration || '২০ মিনিট');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // 3. Save / Import YouTube Video into Database
  const handleImportVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytVideoTitle.trim() || !ytPreview?.youtubeId) {
      alert('ভিডিওর শিরোনাম এবং বৈধ ইউটিউব ভিডিও আবশ্যক।');
      return;
    }

    try {
      const res = await api.admin.importVideo({
        youtubeId: ytPreview.youtubeId,
        youtubeUrl: ytUrl || `https://www.youtube.com/watch?v=${ytPreview.youtubeId}`,
        title: ytVideoTitle.trim(),
        description: ytVideoDescription.trim() || ytVideoTitle.trim(),
        thumbnailUrl: ytPreview.thumbnailUrl,
        channelName: ytPreview.channelName || ytPreview.authorName || 'ইউটিউব',
        categorySlug: ytCategorySlug,
        subCategorySlug: ytSubCategorySlug || undefined,
        audience: ytAudience,
        difficultyLevel: ytDifficulty,
        duration: ytDuration || '১৫ মিনিট',
        isPublished: true,
      });

      if (res.success) {
        setYtSuccessMsg('অভিনন্দন! ভিডিওটি সফলভাবে শেখাঘর ডেটাবেসে যুক্ত হয়েছে।');
        setYtUrl('');
        setYtPreview(null);
        setYtVideoTitle('');
        setYtVideoDescription('');
        loadAdminData();
      } else {
        alert(res.message || 'ভিডিও যুক্ত করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err?.message || 'ত্রুটি দেখা দিয়েছে।');
    }
  };

  // 4. Open Category Modal (for create or edit)
  const openCategoryModal = (cat?: ICategory) => {
    if (cat) {
      setEditingCategoryId(cat._id || cat.id || null);
      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatParent(cat.parentSlug || '');
      setCatAudience(cat.audience || 'all');
      setCatIcon(cat.icon || 'BookOpen');
      setCatDesc(cat.description || '');
      setCatSeoTitle(cat.seoTitle || '');
      setCatSeoDesc(cat.seoDescription || '');
      setCatOrder(cat.order || 0);
    } else {
      setEditingCategoryId(null);
      setCatName('');
      setCatSlug('');
      setCatParent('');
      setCatAudience('all');
      setCatIcon('BookOpen');
      setCatDesc('');
      setCatSeoTitle('');
      setCatSeoDesc('');
      setCatOrder(categories.length + 1);
    }
    setCatSuccessMsg('');
    setIsCategoryModalOpen(true);
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      const payload: Partial<ICategory> = {
        name: catName.trim(),
        slug: catSlug.trim() || undefined,
        parentSlug: catParent || null,
        parentCategory: catParent || null,
        audience: catAudience,
        icon: catIcon,
        description: catDesc.trim(),
        seoTitle: catSeoTitle.trim() || catName.trim(),
        seoDescription: catSeoDesc.trim() || catDesc.trim(),
        order: Number(catOrder) || 0,
        isPublished: true,
      };

      if (editingCategoryId) {
        const res = await api.admin.updateCategory(editingCategoryId, payload);
        if (res.success) {
          setCatSuccessMsg('ক্যাটাগরি আপডেট সম্পন্ন হয়েছে!');
          setIsCategoryModalOpen(false);
          loadAdminData();
        } else {
          alert(res.message || 'আপডেট ব্যর্থ।');
        }
      } else {
        const res = await api.admin.createCategory(payload);
        if (res.success) {
          setCatSuccessMsg('নতুন ক্যাটাগরি তৈরি হয়েছে!');
          setIsCategoryModalOpen(false);
          loadAdminData();
        } else {
          alert(res.message || 'ক্যাটাগরি তৈরি ব্যর্থ।');
        }
      }
    } catch (err: any) {
      alert(err?.message || 'ত্রুটি দেখা দিয়েছে।');
    }
  };

  // Check Category before Deletion
  const handleDeleteCategoryPrompt = async (cat: ICategory) => {
    const catId = cat._id || cat.id || '';
    if (!catId) return;

    try {
      const checkRes = await api.admin.checkCategoryDelete(catId);
      if (checkRes.success && checkRes.hasContent) {
        // Has attached courses or videos, show modal with reassign option!
        setDeleteSafetyModal({
          isOpen: true,
          catId,
          catName: cat.name,
          attachedVideos: checkRes.attachedVideos || 0,
          attachedCourses: checkRes.attachedCourses || 0,
          reassignTarget: categories.find((c) => c.slug !== cat.slug)?.slug || '',
        });
      } else {
        // Safe to delete directly with prompt
        if (confirm(`আপনি কি "${cat.name}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
          await api.admin.deleteCategory(catId);
          loadAdminData();
        }
      }
    } catch (err) {
      alert('ক্যাটাগরি যাচাই করতে সমস্যা হয়েছে।');
    }
  };

  // Perform Safe Reassign and Delete
  const handleExecuteReassignAndDelete = async (force = false) => {
    try {
      const res = await api.admin.deleteCategory(deleteSafetyModal.catId, {
        force,
        reassignTo: force ? undefined : deleteSafetyModal.reassignTarget,
      });

      if (res.success) {
        setDeleteSafetyModal({ ...deleteSafetyModal, isOpen: false });
        loadAdminData();
      } else {
        alert(res.message || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // Open Edit Video Modal
  const handleOpenEditVideo = (vid: IVideo) => {
    setEditingVideo(vid);
    setVideoEditTitle(vid.title || '');
    setVideoEditDesc(vid.description || '');
    setVideoEditYoutubeUrl(vid.youtubeUrl || (vid.youtubeId ? `https://www.youtube.com/watch?v=${vid.youtubeId}` : ''));
    setVideoEditCategory(vid.categorySlug || 'web-development');
    setVideoEditSubCategory(vid.subCategorySlug || '');
    setVideoEditAudience(vid.audience || 'all');
    setVideoEditDifficulty(vid.difficultyLevel || 'all');
    setVideoEditDuration(vid.duration || '১৫ মিনিট');
    setVideoEditChannel(vid.channelName || '');
    setIsVideoModalOpen(true);
  };

  // Save / Update Video in Database
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setVideoSaving(true);
    try {
      let youtubeId = editingVideo.youtubeId;
      if (videoEditYoutubeUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = videoEditYoutubeUrl.match(regExp);
        if (match && match[2].length === 11) {
          youtubeId = match[2];
        }
      }

      const payload: Partial<IVideo> = {
        title: videoEditTitle.trim(),
        description: videoEditDesc.trim(),
        youtubeUrl: videoEditYoutubeUrl.trim(),
        youtubeId: youtubeId,
        thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : editingVideo.thumbnailUrl,
        categorySlug: videoEditCategory,
        subCategorySlug: videoEditSubCategory,
        audience: videoEditAudience,
        difficultyLevel: videoEditDifficulty,
        duration: videoEditDuration,
        channelName: videoEditChannel || editingVideo.channelName || 'শেখাঘর',
      };

      const res = await api.admin.updateVideo(editingVideo._id || editingVideo.id || '', payload);
      if (res.success) {
        setIsVideoModalOpen(false);
        setEditingVideo(null);
        loadAdminData();
      } else {
        alert(res.message || 'ভিডিও আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('ভিডিও আপডেট করার সময় সমস্যা হয়েছে।');
    } finally {
      setVideoSaving(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id?: string) => {
    if (!id) return;
    if (!confirm('আপনি কি এই ভিডিওটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.admin.deleteVideo(id);
      if (res.success) {
        loadAdminData();
      }
    } catch (err) {
      alert('ভিডিও মুছতে ব্যর্থ।');
    }
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      let res;
      if (editingCourse) {
        res = await api.admin.updateCourse(editingCourse._id || editingCourse.id || '', courseData);
      } else {
        res = await api.admin.createCourse(courseData);
      }
      if (res.success) {
        setIsCourseModalOpen(false);
        loadAdminData(); // refresh courses list
      } else {
        alert(res.message || 'কোর্স সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভার এরর');
    }
  };

  // 1. Not Admin View: Show Secure Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16803C] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">সুরক্ষিত অ্যাডমিন প্যানেল</h2>
            <p className="text-xs text-slate-500">
              শুধুমাত্র অনুমোদিত অ্যাডমিন এখানে প্রবেশ করতে পারবেন
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অ্যাডমিন ইউজারনেম:
              </label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="jasmin"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পাসওয়ার্ড:
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Root Categories for parent dropdown
  const rootCategories = categories.filter((c) => !c.parentSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-100 text-[#16803C] rounded-md">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              শেখাঘর — All-in-One অ্যাডমিন ড্যাশবোর্ড
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ক্যাটাগরি, সাবক্যাটাগরি এবং YouTube ভিডিও সংগ্রহের সম্পূর্ণ নিয়ন্ত্রণ কেন্দ্র
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'bg-white text-[#16803C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ক্যাটাগরি ব্যবস্থাপনা ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('youtube-import')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'youtube-import' ? 'bg-white text-[#16803C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + ইউটিউব ভিডিও আমদানি
          </button>
          <button
            onClick={() => setActiveTab('video-upload')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'video-upload' ? 'bg-white text-[#16803C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + লোকাল ভিডিও আপলোড
          </button>
          <button
            onClick={() => setActiveTab('videos-list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'videos-list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ভিডিও তালিকা ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('pending-reels')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'pending-reels' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            পেন্ডিং রিলস ({pendingReels.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            কোর্স তালিকা ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            রিপোর্ট ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            পরিসংখ্যান
          </button>
        </div>
      </div>

      {/* Tab 1: DYNAMIC CATEGORY MANAGEMENT SYSTEM */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50 p-6 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#16803C]" />
                ডাইনামিক ক্যাটাগরি ও সাবক্যাটাগরি ম্যানেজমেন্ট
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl">
                কোনো ক্যাটাগরি হার্ডকোড করা নয়। আপনি যখন খুশি অভিভাবক ক্যাটাগরি (Parent) এবং যেকোনো স্তরের সাবক্যাটাগরি তৈরি, সম্পাদনা ও সাজাতে পারেন।
              </p>
            </div>

            <button
              onClick={() => openCategoryModal()}
              className="px-5 py-2.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন ক্যাটাগরি তৈরি করুন
            </button>
          </div>

          {/* Hierarchical Categories View */}
          <div className="space-y-4">
            {rootCategories.map((root) => {
              const children = categories.filter((c) => c.parentSlug === root.slug);

              return (
                <div key={root.slug} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  {/* Root Category Row */}
                  <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16803C] flex items-center justify-center font-bold">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{root.name}</h3>
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            /{root.slug}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                            {root.audience === 'children'
                              ? 'শিশুদের জন্য'
                              : root.audience === 'adults'
                              ? 'প্রাপ্তবয়স্কদের জন্য'
                              : 'সবার জন্য'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{root.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {root.videoCount || 0} টি ভিডিও · {root.courseCount || 0} টি কোর্স
                      </span>

                      <button
                        onClick={() => openCategoryModal(root)}
                        className="p-1.5 text-slate-600 hover:text-[#16803C] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategoryPrompt(root)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Children List */}
                  {children.length > 0 ? (
                    <div className="divide-y divide-slate-100 pl-4 sm:pl-10">
                      {children.map((sub) => (
                        <div
                          key={sub.slug}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-emerald-50/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-300">↳</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-800">{sub.name}</h4>
                                <span className="text-[10px] font-mono text-slate-400">/{sub.slug}</span>
                              </div>
                              <p className="text-xs text-slate-500">{sub.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs text-slate-400">
                              {sub.videoCount || 0} টি ভিডিও
                            </span>

                            <button
                              onClick={() => openCategoryModal(sub)}
                              className="p-1 text-slate-500 hover:text-[#16803C]"
                              title="সম্পাদনা"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategoryPrompt(sub)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 pl-12 text-xs text-slate-400 italic">
                      কোনো সাবক্যাটাগরি নেই।
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: YOUTUBE VIDEO & PLAYLIST IMPORT (Topic Search + URL Import) */}
      {activeTab === 'youtube-import' && (
        <div className="space-y-8">
          {/* Section A: YouTube Topic Search (Search educational videos by keywords) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#16803C]" />
                বিষয় লিখে ইউটিউব শিক্ষামূলক ভিডিও খুঁজুন ও আমদানি করুন
              </h3>
              <p className="text-xs text-slate-500">
                যেমন: &ldquo;HTML Bangla Tutorial&rdquo;, &ldquo;JavaScript Bangla&rdquo;, &ldquo;শিশুদের বাংলা ছড়া&rdquo;, &ldquo;Python Programming&rdquo;
              </p>
            </div>

            <form onSubmit={handleSearchYoutubeTopic} className="flex gap-2">
              <input
                type="text"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="কী বিষয়ের ভিডিও খুঁজতে চান লিখুন..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
              <button
                type="submit"
                disabled={topicSearching || !searchTopic.trim()}
                className="px-5 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                {topicSearching ? 'অনুসন্ধান হচ্ছে...' : 'ভিডিও খুঁজুন'}
              </button>
            </form>

            {topicResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                {topicResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all space-y-2 bg-slate-50/50"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full aspect-video rounded-lg object-cover"
                    />
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</h4>
                    <span className="text-[11px] text-slate-500 block truncate">{item.channelName}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectTopicResult(item)}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-[#16803C] rounded-lg transition-colors cursor-pointer"
                    >
                      এই ভিডিওটি নির্বাচন করুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Manual YouTube URL & Import Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                সরাসরি লিঙ্ক থেকে ভিডিও আমদানি ও প্রকাশনা
              </h3>
              <p className="text-xs text-slate-500">
                ইউটিউব ভিডিও লিঙ্ক দিলে স্বয়ংক্রিয়ভাবে থাম্বনেইল, আইডি ও চ্যানেলের নাম যাচাই করা হবে।
              </p>
            </div>

            {ytSuccessMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-[#16803C]" />
                <span>{ytSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">ইউটিউব ভিডিও URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
                <button
                  type="button"
                  onClick={handleParseYoutube}
                  disabled={ytParsing || !ytUrl.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {ytParsing ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
                </button>
              </div>
            </div>

            {ytPreview && (
              <form onSubmit={handleImportVideo} className="space-y-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-44 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                    <img
                      src={ytPreview.thumbnailUrl}
                      alt={ytPreview.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ইউটিউব আইডি: {ytPreview.youtubeId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{ytPreview.title}</h4>
                    <p className="text-xs text-slate-500">চ্যানেল: {ytPreview.authorName || ytPreview.channelName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ভিডিওর বাংলা শিরোনাম:
                  </label>
                  <input
                    type="text"
                    required
                    value={ytVideoTitle}
                    onChange={(e) => setYtVideoTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      মূল ক্যাটাগরি:
                    </label>
                    <select
                      value={ytCategorySlug}
                      onChange={(e) => setYtCategorySlug(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.parentSlug ? `↳ ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      কার জন্য (Audience):
                    </label>
                    <select
                      value={ytAudience}
                      onChange={(e) => setYtAudience(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                    >
                      <option value="all">সবার জন্য (All)</option>
                      <option value="children">শিশুদের জন্য (Kids)</option>
                      <option value="adults">প্রাপ্তবয়স্ক শিক্ষার্থীদের জন্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      কঠিনতার স্তর:
                    </label>
                    <select
                      value={ytDifficulty}
                      onChange={(e) => setYtDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                    >
                      <option value="all">সাধারণ (General)</option>
                      <option value="beginner">বিগিনার (Beginner)</option>
                      <option value="intermediate">ইন্টারমিডিয়েট (Intermediate)</option>
                      <option value="advanced">অ্যাডভান্সড (Advanced)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ভিডিওর সারসংক্ষেপ বা পরিচিতি:
                  </label>
                  <textarea
                    rows={3}
                    value={ytVideoDescription}
                    onChange={(e) => setYtVideoDescription(e.target.value)}
                    placeholder="ভিডিওতে কী কী বিষয়ে আলোচনা করা হয়েছে লিখুন..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  ভিডিও সংরক্ষণ ও শেখাঘরে প্রকাশ করুন
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tab Video Upload */}
      {activeTab === 'video-upload' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-slate-900">সরাসরি লোকাল ভিডিও আপলোড করুন</h3>
          <p className="text-sm text-slate-500 mb-6">সরাসরি আপনার কম্পিউটার বা মোবাইল থেকে ভিডিও আপলোড করুন।</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!uploadTitle) return alert('টাইটেল দিন।');
            if (!uploadFile && !uploadYoutubeUrl) return alert('ভিডিও ফাইল অথবা ইউটিউব লিংক দিন।');
            setUploading(true);
            const fd = new FormData();
            fd.append('title', uploadTitle);
            fd.append('description', uploadDesc);
            fd.append('categorySlug', uploadCategory || 'reels');
            if (uploadFile) fd.append('video', uploadFile);
            if (uploadYoutubeUrl) fd.append('youtubeUrl', uploadYoutubeUrl);
            
            try {
              const res = await fetch('/api/videos/upload-reel', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('shekhaghor_token')}` },
                body: fd
              });
              const data = await res.json();
              if (data.success) {
                alert('ভিডিও আপলোড সফল!');
                setUploadTitle('');
                setUploadDesc('');
                setUploadFile(null);
                loadAdminData();
              } else alert(data.message);
            } catch(err) { alert('সার্ভার সমস্যা হয়েছে।'); }
            finally { setUploading(false); }
          }} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">ভিডিও টাইটেল *</label>
              <input type="text" value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} required placeholder="যেমন: নতুন রিলস বা কোর্স ভিডিও" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#16803C] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">ক্যাটাগরি</label>
              <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#16803C] focus:outline-none">
                <option value="reels">রিলস (Reels) - ডিফল্ট</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.parentSlug ? `↳ ${c.name}` : c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">বিবরণ (Optional)</label>
              <textarea value={uploadDesc} onChange={e=>setUploadDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#16803C] focus:outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">ভিডিও আপলোডের মাধ্যম *</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="adminUploadMethod" checked={!uploadYoutubeUrl} onChange={() => setUploadYoutubeUrl('')} className="w-4 h-4 text-[#16803C]" />
                  <span className="text-sm font-medium">লোকাল ভিডিও ফাইল</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="adminUploadMethod" checked={!!uploadYoutubeUrl} onChange={() => { setUploadFile(null); setUploadYoutubeUrl('https://'); }} className="w-4 h-4 text-[#16803C]" />
                  <span className="text-sm font-medium">ইউটিউব লিংক</span>
                </label>
              </div>
            </div>

            {uploadYoutubeUrl !== '' ? (
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">ইউটিউব ভিডিও লিংক *</label>
                <input
                  type="url"
                  value={uploadYoutubeUrl === 'https://' ? '' : uploadYoutubeUrl}
                  onChange={(e) => setUploadYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">ভিডিও ফাইল *</label>
                <input type="file" accept="video/*" onChange={e=>setUploadFile(e.target.files?.[0] || null)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
            )}
            <button type="submit" disabled={uploading} className="w-full py-3 bg-[#16803C] hover:bg-[#105C2B] text-white rounded-xl font-bold shadow-md">
              {uploading ? 'আপলোড হচ্ছে...' : 'ভিডিও আপলোড করুন'}
            </button>
          </form>
        </div>
      )}

      {/* Tab Pending Reels */}
      {activeTab === 'pending-reels' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-4">
           <div className="p-4 sm:p-6 border-b border-slate-200">
             <h3 className="text-base font-bold text-slate-900">পেন্ডিং রিলস ও আপলোড করা ভিডিও ({pendingReels.length} টি)</h3>
           </div>
           <div className="p-4 sm:p-6">
              {pendingReels.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                   <p>কোনো পেন্ডিং ভিডিও নেই।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pendingReels.map(reel => (
                    <div key={reel._id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50">
                       <div>
                         <p className="font-bold text-sm text-slate-900 line-clamp-2">{reel.title}</p>
                         <p className="text-xs text-[#16803C] font-semibold mt-1">Category: {reel.categorySlug}</p>
                         <p className="text-xs text-slate-500 mt-2 line-clamp-3">{reel.description}</p>
                       </div>
                       <div className="mt-4 flex gap-2">
                         <button onClick={async () => {
                           if(confirm('এই ভিডিওটি ওয়েবসাইটের জন্য অ্যাপ্রুভ করতে চান?')){
                             try {
                               await fetch(`/api/videos/admin/approve-reel/${reel._id}`, {method: 'PUT', headers: {Authorization: `Bearer ${localStorage.getItem('shekhaghor_token')}`}});
                               loadAdminData();
                             } catch(e) {}
                           }
                         }} className="flex-1 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white rounded-lg text-xs font-bold transition">
                           অ্যাপ্রুভ করুন
                         </button>
                         <button onClick={() => handleDeleteVideo(reel._id)} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      )}

      {/* Tab 3: VIDEOS LIST TABLE */}
      {activeTab === 'videos-list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  শেখাঘরের সকল ভিডিও সংগ্রহ ({videos.length} টি)
                </h3>
                {videos.filter((v) => !/[\u0980-\u09FF]/.test(v.title)).length === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ১০০% বাংলা ভিডিও নিশ্চিত
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {videos.filter((v) => !/[\u0980-\u09FF]/.test(v.title)).length} টি ইংরেজি ভিডিও চিহ্নিত
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                সকল ভিডিও বাংলায় রূপান্তর ও সম্পাদনা করুন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVideoLanguageFilter(videoLanguageFilter === 'english_check' ? 'all' : 'english_check')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                  videoLanguageFilter === 'english_check'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                ইংরেজি ভিডিও ফিল্টার ({videos.filter((v) => !/[\u0980-\u09FF]/.test(v.title)).length})
              </button>

              <button
                onClick={() => setActiveTab('youtube-import')}
                className="px-3.5 py-1.5 bg-[#16803C] text-white text-xs font-semibold rounded-lg hover:bg-[#105C2B] cursor-pointer"
              >
                + নতুন ভিডিও যোগ করুন
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="px-4 sm:px-6 pt-2 pb-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                placeholder="ভিডিওর শিরোনাম বা চ্যানেল দিয়ে খুঁজুন..."
                value={videoListSearch}
                onChange={(e) => setVideoListSearch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
            </div>
            <div>
              <select
                value={videoListCatFilter}
                onChange={(e) => setVideoListCatFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              >
                <option value="all">সকল ক্যাটাগরি ({videos.length})</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.parentSlug ? `↳ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={videoLanguageFilter}
                onChange={(e) => setVideoLanguageFilter(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              >
                <option value="all">ভাষা ফিল্টার: সকল ভিডিও</option>
                <option value="bengali_only">শুধুমাত্র খাঁটি বাংলা ভিডিও</option>
                <option value="english_check">পর্যালোচনা প্রয়োজন (ইংরেজি ভিডিও)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {(() => {
              const filteredVideos = videos.filter((vid) => {
                const matchesSearch =
                  !videoListSearch ||
                  vid.title.toLowerCase().includes(videoListSearch.toLowerCase()) ||
                  vid.channelName?.toLowerCase().includes(videoListSearch.toLowerCase()) ||
                  vid.youtubeId.toLowerCase().includes(videoListSearch.toLowerCase());

                const matchesCat =
                  videoListCatFilter === 'all' ||
                  vid.categorySlug === videoListCatFilter ||
                  vid.subCategorySlug === videoListCatFilter;

                const hasBengaliLetters = /[\u0980-\u09FF]/.test(vid.title);
                let matchesLang = true;
                if (videoLanguageFilter === 'bengali_only') {
                  matchesLang = hasBengaliLetters;
                } else if (videoLanguageFilter === 'english_check') {
                  matchesLang = !hasBengaliLetters;
                }

                return matchesSearch && matchesCat && matchesLang;
              });

              if (filteredVideos.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    {videoLanguageFilter === 'english_check' ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="font-bold text-slate-700">চমৎকার! কোনো ইংরেজি ভিডিও পাওয়া যায়নি।</p>
                        <p className="text-[11px] text-slate-400">শেখাঘরের সকল ভিডিও সফলভাবে খাঁটি বাংলায় রূপান্তর করা হয়েছে।</p>
                      </div>
                    ) : (
                      'কোনো ভিডিও পাওয়া যায়নি।'
                    )}
                  </div>
                );
              }

              return (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5">ভিডিও ও শিরোনাম</th>
                      <th className="p-3.5">চ্যানেল / শিক্ষক</th>
                      <th className="p-3.5">ক্যাটাগরি</th>
                      <th className="p-3.5">টার্গেট অডিয়েন্স</th>
                      <th className="p-3.5">সময়কাল</th>
                      <th className="p-3.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVideos.map((vid) => {
                      const isBengali = /[\u0980-\u09FF]/.test(vid.title);
                      return (
                        <tr key={vid.youtubeId} className="hover:bg-slate-50/60">
                          <td className="p-3.5 flex items-center gap-2.5 max-w-md">
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              className="w-16 aspect-video rounded-md object-cover bg-black shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 line-clamp-1 block">
                                {vid.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">ID: {vid.youtubeId}</span>
                                {!isBengali && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    ইংরেজি — সম্পাদনা প্রয়োজন
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-600">{vid.channelName || 'শেখাঘর'}</td>
                          <td className="p-3.5 font-semibold text-emerald-800">
                            {vid.categorySlug}
                            {vid.subCategorySlug && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                ↳ {vid.subCategorySlug}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                              {vid.audience === 'children'
                                ? 'শিশুদের জন্য'
                                : vid.audience === 'adults'
                                ? 'প্রাপ্তবয়স্কদের জন্য'
                                : 'সবার জন্য'}
                            </span>
                          </td>
                          <td className="p-3.5">{vid.duration}</td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditVideo(vid)}
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                              title="সম্পাদনা করুন (Edit / Convert to Bangla)"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/video/${vid.youtubeId}`)}
                              className="p-1 text-slate-500 hover:text-[#16803C] cursor-pointer"
                              title="দেখুন"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(vid._id || vid.id)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 4: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">সকল কোর্সের তালিকা</h3>
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="px-4 py-2 bg-[#16803C] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-[#105C2B]"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন কোর্স তৈরি করুন
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">কোর্সের নাম</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">প্রশিক্ষক</th>
                  <th className="p-4">পাঠ সংখ্যা</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.slug} className="hover:bg-slate-50/60">
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{course.title}</td>
                    <td className="p-4 text-slate-600">{course.categorySlug}</td>
                    <td className="p-4 text-slate-600">{course.instructor}</td>
                    <td className="p-4">{course.totalLessons || 0} টি</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsCourseModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="p-1 text-slate-500 hover:text-[#16803C]"
                        title="দেখুন"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm">
            ভিডিও সমস্যা রিপোর্ট
          </div>
          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep._id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {rep.reason}
                    </span>
                    <p className="font-semibold text-slate-900 mt-1">{rep.lessonTitle || rep.courseTitle}</p>
                    <p className="text-slate-500">{rep.details}</p>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold">
                    {rep.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 text-xs">কোনো সমস্যা রিপোর্ট নেই।</div>
          )}
        </div>
      )}

      {/* Tab 6: OVERVIEW STATS */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">মোট ইউটিউব ভিডিও</span>
            <span className="text-2xl font-bold text-[#16803C]">{stats.totalVideos} টি</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">মোট ক্যাটাগরি ও সাবক্যাটাগরি</span>
            <span className="text-2xl font-bold text-slate-900">{stats.totalCategories} টি</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">মোট কোর্স</span>
            <span className="text-2xl font-bold text-slate-900">{stats.totalCourses} টি</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">নিবন্ধিত শিক্ষার্থী</span>
            <span className="text-2xl font-bold text-blue-600">{stats.totalUsers} জন</span>
          </div>
        </div>
      )}

      {/* MODAL 1: Create or Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategoryId ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি তৈরি করুন'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরির নাম (বাংলায়):</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="যেমন: বাংলা বর্ণমালা অথবা Frontend Development"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">স্লাগ (URL Slug):</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="bangla-alphabet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অভিভাবক ক্যাটাগরি (Parent):</label>
                  <select
                    value={catParent}
                    onChange={(e) => setCatParent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="">মূল ক্যাটাগরি (Root / No Parent)</option>
                    {rootCategories.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কার জন্য (Audience):</label>
                  <select
                    value={catAudience}
                    onChange={(e) => setCatAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="all">সবার জন্য</option>
                    <option value="children">শিশুদের জন্য</option>
                    <option value="adults">প্রাপ্তবয়স্ক শিক্ষার্থীদের জন্য</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রদর্শনের ক্রম (Order):</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরির বিবরণ:</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="এই ক্যাটাগরিতে কী কী বিষয় অন্তর্ভুক্ত তা লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SEO Title ও Description (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={catSeoTitle}
                  onChange={(e) => setCatSeoTitle(e.target.value)}
                  placeholder="SEO শিরোনাম"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-1"
                />
                <textarea
                  rows={2}
                  value={catSeoDesc}
                  onChange={(e) => setCatSeoDesc(e.target.value)}
                  placeholder="SEO বিবরণ"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingCategoryId ? 'আপডেট সংরক্ষণ করুন' : 'ক্যাটাগরি তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Safety Modal with Content Migration Option */}
      {deleteSafetyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">ক্যাটাগরি মুছতে সতর্কতা</h3>
                <span className="text-xs text-red-600 font-semibold">{deleteSafetyModal.catName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              এই ক্যাটাগরিতে বর্তমানে <strong>{deleteSafetyModal.attachedVideos} টি ভিডিও</strong> এবং{' '}
              <strong>{deleteSafetyModal.attachedCourses} টি কোর্স</strong> যুক্ত রয়েছে। মুছে ফেলার আগে কনটেন্টগুলো অন্য ক্যাটাগরিতে স্থানান্তর করা নিরাপদ।
            </p>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">
                কনটেন্টগুলো কোন ক্যাটাগরিতে স্থানান্তর করবেন:
              </label>
              <select
                value={deleteSafetyModal.reassignTarget}
                onChange={(e) =>
                  setDeleteSafetyModal({ ...deleteSafetyModal, reassignTarget: e.target.value })
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {categories
                  .filter((c) => c._id !== deleteSafetyModal.catId)
                  .map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteSafetyModal({ ...deleteSafetyModal, isOpen: false })}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={() => handleExecuteReassignAndDelete(false)}
                className="px-4 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                স্থানান্তর করে মুছুন
              </button>

              <button
                type="button"
                onClick={() => handleExecuteReassignAndDelete(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                ফোর্স ডিলিট
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Editor Modal */}
      {isCourseModalOpen && (
        <CourseEditorModal
          course={editingCourse}
          categories={categories}
          onClose={() => setIsCourseModalOpen(false)}
          onSave={handleSaveCourse}
        />
      )}

      {/* Video Editor Modal */}
      {isVideoModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-[#16803C] rounded-lg">
                  <Edit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ভিডিও সম্পাদনা ও খাঁটি বাংলায় রূপান্তর</h3>
                  <p className="text-xs text-slate-500">ইউটিউব আইডি: {editingVideo.youtubeId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setEditingVideo(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ভিডিওর বাংলা শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={videoEditTitle}
                  onChange={(e) => setVideoEditTitle(e.target.value)}
                  placeholder="যেমন: HTML5 ও CSS3 দিয়ে সম্পূর্ণ ওয়েবসাইট তৈরি — বাংলা টিউটোরিয়াল"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইউটিউব লিঙ্ক বা ভিডিও আইডি *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoEditYoutubeUrl}
                    onChange={(e) => setVideoEditYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    চ্যানেল বা প্রশিক্ষকের নাম
                  </label>
                  <input
                    type="text"
                    value={videoEditChannel}
                    onChange={(e) => setVideoEditChannel(e.target.value)}
                    placeholder="যেমন: Learn with Sumit / সিসিমপুর"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মূল ক্যাটাগরি *
                  </label>
                  <select
                    value={videoEditCategory}
                    onChange={(e) => setVideoEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.parentSlug ? `↳ ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সাব-ক্যাটাগরি (Optional)
                  </label>
                  <select
                    value={videoEditSubCategory}
                    onChange={(e) => setVideoEditSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="">কোনোটি নয়</option>
                    {categories
                      .filter((c) => c.parentSlug === videoEditCategory || (c.parentSlug && c.slug !== videoEditCategory))
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    টার্গেট অডিয়েন্স
                  </label>
                  <select
                    value={videoEditAudience}
                    onChange={(e) => setVideoEditAudience(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="all">সবার জন্য (All)</option>
                    <option value="children">শিশুদের জন্য (Kids)</option>
                    <option value="adults">প্রাপ্তবয়স্কদের জন্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    কঠিনতার স্তর
                  </label>
                  <select
                    value={videoEditDifficulty}
                    onChange={(e) => setVideoEditDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="all">সাধারণ (General)</option>
                    <option value="beginner">বিগিনার (Beginner)</option>
                    <option value="intermediate">ইন্টারমিডিয়েট (Intermediate)</option>
                    <option value="advanced">অ্যাডভান্সড (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সময়কাল
                  </label>
                  <input
                    type="text"
                    value={videoEditDuration}
                    onChange={(e) => setVideoEditDuration(e.target.value)}
                    placeholder="যেমন: ১৫ মিনিট / ১ ঘণ্টা"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ভিডিওর বাংলা বিবরণ বা সারসংক্ষেপ
                </label>
                <textarea
                  rows={3}
                  value={videoEditDesc}
                  onChange={(e) => setVideoEditDesc(e.target.value)}
                  placeholder="ভিডিও সম্পর্কে খাঁটি বাংলায় বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={videoSaving}
                  className="px-5 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {videoSaving ? 'সংরক্ষণ হচ্ছে...' : 'ভিডিও আপডেট ও সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
