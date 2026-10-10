import React, { useState, useEffect } from 'react';
import { IVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { ArrowLeft, Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface ReelsPageProps {
  navigate: (path: string) => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [reels, setReels] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await api.videos.getAll({ limit: 50 });
        if (res.success && res.videos) {
          const reelsVideos = res.videos.filter((v: IVideo) => v.categorySlug === 'reels');
          setReels(reelsVideos);
        }
      } catch (err) {
        console.error('Failed to load reels', err);
      } finally {
        setLoading(false);
      }
    }
    loadReels();
  }, []);

  const displayedReels = user ? reels : reels.slice(0, 2);

  return (
    <div className="bg-black min-h-screen text-white relative">
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">শেখাঘর রিলস</h1>
        <button 
          onClick={() => navigate('/upload-reel')}
          className="px-3 py-1.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-full shadow-lg transition"
        >
          আপলোড করুন
        </button>
      </div>

      <div className="h-[100dvh] w-full md:max-w-md mx-auto snap-y snap-mandatory overflow-y-scroll overflow-x-hidden no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">লোড হচ্ছে...</div>
        ) : reels.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-4">
            <Play className="w-16 h-16 opacity-50" />
            <p>এখনও কোনো রিলস যোগ করা হয়নি। অ্যাডমিন "reels" ক্যাটাগরিতে ভিডিও যোগ করলে এখানে দেখাবে।</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#16803C] text-white rounded-full font-bold">ফিরে যান</button>
          </div>
        ) : (
          <>
            {displayedReels.map((reel) => (
              <div key={reel._id || reel.youtubeId} className="h-[100dvh] w-full snap-start relative bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
              {reel.youtubeId.startsWith('cloud-') ? (
                <video
                  src={reel.youtubeUrl}
                  className="w-full h-full object-cover pointer-events-auto"
                  controls={false}
                  autoPlay
                  loop
                  playsInline
                  muted
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${reel.youtubeId}?autoplay=0&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
                  title={reel.title}
                  className="w-full aspect-[9/16] pointer-events-auto max-h-[100dvh]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              <div className="absolute bottom-6 left-4 right-16 z-20 pointer-events-none">
                <h3 className="font-bold text-lg drop-shadow-md text-white">{reel.title}</h3>
                <p className="text-sm text-white/90 drop-shadow-md line-clamp-2 mt-2">{reel.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-xs uppercase text-white shadow-lg">
                    {reel.channelName.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold drop-shadow-md text-white">@{reel.channelName}</p>
                </div>
              </div>
              <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-5 items-center">
                <button className="flex flex-col items-center gap-1 hover:scale-110 transition cursor-pointer">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md text-white">{reel.viewsCount > 1000 ? (reel.viewsCount / 1000).toFixed(1) + 'k' : reel.viewsCount || 0}</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:scale-110 transition cursor-pointer">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md text-white">কমেন্ট</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:scale-110 transition cursor-pointer">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md text-white">শেয়ার</span>
                </button>
              </div>
            </div>
          ))}
          {!user && reels.length > 2 && (
            <div className="h-[100dvh] w-full snap-start relative bg-zinc-950 flex flex-col items-center justify-center text-white px-4 text-center">
              <div className="w-20 h-20 bg-emerald-900/40 rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-emerald-500 ml-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">লগইন প্রয়োজন</h2>
              <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xs">
                আরো রিলস ভিডিও উপভোগ করতে আপনার অ্যাকাউন্টে লগইন করুন।
              </p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#16803C] hover:bg-[#105C2B] text-white rounded-full font-bold shadow-lg transition-colors cursor-pointer">
                  লগইন করুন
                </button>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold shadow-lg transition-colors cursor-pointer">
                  হোমপেজ
                </button>
              </div>
            </div>
          )}
        </>
        )}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
