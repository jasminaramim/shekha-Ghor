import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Video, ArrowUp, ArrowDown } from 'lucide-react';
import { ICourse, ICategory } from '../../types/index.js';
import { api } from '../../services/api.js';

interface CourseEditorModalProps {
  course?: ICourse | null;
  categories: ICategory[];
  onClose: () => void;
  onSave: (course: any) => Promise<void>;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  course,
  categories,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    categorySlug: '',
    subCategorySlug: '',
    instructor: '',
    instructorBio: '',
    audienceType: 'all',
    level: 'all',
    duration: '',
    thumbnail: '',
    featured: false,
    isPublished: true,
    modules: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        modules: course.modules ? JSON.parse(JSON.stringify(course.modules)) : [],
      });
    }
  }, [course]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addModule = () => {
    setFormData((prev: any) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { title: 'নতুন মডিউল', order: prev.modules.length + 1, lessons: [] },
      ],
    }));
  };

  const updateModuleTitle = (modIndex: number, title: string) => {
    const newMods = [...formData.modules];
    newMods[modIndex].title = title;
    handleInputChange('modules', newMods);
  };

  const removeModule = (modIndex: number) => {
    const newMods = formData.modules.filter((_: any, i: number) => i !== modIndex);
    handleInputChange('modules', newMods);
  };

  const addLesson = (modIndex: number) => {
    const newMods = [...formData.modules];
    newMods[modIndex].lessons.push({
      title: 'নতুন ভিডিও পাঠ',
      slug: `lesson-${Date.now()}`,
      youtubeId: '',
      videoUrl: '',
      duration: '১০ মিনিট',
      description: '',
      isFreePreview: true,
      order: newMods[modIndex].lessons.length + 1,
    });
    handleInputChange('modules', newMods);
  };

  const updateLesson = (modIndex: number, lessonIndex: number, field: string, value: any) => {
    const newMods = [...formData.modules];
    newMods[modIndex].lessons[lessonIndex][field] = value;
    handleInputChange('modules', newMods);
  };

  const removeLesson = (modIndex: number, lessonIndex: number) => {
    const newMods = [...formData.modules];
    newMods[modIndex].lessons.splice(lessonIndex, 1);
    handleInputChange('modules', newMods);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.modules.length - 1) return;
    
    const newMods = [...formData.modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newMods[index], newMods[targetIndex]] = [newMods[targetIndex], newMods[index]];
    
    // Update order
    newMods.forEach((m, i) => m.order = i + 1);
    handleInputChange('modules', newMods);
  };

  const moveLesson = (modIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    const lessons = formData.modules[modIndex].lessons;
    if (direction === 'up' && lessonIndex === 0) return;
    if (direction === 'down' && lessonIndex === lessons.length - 1) return;

    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    [lessons[lessonIndex], lessons[targetIndex]] = [lessons[targetIndex], lessons[lessonIndex]];
    
    lessons.forEach((l: any, i: number) => l.order = i + 1);
    handleInputChange('modules', [...formData.modules]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
      alert('কোর্স সেভ করতে সমস্যা হয়েছে!');
    }
    setLoading(false);
  };

  const rootCategories = categories.filter((c) => !c.parentSlug);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {course ? 'কোর্স সম্পাদনা করুন' : 'নতুন কোর্স তৈরি করুন'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">প্রাথমিক তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">কোর্সের নাম *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">স্লাগ (URL) *</label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">বর্ণনা *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    required
                    value={formData.categorySlug}
                    onChange={(e) => handleInputChange('categorySlug', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {rootCategories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">থাম্বনেইল (URL)</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">প্রশিক্ষক</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">কোর্সের সময়কাল</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="যেমন: ১৫ ঘণ্টা"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#16803C]"
                  />
                </div>
              </div>
            </div>

            {/* Modules and Videos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">মডিউল ও ভিডিও পাঠ</h3>
                <button
                  type="button"
                  onClick={addModule}
                  className="px-3 py-1.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-sm font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> মডিউল যোগ করুন
                </button>
              </div>

              {formData.modules.map((mod: any, mIndex: number) => (
                <div key={mIndex} className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-emerald-50 p-3 flex items-center justify-between border-b border-emerald-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => moveModule(mIndex, 'up')} className="text-emerald-600 hover:bg-emerald-200 rounded"><ArrowUp className="w-3 h-3" /></button>
                        <button type="button" onClick={() => moveModule(mIndex, 'down')} className="text-emerald-600 hover:bg-emerald-200 rounded"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                        className="font-bold text-emerald-900 bg-white border border-emerald-200 px-2 py-1 rounded w-full max-w-sm focus:outline-none"
                        placeholder="মডিউলের নাম"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addLesson(mIndex)}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> ভিডিও যোগ করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(mIndex)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="মডিউল মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 space-y-3 bg-slate-50/50">
                    {mod.lessons.map((lesson: any, lIndex: number) => (
                      <div key={lIndex} className="bg-white border border-slate-200 p-3 rounded-lg flex gap-3 relative group">
                        <div className="flex flex-col gap-1 mt-1 shrink-0">
                          <button type="button" onClick={() => moveLesson(mIndex, lIndex, 'up')} className="text-slate-400 hover:bg-slate-100 rounded"><ArrowUp className="w-3 h-3" /></button>
                          <button type="button" onClick={() => moveLesson(mIndex, lIndex, 'down')} className="text-slate-400 hover:bg-slate-100 rounded"><ArrowDown className="w-3 h-3" /></button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">ভিডিওর নাম</label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">স্লাগ</label>
                            <input
                              type="text"
                              value={lesson.slug}
                              onChange={(e) => updateLesson(mIndex, lIndex, 'slug', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">যেকোনো ভিডিও লিঙ্ক (Video URL/MP4)</label>
                            <input
                              type="text"
                              value={lesson.videoUrl || ''}
                              onChange={(e) => {
                                updateLesson(mIndex, lIndex, 'videoUrl', e.target.value);
                                // If they add URL, clear youtubeId to avoid conflict
                                if(e.target.value) updateLesson(mIndex, lIndex, 'youtubeId', '');
                              }}
                              placeholder="https://example.com/video.mp4"
                              className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-emerald-500 bg-blue-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">অথবা ইউটিউব ভিডিও আইডি (YouTube ID)</label>
                            <input
                              type="text"
                              value={lesson.youtubeId || ''}
                              onChange={(e) => {
                                updateLesson(mIndex, lIndex, 'youtubeId', e.target.value);
                                // If they add YouTube, clear videoUrl
                                if(e.target.value) updateLesson(mIndex, lIndex, 'videoUrl', '');
                              }}
                              placeholder="e.g. dQw4w9WgXcQ"
                              className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-emerald-500 bg-red-50"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center justify-between mt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={lesson.isFreePreview}
                                onChange={(e) => updateLesson(mIndex, lIndex, 'isFreePreview', e.target.checked)}
                                className="text-emerald-600 rounded"
                              />
                              <span className="text-xs font-semibold text-slate-700">ফ্রি প্রিভিউ (সবার জন্য উন্মুক্ত)</span>
                            </label>
                            
                            <button
                              type="button"
                              onClick={() => removeLesson(mIndex, lIndex)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> মুছুন
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {mod.lessons.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-2">কোনো ভিডিও যোগ করা হয়নি।</p>
                    )}
                  </div>
                </div>
              ))}
              
              {formData.modules.length === 0 && (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">কোনো মডিউল নেই। নতুন মডিউল যোগ করুন।</p>
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            বাতিল
          </button>
          <button
            type="submit"
            form="course-form"
            disabled={loading}
            className="px-6 py-2 bg-[#16803C] hover:bg-[#105C2B] text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
