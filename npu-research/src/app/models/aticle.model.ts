// export interface ArticleData {
//   id: number;
//   title: string;
//   photo: string;
//   branches_of_the_article: string;
//   branches_of_sub_articles: string;
//   quality_level: string;
//   internal_project_participants: string;
//   external_project_participants: string;
//   year_of_publication: string;
//   collaboration_with_other_organizations: string;
//   presentation_venue: string;
//   publication: string;
// }
// export interface Article {
//   id: number;
//   title_th: string;
//   title_en: string | null;
//   abstract: string | null;
//   year: string;
//   published_date: string;
//   call_other: string | null;
//   image: File | null;
//   db_type: string;
//   country: string;
//   article_type: string;
//   journal_name: string;
//   pre_location: string | null;
//   pages: string;
//   year_published: string;
//   volume: string;
//   volume_no: string;
//   is_cooperation: string;
//   doi: string;
//   subject_area_id: number;
//   subject_area?: {
//     subject_area_id: number;
//     name_en: string;
//   }[];
//   responsibilities: string;
//   internal_members: Internal[];
//   external_members: External[];
//   article_file: File | null;
//   major_id?: number | null;
//   sub_id?: number | null;
// }

// export interface Internal {
//   user_id: number;
//   role: string;
//   no: string;
// }

// export interface External {
//   full_name: string;
//   role: string;
//   organization: string;
//   no: string;
// }

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
    article_file: File | string | null;
  
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
  
    // ✅ ใช้ตอน "ส่ง API"
    subject_area_id: number;
  
    // ✅ ใช้ตอน "รับจาก API"
    subject_area?: ArticleSubjectArea[];
  
    responsibilities: string;
  
    internal_members: InternalMember[];
    external_members: ExternalMember[];
  
    article_type: string;
  
    major_id: number | null;
    sub_id: number | null;
  }
  