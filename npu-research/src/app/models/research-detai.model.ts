export interface ProjectDetailResponse {
    result: number;
    message: string;
    data: {
      projectDetail: ProjectDetailApi;
      owner: ResearchOwnerProject;
    };
  }
  
  export interface ProjectDetailApi {
    research_id: number;
    research_type: string;
    research_code: string;
    lang_type: string;
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    abstract_en: string | null;
    keywords: ResearchKeyword[];
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    subject_area: SubjectAreaApi[];
    project_code: string | null;
    source_funds: string;
    name_funding: string;
    budget_amount: string;
    year_received_budget: number;
    research_area: string;
    usable_area: string;
    start_date: string | null;
    end_date: string | null;
    responsibilities: string | null;
    internal_members: InternalMemberApi[];
    external_members: ExternalMemberApi[];
    full_report: FileDetailApi;
    contract_file: FileDetailApi;
    oecd: OecdMajorApi[];
  }
  
  export interface SubjectAreaApi {
    subject_area_id: number;
    name_en: string;
  }
  
  export interface InternalMemberApi {
    user_id: number;
    full_name: string;
    role: string;
  }
  
  export interface ExternalMemberApi {
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

  export interface ResearchOwnerProject {
    user_id: number;
    full_name: string;
    organization: string;
    email: string;
    phone: string;
  }

  export interface ResearchKeyword {
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