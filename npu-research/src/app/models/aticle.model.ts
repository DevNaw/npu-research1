
// -----------------------------
// Subject Area (ใช้ตอนรับจาก API)
// -----------------------------
export interface ArticleSubjectArea {
    subject_area_id: number;
    name_en: string;
  }
  
  // -----------------------------
  // Internal Member
  // -----------------------------
  export interface InternalMember {
    user_id: number;
    full_name?: string;
    role: string;
    no: string;
  }
  
  // -----------------------------
  // External Member
  // -----------------------------
  export interface ExternalMember {
    full_name: string;
    role: string;
    organization: string;
    no: string;
  }

 // -----------------------------
  // File Response (ใช้ตอนรับจาก API)
  // -----------------------------
  export interface ArticleFileResponse {
    file_id: number;
    doc_type: string;
    file_name: string;
    size_file: string;
    get_url: string;
  }
  
  // -----------------------------
  // Article Model (Main)
  // -----------------------------
  export interface Article {
    id: number;
    title_th: string;
    title_en: string;
    abstract: string;
    year: string;
    published_date: string;
    call_other: string | null;
    image: string | null;
    article_file: ArticleFileResponse | null;
    db_type: string;
    country: string;
    journal_name: string;
    pre_location: string;
    pages: string;
    year_published: string;
    volume: string;
    volume_no: string;
    is_cooperation: string;
    doi: string;
    subject_area_id: number;
    subject_area?: ArticleSubjectArea[];
    responsibilities: string;
    internal_members: InternalMember[];
    external_members: ExternalMember[];
    article_type: string;
    major_id: number | null;
    sub_id: number | null;
  }
  