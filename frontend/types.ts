export interface NewsItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  content?: string;
  published_at: string;
  tags: string[];
  imageUrl?: string;
}

export interface Advocate {
  id: string;
  name: string;
  firm: string;
  practice_areas: string[];
  lat: number;
  lon: number;
  distance_km?: number;
  phone: string;
  email: string;
  rating: number;
  review_count: number;
  address: string;
  imageUrl: string;
  is_online?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}