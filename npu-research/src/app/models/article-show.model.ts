export interface ArticleApiResponse {
  result: number;
  message: string;
  data: {
    researchArticle: ResearchArticle;
    owner: ResearchOwner[];
  };
}

export interface ResearchArticle {
  research_id: number;
  research_type: string;
  research_code: string;
  title_th: string;
  title_en: string;
  abstract: string | null;
  abstract_en: string | null;
  article_type: string;
  journal_name: string;
  doi: string;
  db_type: string;
  volume: string;
  volume_no: string;
  pages: string;
  year: number;
  year_published: number;
  published_date: string;
  is_cooperation: string;
  article_file: ArticleFile;
  internal_members: InternalMember[];
  external_members: ExternalMember[];
  keywords: keyword[];
  oecd: OecdMajorApi[];
  img_url: string | null;

  call_other: string | null;
  con_type: string | null;
  country: string | null;
  pre_location: string | null;
  responsibilities: string | null;
  status: string | null;
}

export interface SubjectArea {
  subject_area_id: number;
  name_en: string;
}

export interface InternalMember {
  user_id: number;
  full_name: string;
  role: string;
}

export interface ExternalMember {
  user_id: number;
  full_name: string;
  role: string;
  organization: string;
}

export interface ArticleFile {
  file_id: number | null;
  doc_type: string | null;
  file_name: string | null;
  size_file: string;
  get_url: string | null;
}

export interface ResearchOwner {
  user_id: number;
  full_name: string;
  organization: string;
  email: string;
  phone: string;
}

export interface keyword {
  id: number;
  keyword: string;
}

export interface OecdMajorApi {
  major_id: number;
  name_th: string;
  children: OecdSubApi;
}

export interface OecdSubApi {
  sub_id: number;
  name_th: string;
  children: OecdChildApi;
}

export interface OecdChildApi {
  child_id: number;
  name_th: string;
}

export interface OecdMajorUI {
  major_id: number;
  name_th: string;
  children: OecdSubUI[];
}

export interface OecdSubUI {
  sub_id: number;
  name_th: string;
  children: OecdChildUI[];
}

export interface OecdChildUI {
  child_id: number;
  name_th: string;
}
