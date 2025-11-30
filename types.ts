export interface Novel {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  rating: number;
  views: number;
  tags: string[];
  status: '연재중' | '완결';
}

export type ViewState = 'HOME' | 'LIBRARY' | 'SEARCH' | 'PROFILE' | 'LOGIN' | 'SIGNUP' | 'NOVEL_DETAIL';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}