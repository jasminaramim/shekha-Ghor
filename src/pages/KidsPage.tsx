import React, { useState, useEffect } from 'react';
import { ICourse, IVideo } from '../types/index.js';
import { api } from '../services/api.js';
import { CourseCard } from '../components/CourseCard.js';
import { VideoCard } from '../components/VideoCard.js';
import { Baby, Star, Heart, Smile } from 'lucide-react';

interface KidsPageProps {
  navigate: (path: string) => void;
}

export const KidsPage: React.FC<KidsPageProps> = ({ navigate }) => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKidsContent() {
      setLoading(true);
      try {
        const [coursesRes, videosRes] = await Promise.all([
          api.courses.getAll({ category: 'children-education', limit: 50 }),
          api.videos.getAll({ category: 'children-education', limit: 100 }),
        ]);

        if (coursesRes.success && coursesRes.courses) {
          setCourses(coursesRes.courses);
        }
        if (videosRes.success && videosRes.videos) {
          setVideos(videosRes.videos);
        }
      } catch (error) {
        console.error('Error fetching kids content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchKidsContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-black shadow-sm">
            <Baby className="w-6 h-6" />
            <span className="tracking-wide">কিডস কর্নার</span>
            <Smile className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-amber-600 drop-shadow-sm tracking-tight">
            ছোট্টমণিদের আনন্দের পাঠশালা
          </h1>
          <p className="text-sm sm:text-lg text-emerald-800 font-medium max-w-2xl mx-auto">
            এখানে রয়েছে মজার সব ছড়া, গল্প, কার্টুন আর খেলার ছলে শেখার ভিডিও। চলো একসাথে শিখি!
          </p>
        </div>

        {/* Hero Video */}
        <div className="w-full max-w-5xl mx-auto flex justify-center">
          <video
            src="/kidsvideo.mp4"
            autoPlay
            controls
            muted
            loop
            className="w-full rounded-[2rem] shadow-2xl border-8 border-white backdrop-blur-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {courses.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">মজার কোর্স ও প্লেলিস্ট</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      onSelect={(slug) => navigate(`/courses/${slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">শিক্ষণীয় ভিডিও</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.youtubeId}
                      video={video}
                      onSelect={(id) => navigate(`/video/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
