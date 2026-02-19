export interface ArticleApiResponse {
    result: number;
    message: string;
    data: {
      researchArticle: ResearchArticle;
    };
  }

  export interface ResearchArticle {
    research_id: number;
    research_type: string;
  
    title_th: string;
    title_en: string | null;
    abstract: string | null;
  
    year: number;
    published_date: string;
    status: string | null;
  
    call_other: string | null;
    img_url: string | null;
  
    subject_area: SubjectArea[];
  
    article_type: string;
    db_type: string | null;
    country: string | null;
  
    journal_name: string;
    pre_location: string | null;
    pages: string;
  
    year_published: number;
    volume: string;
    volume_no: string;
  
    is_cooperation: string;
    doi: string;
  
    internal_members: InternalMember[];
    external_members: ExternalMember[];
  
    article_file: ArticleFile;
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
  