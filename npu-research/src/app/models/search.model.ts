export interface SummaryBySubjectResponse {
  result: number;
  message: string;
  data: SummaryBySubjectData;
}

export interface SummaryBySubjectData {
  total: number;
  graph: SubjectGraphItem[];
  result: ResearchItem[];
}

export interface SubjectGraphItem {
  subject_area_id: number;
  oecd_name: string;
  count: number;
  percent: number;
}

export interface ResearchItem {
  id: number;
  code: string;
  type: 'ARTICLE' | 'PROJECT' | 'INNOVATION';
  title_th: string;
  title_en: string | null;
  year: number;
  image_url: string | null;
  subject_area: SubjectArea[];
  own: Owner | null;
  funding: Funding;
}

export interface SubjectArea {
  id: number;
  name_en: string;
}

export interface Owner {
  user_id: number;
  name: string;
  role: string;
}

export interface SearchResearchRequest {
  q?: string;
  org_id?: number;
  oecd_id?: number;
  article_type?: string;
  db_type?: string;
  con_type?: string;
  funding?: string;
  funding_id?: number;
  subject_area_id?: number;
  type?: 'ARTICLE' | 'PROJECT' | 'INNOVATION';
  year?: number;
  per_page?: number;
  date_from?: Date;
  date_to?: Date;
}

export interface Funding {
  funding_id: number;
  funding_name: string;
  source_funds: string;
}
