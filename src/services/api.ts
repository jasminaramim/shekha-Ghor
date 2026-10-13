import {
  ICourse,
  ICategory,
  IVideo,
  IWatchHistoryItem,
  IUser,
  ICourseProgress,
  IAdminStats,
  IReport,
  IAuditLog,
  ILesson,
  IYouTubeVideo,
} from '../types/index.js';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('shekhaghor_token');
}

export function setToken(token: string) {
  localStorage.setItem('shekhaghor_token', token);
}

export function removeToken() {
  localStorage.removeItem('shekhaghor_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `সার্ভার ত্রুটি: ${res.status}`,
        ...data,
      };
    }
    return data;
  } catch (error: any) {
    console.error(`API request error on ${endpoint}:`, error);
    return {
      success: false,
      message: error?.message || 'নেটওয়ার্ক সংযোগে ত্রুটি দেখা দিয়েছে।',
    };
  }
}

export const api = {
  // Authentication
  auth: {
    async register(payload: { name: string; username: string; email: string; password: string }) {
      const res = await request<{ token: string; user: IUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.token) {
        setToken(res.token);
      }
      return res;
    },
    async login(payload: { identifier: string; password: string }) {
      const res = await request<{ token: string; user: IUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.token) {
        setToken(res.token);
      }
      return res;
    },
    async getMe() {
      return request<{ user: IUser }>('/auth/me');
    },
    async updateProfile(payload: { name?: string; avatar?: string }) {
      return request<{ user: IUser }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    logout() {
      removeToken();
    },
  },

  // Videos
  videos: {
    async getAll(params?: {
      category?: string;
      subCategory?: string;
      audience?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.subCategory) query.append('subCategory', params.subCategory);
      if (params?.audience) query.append('audience', params.audience);
      if (params?.search) query.append('search', params.search);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      return request<{
        videos: IVideo[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/videos?${query.toString()}`);
    },
    async getById(id: string) {
      return request<{
        video: IVideo;
        relatedVideos: IVideo[];
        prevVideo: { title: string; youtubeId: string; _id: string } | null;
        nextVideo: { title: string; youtubeId: string; _id: string } | null;
        category: ICategory;
        subCategory?: ICategory;
      }>(`/videos/${id}`);
    },
    async getWatchHistory() {
      return request<{ history: IWatchHistoryItem[] }>('/videos/user/watch-history');
    },
    async searchYouTube(query: string) {
      return request<{ results: IYouTubeVideo[]; total: number }>(
        `/videos/youtube-search?q=${encodeURIComponent(query)}`
      );
    },
  },

  // Courses
  courses: {
    async getAll(params?: {
      category?: string;
      search?: string;
      sort?: string;
      featured?: boolean;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.featured) query.append('featured', 'true');
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      return request<{
        courses: ICourse[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/courses?${query.toString()}`);
    },
    async getBySlug(slug: string) {
      return request<{ course: ICourse; relatedCourses: ICourse[] }>(`/courses/${slug}`);
    },
    async getLesson(courseSlug: string, lessonSlug: string) {
      return request<{
        course: {
          title: string;
          slug: string;
          instructor: string;
          instructorBio?: string;
          categorySlug: string;
          modules: any[];
          totalLessons: number;
        };
        currentLesson: ILesson;
        prevLesson: { slug: string; title: string } | null;
        nextLesson: { slug: string; title: string } | null;
        currentIndex: number;
        totalLessons: number;
      }>(`/courses/${courseSlug}/lessons/${lessonSlug}`);
    },
    async recordView(slug: string) {
      return request(`/courses/${slug}/view`, { method: 'POST' });
    },
  },

  // Categories
  categories: {
    async getAll() {
      return request<{ categories: ICategory[] }>('/categories');
    },
    async getBySlug(slug: string) {
      return request<{ category: ICategory; courses: ICourse[] }>(`/categories/${slug}`);
    },
  },

  // Progress & Bookmarks
  progress: {
    async getMyProgress() {
      return request<{
        progress: Record<
          string,
          { completedLessonIds: string[]; notesCount: number; totalCompleted: number }
        >;
      }>('/progress/my-progress');
    },
    async getCourseProgress(courseSlug: string) {
      return request<ICourseProgress>(`/progress/course/${courseSlug}`);
    },
    async toggleLesson(courseSlug: string, lessonId: string, completed?: boolean) {
      return request<{ completed: boolean; lessonId: string }>('/progress/toggle-lesson', {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lessonId, completed }),
      });
    },
    async saveNote(courseSlug: string, lessonId: string, notes: string) {
      return request<{ notes: string }>('/progress/note', {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lessonId, notes }),
      });
    },
    async toggleBookmark(courseSlug: string) {
      return request<{ isBookmarked: boolean; bookmarks: string[] }>('/progress/bookmarks/toggle', {
        method: 'POST',
        body: JSON.stringify({ courseSlug }),
      });
    },
    async getBookmarks() {
      return request<{ courses: ICourse[] }>('/progress/bookmarks');
    },
  },

  // Admin
  admin: {
    async getStats() {
      return request<{ stats: IAdminStats }>('/admin/stats');
    },
    async parseYoutube(url: string) {
      return request<{
        data: {
          youtubeId: string;
          playlistId: string | null;
          title: string;
          authorName: string;
          thumbnailUrl: string;
          embedUrl: string;
          isDuplicate?: boolean;
          existingVideoTitle?: string;
        };
      }>('/admin/youtube/parse', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    },
    async searchYoutube(query: string) {
      return request<{ results: any[] }>('/admin/videos/search-youtube', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    },
    async importVideo(payload: Partial<IVideo>) {
      return request<{ video: IVideo }>('/admin/videos/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async updateVideo(id: string, payload: Partial<IVideo>) {
      return request<{ video: IVideo }>(`/admin/videos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    async deleteVideo(id: string) {
      return request(`/admin/videos/${id}`, { method: 'DELETE' });
    },
    async getVideos(params?: { category?: string; search?: string; page?: number; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return request<{ videos: IVideo[]; total: number; totalPages: number }>(`/admin/videos?${query.toString()}`);
    },
    async createCourse(courseData: Partial<ICourse>) {
      return request<{ course: ICourse }>('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
    },
    async updateCourse(id: string, courseData: Partial<ICourse>) {
      return request<{ course: ICourse }>(`/admin/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    },
    async deleteCourse(id: string) {
      return request(`/admin/courses/${id}`, { method: 'DELETE' });
    },
    async createCategory(catData: Partial<ICategory>) {
      return request<{ category: ICategory }>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(catData),
      });
    },
    async updateCategory(id: string, catData: Partial<ICategory>) {
      return request<{ category: ICategory }>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(catData),
      });
    },
    async checkCategoryDelete(id: string) {
      return request<{
        hasContent: boolean;
        attachedVideos: number;
        attachedCourses: number;
        childCategories: number;
        categoryName: string;
      }>(`/admin/categories/${id}/check-delete`);
    },
    async deleteCategory(id: string, options?: { force?: boolean; reassignTo?: string }) {
      return request(`/admin/categories/${id}`, {
        method: 'DELETE',
        body: JSON.stringify(options || {}),
      });
    },
    async getUsers() {
      return request<{ users: IUser[] }>('/admin/users');
    },
    async getAuditLogs() {
      return request<{ logs: IAuditLog[] }>('/admin/audit-logs');
    },
  },

  // Reports
  reports: {
    async submit(payload: {
      courseSlug?: string;
      videoId?: string;
      courseTitle?: string;
      lessonId?: string;
      lessonTitle?: string;
      reason: string;
      details?: string;
      userEmail?: string;
    }) {
      return request('/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async getAll() {
      return request<{ reports: IReport[] }>('/reports/all');
    },
    async updateStatus(id: string, status: 'pending' | 'resolved') {
      return request(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },
};
