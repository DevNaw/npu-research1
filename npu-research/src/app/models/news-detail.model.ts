export interface NewsDetailResponse {
    result: number;
    message: string;
    data: NewsData;
  }
  
  export interface NewsData {
    news: News;
  }
  
  export interface News {
    news_id: number;
    title: string;
    description: string;
    published_date: string;
    expires_date: string;
    news_cover: string;
    news_photos: NewsPhoto[];
  }
  
  export interface NewsPhoto {
    photo_id: number;
    img_url: string;
    file_name: string;
    size_file: string;
    file_type: string;
  }