import bcrypt from 'bcryptjs';
import { User, Category, Course, Video } from './models.js';

export const initialCategories = [
  // 1. শিশুদের শিক্ষা (Root)
  {
    name: 'শিশুদের শিক্ষা',
    slug: 'children-education',
    icon: 'Sparkles',
    description: 'বর্ণমালা, বাংলা, ইংরেজি, সংখ্যা, গণিত, ছড়া, গল্প, বিজ্ঞান ও সাধারণ জ্ঞান',
    parentCategory: null,
    parentSlug: null,
    audience: 'children',
    isPublished: true,
    order: 1,
  },
  {
    name: 'বাংলা বর্ণমালা',
    slug: 'bangla-alphabet',
    icon: 'BookOpen',
    description: 'স্বরবর্ণ ও ব্যঞ্জনবর্ণ আনন্দের সাথে সহজে শেখা',
    parentCategory: null,
    parentSlug: 'children-education',
    audience: 'children',
    isPublished: true,
    order: 101,
  },
  {
    name: 'ইংরেজি বর্ণমালা (ABC)',
    slug: 'english-alphabet',
    icon: 'Languages',
    description: 'ইংরেজি A-Z অক্ষর, উচ্চারণ ও শব্দ গঠন',
    parentCategory: null,
    parentSlug: 'children-education',
    audience: 'children',
    isPublished: true,
    order: 102,
  },
  {
    name: 'ছড়া ও গল্প',
    slug: 'rhymes-and-stories',
    icon: 'Smile',
    description: 'মজার মজার শিশুতোষ ছড়া, কার্টুন গান ও শিক্ষণীয় নীতিকথা',
    parentCategory: null,
    parentSlug: 'children-education',
    audience: 'children',
    isPublished: true,
    order: 103,
  },
  {
    name: 'শিশুদের গণিত ও সংখ্যা',
    slug: 'kids-math',
    icon: 'Calculator',
    description: 'সংখ্যা গণনা (১-১০০), সহজ যোগ-বিয়োগ ও জ্যামিতি',
    parentCategory: null,
    parentSlug: 'children-education',
    audience: 'children',
    isPublished: true,
    order: 104,
  },
  {
    name: 'শিশুদের সাধারণ জ্ঞান ও বিজ্ঞান',
    slug: 'kids-general-knowledge',
    icon: 'Atom',
    description: 'পশুপাখি, ফুল-ফল, আমাদের পরিবেশ ও সৌরজগতের মজার তথ্য',
    parentCategory: null,
    parentSlug: 'children-education',
    audience: 'children',
    isPublished: true,
    order: 105,
  },

  // 2. ওয়েব ডেভেলপমেন্ট (Root)
  {
    name: 'ওয়েব ডেভেলপমেন্ট',
    slug: 'web-development',
    icon: 'Code',
    description: 'HTML, CSS, JavaScript, React, Node.js, Express, MongoDB ও Full Stack',
    parentCategory: null,
    parentSlug: null,
    audience: 'adults',
    isPublished: true,
    order: 2,
  },
  {
    name: 'Frontend Development',
    slug: 'frontend-development',
    icon: 'Layout',
    description: 'HTML5, CSS3, Tailwind, JavaScript, React ও Next.js',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'all',
    isPublished: true,
    order: 201,
  },
  {
    name: 'HTML & CSS',
    slug: 'html-css',
    icon: 'Code',
    description: 'ওয়েবসাইটের স্ট্রাকচার ও আধুনিক রেসপনসিভ স্টাইলিং',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'all',
    isPublished: true,
    order: 202,
  },
  {
    name: 'JavaScript & TypeScript',
    slug: 'javascript',
    icon: 'Terminal',
    description: 'মডার্ন জাভাস্ক্রিপ্ট (ES6+), DOM ম্যানিপুলেশন ও টাইপসেফ কোডিং',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'all',
    isPublished: true,
    order: 203,
  },
  {
    name: 'React.js & Next.js',
    slug: 'react-next',
    icon: 'Cpu',
    description: 'কম্পোনেন্ট ভিত্তিক সিঙ্গেল পেজ অ্যাপ্লিকেশন ও সার্ভার রেন্ডারিং',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'all',
    isPublished: true,
    order: 204,
  },
  {
    name: 'Backend Development',
    slug: 'backend-development',
    icon: 'Database',
    description: 'Node.js, Express.js, MongoDB ও RESTful API তৈরি',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'adults',
    isPublished: true,
    order: 205,
  },
  {
    name: 'Full Stack Development',
    slug: 'fullstack-development',
    icon: 'Layers',
    description: 'ফ্রন্টএন্ড ও ব্যাকএন্ড সমন্বয়ে বাস্তবমুখী কমপ্লিট প্রজেক্ট',
    parentCategory: null,
    parentSlug: 'web-development',
    audience: 'adults',
    isPublished: true,
    order: 206,
  },

  // 3. অ্যাপ ডেভেলপমেন্ট (Root)
  {
    name: 'অ্যাপ ডেভেলপমেন্ট',
    slug: 'app-development',
    icon: 'Smartphone',
    description: 'Flutter, Dart, Android Development, iOS Development এবং React Native',
    parentCategory: null,
    parentSlug: null,
    audience: 'all',
    isPublished: true,
    order: 3,
  },
  {
    name: 'Flutter ও Dart',
    slug: 'flutter-dart',
    icon: 'Smartphone',
    description: 'এক কোডে অ্যান্ড্রয়েড ও আইওএস উভয় প্ল্যাটফর্মের জন্য মোবাইল অ্যাপ',
    parentCategory: null,
    parentSlug: 'app-development',
    audience: 'all',
    isPublished: true,
    order: 301,
  },

  // 4. ডিজাইন ও ক্রিয়েটিভ কাজ (Root)
  {
    name: 'ডিজাইন ও ক্রিয়েটিভ কাজ',
    slug: 'design-creative',
    icon: 'Palette',
    description: 'Graphic Design, UI/UX Design, Figma, Photoshop, Illustrator ও Video Editing',
    parentCategory: null,
    parentSlug: null,
    audience: 'all',
    isPublished: true,
    order: 4,
  },
  {
    name: 'গ্রাফিক ডিজাইন ও ইলাস্ট্রেশন',
    slug: 'graphic-design',
    icon: 'Palette',
    description: 'ফটোশপ, ইলাস্ট্রেটর, ব্যানার ও সোশ্যাল মিডিয়া পোস্ট ডিজাইন',
    parentCategory: null,
    parentSlug: 'design-creative',
    audience: 'all',
    isPublished: true,
    order: 401,
  },
  {
    name: 'UI/UX Design ও Figma',
    slug: 'ui-ux-design',
    icon: 'Layout',
    description: 'ওয়েব ও মোবাইল অ্যাপ্লিকেশনের আধুনিক ইন্টারফেস ও ওয়্যারফ্রেম তৈরি',
    parentCategory: null,
    parentSlug: 'design-creative',
    audience: 'all',
    isPublished: true,
    order: 402,
  },
  {
    name: 'ভিডিও এডিটিং',
    slug: 'video-editing',
    icon: 'Video',
    description: 'প্রিমিয়ার প্রো, ক্যাপকাট ও আফটার ইফেক্টস দিয়ে রিলস ও ভিডিও তৈরি',
    parentCategory: null,
    parentSlug: 'design-creative',
    audience: 'all',
    isPublished: true,
    order: 403,
  },

  // 5. প্রোগ্রামিং ও প্রযুক্তি (Root)
  {
    name: 'প্রোগ্রামিং ও প্রযুক্তি',
    slug: 'programming-tech',
    icon: 'Terminal',
    description: 'Python, C++, Java, অ্যালগরিদম, AI, Machine Learning ও Cyber Security',
    parentCategory: null,
    parentSlug: null,
    audience: 'all',
    isPublished: true,
    order: 5,
  },
  {
    name: 'পাইথন প্রোগ্রামিং',
    slug: 'python-programming',
    icon: 'Terminal',
    description: 'সহজ বাংলা ভাষায় পাইথন কোডিং, ডেটা স্ট্রাকচার ও প্রবলেম সলভিং',
    parentCategory: null,
    parentSlug: 'programming-tech',
    audience: 'all',
    isPublished: true,
    order: 501,
  },
  {
    name: 'কৃত্রিম বুদ্ধিমত্তা ও AI',
    slug: 'ai-machine-learning',
    icon: 'Cpu',
    description: 'ChatGPT, প্রম্পট ইঞ্জিনিয়ারিং, মিডজার্নি ও মেশিন লার্নিং',
    parentCategory: null,
    parentSlug: 'programming-tech',
    audience: 'all',
    isPublished: true,
    order: 502,
  },

  // 6. অন্যান্য দক্ষতা ও ক্যারিয়ার (Root)
  {
    name: 'অন্যান্য দক্ষতা ও ক্যারিয়ার',
    slug: 'other-skills',
    icon: 'Award',
    description: 'ফ্রিল্যান্সিং, ডিজিটাল মার্কেটিং, স্পোকেন ইংলিশ, চাকরির প্রস্তুতি ও ব্যবসা',
    parentCategory: null,
    parentSlug: null,
    audience: 'all',
    isPublished: true,
    order: 6,
  },
  {
    name: 'স্পোকেন ইংলিশ ও ভাষা শিক্ষা',
    slug: 'spoken-english',
    icon: 'Languages',
    description: 'সহজে ইংরেজিতে কথা বলার কৌশল ও প্রফেশনাল কমিউনিকেশন',
    parentCategory: null,
    parentSlug: 'other-skills',
    audience: 'all',
    isPublished: true,
    order: 601,
  },
  {
    name: 'ডিজিটাল মার্কেটিং ও ফ্রিল্যান্সিং',
    slug: 'digital-marketing',
    icon: 'TrendingUp',
    description: 'এসইও, মেটা অ্যাডস, ফাইবার ও আপওয়ার্কে কাজ পাওয়ার গাইডলাইন',
    parentCategory: null,
    parentSlug: 'other-skills',
    audience: 'adults',
    isPublished: true,
    order: 602,
  },
];

// Seed standalone videos across categories (especially Kids, Web Dev, Python, Design)
export const initialVideos = [
  // Kids
  {
    youtubeId: '94x4B6i7348',
    youtubeUrl: 'https://www.youtube.com/watch?v=94x4B6i7348',
    title: 'বাংলা বর্ণমালা গান — অ আ ক খ সহজে শেখা',
    description: 'ছোট্টমণিদের জন্য আকর্ষণীয় অ্যানিমেশন দিয়ে বাংলা স্বরবর্ণ ও ব্যঞ্জনবর্ণের সহজ পাঠ।',
    thumbnailUrl: 'https://img.youtube.com/vi/94x4B6i7348/hqdefault.jpg',
    channelName: 'সিসিমপুর ও শিশু শিক্ষা',
    categorySlug: 'children-education',
    subCategorySlug: 'bangla-alphabet',
    audience: 'children',
    difficultyLevel: 'beginner',
    duration: '১৫ মিনিট',
    isPublished: true,
    viewsCount: 3400,
    order: 1,
  },
  {
    youtubeId: 'QO_fK5Z7P_w',
    youtubeUrl: 'https://www.youtube.com/watch?v=QO_fK5Z7P_w',
    title: 'মজার বাংলা ছড়া গান — হাটটিমা টিম টিম ও খোকন খোকন ডাক পাড়ি',
    description: 'জনপ্রিয় সব বাংলা শিশুতোষ ছড়া সুন্দর রঙিন অ্যানিমেশনে সাজানো।',
    thumbnailUrl: 'https://img.youtube.com/vi/QO_fK5Z7P_w/hqdefault.jpg',
    channelName: 'ছোটদের আনন্দ ভুবন',
    categorySlug: 'children-education',
    subCategorySlug: 'rhymes-and-stories',
    audience: 'children',
    difficultyLevel: 'beginner',
    duration: '১৮ মিনিট',
    isPublished: true,
    viewsCount: 4200,
    order: 2,
  },
  {
    youtubeId: 'nI37p3b7q4I',
    youtubeUrl: 'https://www.youtube.com/watch?v=nI37p3b7q4I',
    title: 'শিশুদের গণিত: ১ থেকে ১০০ পর্যন্ত বাংলা সংখ্যা গণনা',
    description: 'ছবির মাধ্যমে ১ থেকে ১০০ পর্যন্ত সংখ্যা চেনা ও মুখে উচ্চারণ করে বলা।',
    thumbnailUrl: 'https://img.youtube.com/vi/nI37p3b7q4I/hqdefault.jpg',
    channelName: 'মজার গণিত পাঠশালা',
    categorySlug: 'children-education',
    subCategorySlug: 'kids-math',
    audience: 'children',
    difficultyLevel: 'beginner',
    duration: '১২ মিনিট',
    isPublished: true,
    viewsCount: 2100,
    order: 3,
  },

  // Web Dev
  {
    youtubeId: 'pQN-pnXPaVg',
    youtubeUrl: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
    title: 'HTML5 ও CSS3 দিয়ে সম্পূর্ণ ওয়েবসাইট তৈরি — বাংলা টিউটোরিয়াল',
    description: 'ওয়েব পেজ স্ট্রাকচার, আধুনিক ট্যাগ এবং রেসপনসিভ সিএসএস এর সম্পূর্ণ প্র্যাকটিক্যাল গাইড।',
    thumbnailUrl: 'https://img.youtube.com/vi/pQN-pnXPaVg/hqdefault.jpg',
    channelName: 'Learn with Sumit',
    categorySlug: 'web-development',
    subCategorySlug: 'html-css',
    audience: 'all',
    difficultyLevel: 'beginner',
    duration: '৪৫ মিনিট',
    isPublished: true,
    viewsCount: 5200,
    order: 4,
  },
  {
    youtubeId: '1Rs2ND1ryYc',
    youtubeUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    title: 'জাভাস্ক্রিপ্ট বেসিক থেকে অ্যাডভান্সড — সম্পূর্ণ বাংলা কোর্স',
    description: 'Variables, Functions, Loops, Arrays, DOM manipulation ও ES6+ এর মূল বিষয়সমূহ।',
    thumbnailUrl: 'https://img.youtube.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
    channelName: 'Learn with Sumit',
    categorySlug: 'web-development',
    subCategorySlug: 'javascript',
    audience: 'all',
    difficultyLevel: 'intermediate',
    duration: '১ ঘণ্টা ১০ মিনিট',
    isPublished: true,
    viewsCount: 8900,
    order: 5,
  },
  {
    youtubeId: '4UZrsTqkcW4',
    youtubeUrl: 'https://www.youtube.com/watch?v=4UZrsTqkcW4',
    title: 'React JS সম্পূর্ণ বাংলা ক্র্যাশ কোর্স — Components, Hooks & State',
    description: 'আধুনিক রিয়্যাক্ট ফ্রেমওয়ার্ক দিয়ে সিঙ্গেল পেজ অ্যাপ্লিকেশন বানানোর সহজ নিয়ম।',
    thumbnailUrl: 'https://img.youtube.com/vi/4UZrsTqkcW4/hqdefault.jpg',
    channelName: 'Stack Learner',
    categorySlug: 'web-development',
    subCategorySlug: 'react-next',
    audience: 'all',
    difficultyLevel: 'intermediate',
    duration: '১ ঘণ্টা ২৫ মিনিট',
    isPublished: true,
    viewsCount: 9400,
    order: 6,
  },
  {
    youtubeId: '0ZJgIjIuY7U',
    youtubeUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
    title: 'Node.js, Express & MongoDB দিয়ে প্রফেশনাল REST API তৈরি',
    description: 'ব্যাকএন্ড সার্ভার ডেভেলপমেন্ট, ডাটাবেস ক্রাড অপারেশন ও অথেনটিকেশন।',
    thumbnailUrl: 'https://img.youtube.com/vi/0ZJgIjIuY7U/hqdefault.jpg',
    channelName: 'Anisul Islam',
    categorySlug: 'web-development',
    subCategorySlug: 'backend-development',
    audience: 'adults',
    difficultyLevel: 'advanced',
    duration: '৫৫ মিনিট',
    isPublished: true,
    viewsCount: 6700,
    order: 7,
  },

  // Programming & AI
  {
    youtubeId: 'rfscVS0vtbw',
    youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    title: 'শূন্য থেকে পাইথন প্রোগ্রামিং — ১ম পর্ব (বাংলায়)',
    description: 'পাইথন ইনস্টলেশন, ভ্যারিয়েবল, ডেটা টাইপ এবং প্রবলেম সলভিংয়ের প্রথম ধাপ।',
    thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    channelName: 'তামিম শাহরিয়ার সুবিন',
    categorySlug: 'programming-tech',
    subCategorySlug: 'python-programming',
    audience: 'all',
    difficultyLevel: 'beginner',
    duration: '৩৫ মিনিট',
    isPublished: true,
    viewsCount: 7100,
    order: 8,
  },
  {
    youtubeId: 'JMUxmLyrhSk',
    youtubeUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    title: 'কৃত্রিম বুদ্ধিমত্তা ও প্রম্পট ইঞ্জিনিয়ারিং গাইড — ChatGPT এর সঠিক ব্যবহার',
    description: 'এআই ব্যবহার করে কীভাবে নিজের উৎপাদনশীলতা ১০ গুণ বাড়াবেন তার সেরা নিয়ম।',
    thumbnailUrl: 'https://img.youtube.com/vi/JMUxmLyrhSk/hqdefault.jpg',
    channelName: 'এআই একাডেমি বাংলা',
    categorySlug: 'programming-tech',
    subCategorySlug: 'ai-machine-learning',
    audience: 'all',
    difficultyLevel: 'all',
    duration: '৩০ মিনিট',
    isPublished: true,
    viewsCount: 4800,
    order: 9,
  },

  // Design & Creative
  {
    youtubeId: 'IyR_uYsRdPs',
    youtubeUrl: 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
    title: 'অ্যাডোবি ফটোশপ সম্পূর্ণ বাংলা টিউটোরিয়াল — বেসিক টুলস ও লেয়ার',
    description: 'ফটোশপের ইন্টারফেস, সিলেকশন, লেয়ার মাস্কিং ও সোশ্যাল মিডিয়া ব্যানার ডিজাইন।',
    thumbnailUrl: 'https://img.youtube.com/vi/IyR_uYsRdPs/hqdefault.jpg',
    channelName: 'জিএফএক্স মেন্টর বাংলা',
    categorySlug: 'design-creative',
    subCategorySlug: 'graphic-design',
    audience: 'all',
    difficultyLevel: 'beginner',
    duration: '৪৮ মিনিট',
    isPublished: true,
    viewsCount: 5600,
    order: 10,
  },

  // English & Career
  {
    youtubeId: 'f79k2kZpQ_E',
    youtubeUrl: 'https://www.youtube.com/watch?v=f79k2kZpQ_E',
    title: 'স্পোকেন ইংলিশ: প্রতিদিনের প্রয়োজনীয় ইংরেজি কথা ও কথোপকথন',
    description: 'সহজ বাংলা উচ্চারণে ইংরেজিতে অনর্গল কথা বলার আত্মবিশ্বাস গড়ে তুলুন।',
    thumbnailUrl: 'https://img.youtube.com/vi/f79k2kZpQ_E/hqdefault.jpg',
    channelName: 'মুনজেরিন শহীদ',
    categorySlug: 'other-skills',
    subCategorySlug: 'spoken-english',
    audience: 'all',
    difficultyLevel: 'beginner',
    duration: '২৫ মিনিট',
    isPublished: true,
    viewsCount: 11200,
    order: 11,
  },
];

export const initialCourses = [
  {
    title: 'ওয়েব ডেভেলপমেন্ট সম্পূর্ণ কোর্স (MERN Stack)',
    slug: 'web-development-mern-stack',
    description: 'HTML, CSS, JS থেকে শুরু করে React এবং Node.js দিয়ে ফুল-স্ট্যাক প্রজেক্ট তৈরি করুন।',
    categorySlug: 'web-development',
    subCategorySlug: 'fullstack-development',
    instructor: 'Learn with Sumit / Stack Learner (সংগৃহীত)',
    instructorBio: 'বাংলাদেশের জনপ্রিয় ওয়েব ডেভেলপমেন্ট শিক্ষকরা।',
    audienceType: 'all',
    level: 'beginner',
    duration: '২৫ ঘণ্টা',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51159128?auto=format&fit=crop&w=600&q=80',
    featured: true,
    isPublished: true,
    learningOutcomes: ['HTML ও CSS এর বেসিক ও অ্যাডভান্সড', 'জাভাস্ক্রিপ্ট এর খুঁটিনাটি', 'React দিয়ে ফ্রন্টএন্ড', 'Node ও MongoDB দিয়ে ব্যাকএন্ড'],
    audience: ['যারা ওয়েব ডেভেলপার হতে চান', 'বেসিক প্রোগ্রামিং জানা আছে'],
    requirements: ['একটি কম্পিউটার ও ইন্টারনেট'],
    modules: [
      {
        title: 'বেসিকস',
        order: 1,
        lessons: [
          {
            title: 'HTML & CSS Intro',
            slug: 'html-css-intro',
            youtubeId: 'pQN-pnXPaVg',
            videoUrl: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
            duration: '৪৫ মিনিট',
            description: 'ওয়েবসাইটের বেসিক গঠন',
            isFreePreview: true,
            order: 1
          }
        ]
      }
    ]
  },
  {
    title: 'শিশুদের মজার ছড়া ও গল্প',
    slug: 'kids-rhymes-and-stories',
    description: 'ছোটদের জন্য আনন্দদায়ক ছড়া ও শিক্ষণীয় গল্পের কোর্স।',
    categorySlug: 'children-education',
    subCategorySlug: 'rhymes-and-stories',
    instructor: 'শেখাঘর টিম',
    instructorBio: 'শিশুদের জন্য বিশেষ কন্টেন্ট ক্রিয়েটর',
    audienceType: 'children',
    level: 'beginner',
    duration: '২ ঘণ্টা',
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    featured: true,
    isPublished: true,
    learningOutcomes: ['মজার ছড়া শেখা', 'গল্পের মাধ্যমে নীতি শিক্ষা'],
    audience: ['৩ থেকে ১০ বছরের শিশু'],
    requirements: ['কোনো পূর্ব অভিজ্ঞতার প্রয়োজন নেই'],
    modules: [
      {
        title: 'ছড়ার আসর',
        order: 1,
        lessons: [
          {
            title: 'মজার বাংলা ছড়া গান',
            slug: 'mojar-bangla-chora',
            youtubeId: 'QO_fK5Z7P_w',
            videoUrl: 'https://www.youtube.com/watch?v=QO_fK5Z7P_w',
            duration: '১৮ মিনিট',
            description: 'জনপ্রিয় সব বাংলা শিশুতোষ ছড়া',
            isFreePreview: true,
            order: 1
          }
        ]
      }
    ]
  }
];

export async function seedDatabase() {
  try {
    console.log('[Seed] Seeding hierarchical categories and videos...');

    // 1. Ensure Admin User exists: username: jasmin, pass: jasmin1142005
    const existingAdmin = await User.findOne({
      $or: [{ username: 'jasmin' }, { email: 'jasmin@shekhaghor.com' }],
    });

    const hashedPassword = await bcrypt.hash('jasmin1142005', 10);

    if (!existingAdmin) {
      await User.create({
        username: 'jasmin',
        email: 'jasmin@shekhaghor.com',
        password: hashedPassword,
        name: 'জেসমিন (অ্যাডমিন)',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bookmarks: [],
      });
      console.log('[Seed] Admin user created (username: jasmin, pass: jasmin1142005)');
    } else {
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
    }

    // 2. Ensure Categories with hierarchy
    for (const cat of initialCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { ...cat },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[Seed] Hierarchical categories seeded');

    // 3. Ensure Videos
    for (const vid of initialVideos) {
      await Video.findOneAndUpdate(
        { youtubeId: vid.youtubeId },
        { ...vid },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[Seed] Standalone educational videos seeded in MongoDB');

    // 4. Ensure Courses
    for (const course of initialCourses) {
      await Course.findOneAndUpdate(
        { slug: course.slug },
        { ...course },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[Seed] Courses seeded in MongoDB');

    // Update Category Counts dynamically
    const allCategories = await Category.find();
    for (const cat of allCategories) {
      const vCount = await Video.countDocuments({
        $or: [{ categorySlug: cat.slug }, { subCategorySlug: cat.slug }],
        isPublished: true,
      });
      const cCount = await Course.countDocuments({ categorySlug: cat.slug, isPublished: true });
      cat.videoCount = vCount;
      cat.courseCount = cCount;
      await cat.save();
    }

    return true;
  } catch (err: any) {
    console.error('[Seed] Error in seedDatabase:', err?.message || err);
    return false;
  }
}
