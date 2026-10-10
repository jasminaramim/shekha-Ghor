import React, { useState } from 'react';
import { Logo } from '../components/Logo.js';
import { Mail, Phone, MapPin, Send, CheckCircle2, Shield, BookOpen, Heart, Smartphone, CreditCard, Banknote, Target, Award, PlayCircle } from 'lucide-react';

interface StaticPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<StaticPageProps> = ({ navigate }) => {
  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F0F7ED] via-[#F7FAF5] to-[#FEFDF2] pt-16 pb-20 border-b border-emerald-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-block mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-[#105C2B] block">শেখার নতুন ঠিকানা,</span>
            <span className="block mt-2">
              <span className="text-[#105C2B]">আপনার </span>
              <span className="text-[#FACC15]">শেখাঘর</span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed">
            প্রযুক্তি, শিক্ষা, দক্ষতা ও ক্যারিয়ারের জন্য প্রয়োজনীয় ভিডিও খুঁজুন এক জায়গায়। শিখুন নিজের গতিতে, এগিয়ে যান আত্মবিশ্বাসে।
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-8 sm:p-12 border border-slate-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-[#16803C] font-bold text-sm">
                <Target className="w-5 h-5" />
                আমাদের লক্ষ্য
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                মানসম্মত শিক্ষা সবার জন্য
              </h2>
              <p className="text-slate-600 leading-relaxed">
                শেখাঘর হলো একটি সম্পূর্ণ বাংলাভিত্তিক উন্মুক্ত অনলাইন শিক্ষামূলক ভিডিও ও কোর্স প্ল্যাটফর্ম।
                আমাদের লক্ষ্য বাংলাদেশের প্রতিটি কোণে বাংলাভাষী শিক্ষার্থীদের জন্য মানসম্মত, আধুনিক ও ক্যারিয়ার উপযোগী শিক্ষা বিনামূল্যে পৌঁছে দেওয়া।
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  { icon: PlayCircle, text: 'বিক্ষিপ্ত ভিডিও নয়, সুসংগঠিত কারিকুলাম' },
                  { icon: Award, text: 'দক্ষতা অর্জনে সেরা সব টিউটোরিয়াল' },
                  { icon: BookOpen, text: 'নিজস্ব নোট সংরক্ষণ ও অগ্রগতি ট্র্যাকিং' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-100 p-1.5 rounded-lg text-[#16803C]">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-emerald-100 to-amber-100 absolute -inset-4 blur-2xl opacity-50" />
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Students Learning" 
                className="relative rounded-2xl shadow-lg border-4 border-white object-cover aspect-[4/3] w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const ContactPage: React.FC<StaticPageProps> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">যোগাযোগ ও সহায়তা</h1>
        <p className="text-sm text-slate-600">
          যেকোনো প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য আমাদের মেসেজ পাঠান
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-emerald-900 text-white p-6 sm:p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-bold">যোগাযোগের ঠিকানা</h3>
          <div className="space-y-4 text-xs sm:text-sm text-emerald-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <span>ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <span>support@shekhaghor.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <span>+৮৮০ ১৭০০-০০০০০০</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#16803C] mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">ধন্যবাদ! মেসেজ পাঠানো হয়েছে।</h3>
              <p className="text-xs text-slate-500">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ইমেইল:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মেসেজ:</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803C]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                মেসেজ পাঠান
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">গোপনীয়তা নীতি (Privacy Policy)</h1>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          শেখাঘর আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। এই নীতিমালায় ব্যাখ্যা করা হয়েছে আমরা কীভাবে তথ্য সংগ্রহ ও ব্যবহার করি।
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">১. তথ্য সংগ্রহ ও ব্যবহার</h3>
        <p>
          ব্যবহারকারীর অ্যাকাউন্ট তৈরি, অগ্রগতির হিসাব রাখা এবং ব্যক্তিগত নোট সংরক্ষণের উদ্দেশ্যে নাম ও ইমেইল সংরক্ষণ করা হয়। পাসওয়ার্ড এনক্রিপ্টেড (bcrypt) অবস্থায় সুরক্ষিত থাকে।
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">২. থার্ড পার্টি সেবা</h3>
        <p>
          ভিডিও প্লেয়ারের জন্য অনুমোদিত ইউটিউব এম্বেড সার্ভিস ব্যবহার করা হয়, যা ইউটিউবের নিজস্ব ব্যবহার নীতি অনুযায়ী পরিচালিত।
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ব্যবহারের শর্তাবলী (Terms of Service)</h1>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          শেখাঘর প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত নিয়মাবলী মেনে নিতে সম্মত হচ্ছেন।
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">১. শিক্ষামূলক উদ্দেশ্যে ব্যবহার</h3>
        <p>
          এই ওয়েবসাইটের সকল কনটেন্ট শুধুমাত্র ব্যক্তিগত ও উন্মুক্ত শিক্ষার উদ্দেশ্যে প্রদান করা হয়।
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">২. কনটেন্টের কপিরাইট ও উৎস</h3>
        <p>
          ভিডিও টিউটোরিয়ালগুলোর স্বত্ব সংশ্লিষ্ট ইউটিউব চ্যানেল ও নির্মাতাদের সংরক্ষিত। কোনো কনটেন্টে আপত্তি থাকলে সরাসরি রিপোর্ট অপশনের মাধ্যমে অবগত করা যাবে।
        </p>
      </div>
    </div>
  );
};

export const DonatePage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-[#16803C] mb-2">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          আমাদের সমর্থন করুন
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          শেখাঘরের মাধ্যমে হাজারো শিক্ষার্থী বিনামূল্যে শিখছে। এই মহৎ উদ্যোগকে এগিয়ে নিতে আপনার সামান্য অনুদানও অনেক মূল্যবান।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* bKash */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-4 group">
          <div className="w-16 h-16 mx-auto bg-pink-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Smartphone className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">বিকাশ (bKash)</h3>
            <p className="text-sm text-slate-500 mt-1">পার্সোনাল নম্বর</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xl font-bold text-[#16803C] tracking-wider">01700-000000</p>
          </div>
        </div>

        {/* Nagad */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-4 group">
          <div className="w-16 h-16 mx-auto bg-orange-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Smartphone className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">নগদ (Nagad)</h3>
            <p className="text-sm text-slate-500 mt-1">পার্সোনাল নম্বর</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xl font-bold text-[#16803C] tracking-wider">01700-000000</p>
          </div>
        </div>

        {/* Rocket */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-4 group">
          <div className="w-16 h-16 mx-auto bg-purple-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Smartphone className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">রকেট (Rocket)</h3>
            <p className="text-sm text-slate-500 mt-1">পার্সোনাল নম্বর</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xl font-bold text-[#16803C] tracking-wider">01700-000000</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 sm:p-8 rounded-2xl border border-emerald-100 text-center space-y-4 max-w-2xl mx-auto">
        <Banknote className="w-10 h-10 text-[#16803C] mx-auto opacity-80" />
        <h3 className="text-lg font-bold text-slate-900">ব্যাংক ট্রান্সফার</h3>
        <p className="text-sm text-slate-700">
          অ্যাকাউন্ট নাম: Shekhaghor<br />
          অ্যাকাউন্ট নম্বর: 1234567890<br />
          ব্রাঞ্চ: ধানমন্ডি শাখা, ঢাকা
        </p>
      </div>
    </div>
  );
};
