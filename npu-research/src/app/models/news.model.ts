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
