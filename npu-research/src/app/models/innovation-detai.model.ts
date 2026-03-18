export interface InnovationDetailResponse {
    result: number;
    message: string;
    data: {
      researchInnovation: InnovationApi;
      owner: ResearchOwnerInnovation[];
    };
  }
  
  export interface InnovationApi {
    research_id: number;
    research_type: string;
    research_code: string;
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    abstract_en: string | null;
    keywords: keyword[];
    year: number;
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    subject_area: SubjectAreaApi[];
    principle: string;
    source_funds: string;
    budget_amount: string;
    name_funding: string;
    year_received_budget: number;
    patent_number: string | null;
    application_number: string | null;
    examination_url: string | null;
    responsibilities: string | null;
    internal_members: InnovationInternalMemberApi[];
    external_members: InnovationExternalMemberApi[];
    full_report: FileDetailApi;
    innovation_images: InnovationImageApi[];
    oecd: OecdMajorApi[];
  }
  
  /* =========================
     Sub Models
  ========================= */
  
  export interface SubjectAreaApi {
    subject_area_id: number;
    name_en: string;
  }
  
  export interface InnovationInternalMemberApi {
    user_id: number;
    full_name: string;
    role: string;
  }

  export interface InnovationExternalMemberApi {
    user_id: number;
    full_name: string;
    role: string;
    organization: string;
  }
  
  export interface FileDetailApi {
    file_id: number | null;
    doc_type: string | null;
    file_name: string | null;
    size_file: string;
    get_url: string | null;
  }
  
  export interface InnovationImageApi {
    file_id?: number;
    doc_type?: string;
    file_name?: string;
    size_file?: string;
    get_url?: string;
  }

  export interface ResearchOwnerInnovation {
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