import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Upload, X, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

interface UploadReelPageProps {
  navigate: (path: string) => void;
}

export const UploadReelPage: React.FC<UploadReelPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <p>লগইন প্রয়োজন!</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-[#16803C] text-white rounded">লগইন</button>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('দয়া করে টাইটেল দিন।');
      return;
    }
    if (!videoFile && !youtubeUrl.trim()) {
      setError('দয়া করে লোকাল ভিডিও অথবা ইউটিউব লিংক দিন।');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (videoFile) formData.append('video', videoFile);
    if (youtubeUrl) formData.append('youtubeUrl', youtubeUrl.trim());

    try {
      const token = localStorage.getItem('shekhaghor_token');
      const res = await fetch('/api/videos/upload-reel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'আপলোড ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-[#16803C] mx-auto" />
        <h2 className="text-2xl font-bold">আপলোড সফল!</h2>
        <p className="text-slate-600">
          আপনার রিলস ভিডিওটি সফলভাবে আপলোড হয়েছে। অ্যাডমিন অ্যাপ্রুভ করার পর এটি সবার জন্য দৃশ্যমান হবে।
        </p>
        <button onClick={() => navigate('/reels')} className="px-6 py-2.5 bg-[#16803C] text-white rounded-lg font-bold">
          রিলস পেজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <button onClick={() => navigate('/reels')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-semibold">
        <ArrowLeft className="w-5 h-5" /> ফিরে যান
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">নতুন শিক্ষামূলক রিলস আপলোড করুন</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ভিডিওর টাইটেল <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              placeholder="যেমন: ১ মিনিটে স্পোকেন ইংলিশ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">বিস্তারিত বিবরণ (অপশনাল)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] min-h-[100px]"
              placeholder="ভিডিও সম্পর্কে কিছু লিখুন..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ভিডিও আপলোডের মাধ্যম <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="uploadMethod" checked={!youtubeUrl} onChange={() => setYoutubeUrl('')} className="w-4 h-4 text-[#16803C]" />
                <span className="text-sm font-medium">লোকাল ভিডিও ফাইল</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="uploadMethod" checked={!!youtubeUrl} onChange={() => { setVideoFile(null); setYoutubeUrl('https://'); }} className="w-4 h-4 text-[#16803C]" />
                <span className="text-sm font-medium">ইউটিউব লিংক</span>
              </label>
            </div>

            {youtubeUrl !== '' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ইউটিউব ভিডিও লিংক</label>
                <input
                  type="url"
                  value={youtubeUrl === 'https://' ? '' : youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {videoFile ? (
                    <div className="flex flex-col items-center text-[#16803C]">
                      <CheckCircle className="w-10 h-10 mb-2" />
                      <p className="font-semibold text-sm">{videoFile.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <Upload className="w-10 h-10 mb-2 opacity-50" />
                      <p className="font-semibold text-sm">ক্লিক করুন অথবা ড্র্যাগ করে ফাইল আনুন</p>
                      <p className="text-xs mt-1">.mp4, .webm (Max 20MB)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#16803C] hover:bg-[#105C2B] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {loading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};
