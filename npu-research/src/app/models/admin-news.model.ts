// ใช้ในหน้า list

export interface NewsListResponse {
  result: number;
  message: string;
  data: {
    news: NewsItem[];
  };
}
export interface NewsItem {
  news_id: number;
  title: string;
  description: string;
  published_date: string;
  expires_date: string;
  news_cover: string;
}

// ใช้ในหน้า detail/edit
export interface NewsDetail extends NewsItem {
  news_photos: NewsPhoto[];
}

export interface NewsPhoto {
  photo_id: number;
  img_url: string;
  file_name: string;
  size_file: string;
  file_type: string;
}

export interface NewsDetailResponse {
  result: number;
  message: string;
  data: {
    news: NewsDetail;
  };
}