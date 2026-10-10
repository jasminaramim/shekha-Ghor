import mongoose, { Schema, Document } from 'mongoose';

// User Interface & Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  bookmarks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    bookmarks: [{ type: String }],
  },
  { timestamps: true }
);

// Category Interface & Schema (Hierarchical & Dynamic)
export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description: string;
  parentCategory?: string | null;
  parentSlug?: string | null;
  audience: 'children' | 'all' | 'adults';
  isPublished: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  courseCount: number;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    icon: { type: String, default: 'BookOpen' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    parentCategory: { type: String, default: null },
    parentSlug: { type: String, default: null },
    audience: { type: String, enum: ['children', 'all', 'adults'], default: 'all' },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    courseCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
CategorySchema.index({ parentSlug: 1 });

// Standalone Video Model (YouTube Videos)
export interface IVideo extends Document {
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId?: string;
  categorySlug: string;
  subCategorySlug?: string;
  audience: 'children' | 'all' | 'adults';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration: string;
  isPublished: boolean;
  viewsCount: number;
  order: number;
  courseSlug?: string;
  playlistId?: string;
  isApproved: boolean;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    youtubeId: { type: String, required: true, unique: true, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    channelName: { type: String, default: 'শেখাঘর' },
    channelId: { type: String, default: '' },
    categorySlug: { type: String, required: true, trim: true },
    subCategorySlug: { type: String, default: '' },
    audience: { type: String, enum: ['children', 'all', 'adults'], default: 'all' },
    difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
    duration: { type: String, default: '১৫ মিনিট' },
    isPublished: { type: Boolean, default: true },
    viewsCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    courseSlug: { type: String, default: '' },
    playlistId: { type: String, default: '' },
    isApproved: { type: Boolean, default: true },
    uploadedBy: { type: String, default: '' },
  },
  { timestamps: true }
);
VideoSchema.index({ categorySlug: 1 });
VideoSchema.index({ subCategorySlug: 1 });
VideoSchema.index({ audience: 1 });

// Playlist Schema
export interface IPlaylist extends Document {
  title: string;
  slug: string;
  playlistId: string;
  categorySlug: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  videoCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    playlistId: { type: String, required: true, trim: true },
    categorySlug: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    channelName: { type: String, default: '' },
    videoCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Lesson Schema (Embedded within Course Module)
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
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  youtubeId: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  duration: { type: String, default: '15 মিনিট' },
  description: { type: String, default: '' },
  isFreePreview: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

// Module Schema
export interface IModule {
  title: string;
  order: number;
  lessons: ILesson[];
}

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  lessons: [LessonSchema],
});

// Course Interface & Schema
export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  subCategorySlug?: string;
  instructor: string;
  instructorBio?: string;
  audienceType?: 'children' | 'all' | 'adults';
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
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    categorySlug: { type: String, required: true, trim: true },
    subCategorySlug: { type: String, default: '' },
    instructor: { type: String, required: true, trim: true },
    instructorBio: { type: String, default: '' },
    audienceType: { type: String, enum: ['children', 'all', 'adults'], default: 'all' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
    duration: { type: String, default: '৫ ঘণ্টা' },
    thumbnail: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    learningOutcomes: [{ type: String }],
    audience: [{ type: String }],
    requirements: [{ type: String }],
    viewsCount: { type: Number, default: 0 },
    modules: [ModuleSchema],
  },
  { timestamps: true }
);

// Lesson / Video Progress
export interface ILessonProgress extends Document {
  userId: string;
  courseSlug: string;
  lessonId: string;
  completed: boolean;
  notes?: string;
  lastWatchedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: { type: String, required: true, index: true },
    courseSlug: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
LessonProgressSchema.index({ userId: 1, courseSlug: 1, lessonId: 1 }, { unique: true });

// Watch History
export interface IWatchHistory extends Document {
  userId: string;
  videoId: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  categorySlug: string;
  watchedAt: Date;
}

const WatchHistorySchema = new Schema<IWatchHistory>(
  {
    userId: { type: String, required: true, index: true },
    videoId: { type: String, required: true },
    youtubeId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    channelName: { type: String, default: '' },
    categorySlug: { type: String, default: '' },
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Report
export interface IReport extends Document {
  courseSlug?: string;
  videoId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  reason: string;
  details: string;
  userEmail?: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    courseSlug: { type: String, default: '' },
    videoId: { type: String, default: '' },
    courseTitle: { type: String, default: '' },
    lessonId: { type: String, default: '' },
    lessonTitle: { type: String, default: '' },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

// Audit Log
export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  details: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
export const Playlist = mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const LessonProgress = mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
export const WatchHistory = mongoose.models.WatchHistory || mongoose.model<IWatchHistory>('WatchHistory', WatchHistorySchema);
export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
