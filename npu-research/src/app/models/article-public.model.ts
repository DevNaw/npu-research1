// Article
export interface ArticleOwner {
  user_id: number;
  full_name: string;
  role: string;
}

export interface Article {
  research_id: number;
  research_type: string;
  title_th: string | null;
  title_en: string | null;
  abstract: string | null;
  year: number;
  published_date: string;
  subjectAreas: SubjectArea[];
  status: string | null;
  call_other: string | null;
  img_url: string | null;
  own: ArticleOwner[];
  research_code: string;
  funding: Funding;
  oecd: OecdMajor[];
}
export interface ArticleData {
  articles: Article[];
}

export interface ArticleResponse {
  result: number;
  message: string;
  data: ArticleData;
}

export interface SubjectArea {
  subject_area_id: number;
  name_en: string;
}

export interface Funding {
  source_funds: string;
  funding_name: string;
}

export interface OecdMajor {
  major_id: number;
  name_th: string;
  children: OecdSub;
}

export interface OecdSub {
  sub_id: number;
  name_th: string;
  children: OecdChild;
}

export interface OecdChild {
  child_id: number;
  name_th: string;
}
