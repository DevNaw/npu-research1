export interface News {
  id: number;
  title: string;
  description?: string;
  content?: string;
  sourceUrl?: string;
  date: string;
  dateend: string;
  publishedAt?: string;
  cover?: string;
  gallery?: string[];
}

export interface NewsResponse {
  result: number;
  message: string;
  data: NewsData;
}

export interface NewsData {
  news: NewsItem[];
}

export interface NewsItem {
  news_id: number;
  title: string;
  published_date: string;
  expires_date: string;
  news_cover: string;
}

export interface News {
  id: number;
  title: string;
  description?: string;
  content?: string;
  sourceUrl?: string;
  date: string;
  dateend: string;
  publishedAt?: string;
  cover?: string;
  gallery?: string[];
}

export interface NewsResponse {
  result: number;
  message: string;
  data: NewsData;
}

export interface NewsData {
  news: NewsItem[];
}

export interface NewsItem {
  news_id: number;
  title: string;
  published_date: string;
  expires_date: string;
  news_cover: string;
}

// ── RDI News API ──────────────────────────────
export interface RdiNewsResponse {
  success: boolean;
  message: string;
  data: RdiNewsItem[];
}

export interface RdiNewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  date: string;
  modified: string;
}