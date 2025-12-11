export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserData {
  uid: string;
  tokens: number;
  library: string[]; // Array of Novel IDs
}

export interface Chapter {
  id: string;
  title: string;
  pages: string[]; // Changed from single content string to array of pages
  order: number;
  lastUpdated: number;
}

export interface Novel {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  coverUrl?: string;
  tags: string[];
  category?: string; // Added category
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  chapterCount: number;
  rating?: number;
}

export type ViewMode = 'list' | 'reader' | 'editor';
export type DevicePreview = 'pc' | 'mobile';