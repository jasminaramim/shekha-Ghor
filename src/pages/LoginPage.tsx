import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from '../components/Logo.js';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('ইউজারনেম/ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(identifier, password);
      if (res.success) {
        // Check if admin
        if (identifier.trim().toLowerCase() === 'jasmin' || identifier.trim().toLowerCase() === 'jasmin@shekhaghor.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।');
      }
    } catch (err: any) {
      setError('লগইন করতে সমস্যা হচ্ছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="md" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">অ্যাকাউন্টে প্রবেশ করুন</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            শেখার অগ্রগতি ও বুকমার্ক সংরক্ষণ করতে লগইন করুন
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ইউজারনেম অথবা ইমেইল:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="যেমন: jasmin বা student@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] text-slate-800"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              পাসওয়ার্ড:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C] text-slate-800"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#16803C] hover:bg-[#105C2B] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          নতুন শিক্ষার্থী?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#16803C] font-semibold hover:underline cursor-pointer"
          >
            বিনামূল্যে নিবন্ধন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
