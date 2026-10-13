export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  bookmarks: string[];
  createdAt?: string;
}

export interface ICategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description: string;
  parentCategory?: string | null;
  parentSlug?: string | null;
  audience?: 'children' | 'all' | 'adults';
  isPublished?: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  courseCount: number;
  videoCount: number;
}

export interface IVideo {
  _id?: string;
  id?: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId?: string;
  categorySlug: string;
  subCategorySlug?: string;
  audience?: 'children' | 'all' | 'adults';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration: string;
  isPublished: boolean;
  viewsCount: number;
  channelAvatar?: string;
  isFromYouTube?: boolean;
  badgeText?: string;
  order: number;
  createdAt?: string;
}

export interface IYouTubeVideo {
  youtubeId: string;
  title: string;
  description?: string;
  channelName: string;
  channelAvatar?: string;
  thumbnailUrl: string;
  duration?: string;
  viewsCount?: string;
  publishedTime?: string;
  isFromYouTube: true;
  badgeText?: string;
}

export interface IWatchHistoryItem {
  _id?: string;
  videoId: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  categorySlug: string;
  watchedAt: string;
}

export interface ILesson {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  youtubeId?: string;
  videoUrl?: string;
  duration?: string;
  description?: string;
  isFreePreview?: boolean;
  order: number;
  moduleTitle?: string;
}

export interface IModule {
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  subCategorySlug?: string;
  instructor: string;
  instructorBio?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration: string;
  thumbnail?: string;
  featured: boolean;
  isPublished: boolean;
  learningOutcomes: string[];
  audience: string[];
  requirements: string[];
  viewsCount: number;
  modules: IModule[];
  totalLessons?: number;
  category?: ICategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICourseProgress {
  courseSlug: string;
  completedLessonIds: string[];
  notesMap: Record<string, string>;
  totalCompleted: number;
  totalLessons: number;
  completionPercentage: number;
}

export interface IAdminStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalVideos: number;
  publishedVideos: number;
  draftVideos: number;
  totalLessons: number;
  totalCategories: number;
  totalUsers: number;
  pendingReports: number;
  totalCompletions: number;
}

export interface IReport {
  _id: string;
  courseSlug?: string;
  videoId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  reason: string;
  details: string;
  userEmail?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  action: string;
  performedBy: string;
  details: string;
  createdAt: string;
}
