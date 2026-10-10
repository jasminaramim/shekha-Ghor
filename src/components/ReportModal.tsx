import React, { useState } from 'react';
import { api } from '../services/api.js';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  courseSlug,
  courseTitle,
  lessonId,
  lessonTitle,
}) => {
  const [reason, setReason] = useState('ভিডিও চালু হচ্ছে না');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.reports.submit({
        courseSlug,
        courseTitle,
        lessonId,
        lessonTitle,
        reason,
        details,
        userEmail: email,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      } else {
        setError(res.message || 'রিপোর্ট পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setError(err?.message || 'ত্রুটি দেখা দিয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">ভিডিও সমস্যা রিপোর্ট করুন</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{lessonTitle || courseTitle}</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#16803C] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">ধন্যবাদ! রিপোর্ট সফলভাবে পাঠানো হয়েছে।</h4>
            <p className="text-xs text-slate-600">আমাদের টিম দ্রুত যাচাই করে যথাযথ ব্যবস্থা নেবে।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                সমস্যার ধরন নির্বাচন করুন:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              >
                <option value="ভিডিও চালু হচ্ছে না">ভিডিও চালু হচ্ছে না বা লোড হচ্ছে না</option>
                <option value="অডিও শোনা যাচ্ছে না">শব্দ বা অডিওতে সমস্যা</option>
                <option value="কপিরাইট বা উৎস সমস্যা">অনুমোদনহীন কনটেন্ট বা কপিরাইট দাবি</option>
                <option value="ভুল তথ্য বা বিভ্রান্তিকর">ভুল তথ্য অথবা অনুপযুক্ত কনটেন্ট</option>
                <option value="অন্যান্য সমস্যা">অন্যান্য সমস্যা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                বিস্তারিত বিবরণ (ঐচ্ছিক):
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="সমস্যাটি কোন মিনিটে বা কীভাবে হচ্ছে লিখুন..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                আপনার ইমেইল (আপডেট পেতে ঐচ্ছিক):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'পাঠানো হচ্ছে...' : 'রিপোর্ট জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
