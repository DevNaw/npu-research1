export interface ProjectDetailResponse {
    result: number;
    message: string;
    data: {
      projectDetail: ProjectDetail;
    };
  }

  export interface ProjectDetail {
    id: number;
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    subject_area?: SubjectArea[];
    subject_area_id: number;
    project_code: string | null;
    source_funds: string | null;
    name_funding: string | null;
    budget_amount: string | null;
    year_received_budget: number;
    research_area: string | null;
    usable_area: string | null;
    start_date: string | null;
    end_date: string | null;
    responsibilities: string | null;
    internal_members: InternalMember[];
    external_members: ExternalMember[];
    full_report: FileFull | null;
    contract_file: ContractFile | null;
  }

  export interface SubjectArea {
    subject_area_id: number;
    name_en: string;
  }

  export interface InternalMember {
    user_id: number;
    full_name?: string;
    role: string;
    no: string;
  }

  export interface ExternalMember {
    full_name: string;
    role: string;
    organization: string;
    no: string;
  }

  export interface FileFull {
    file_id: number | null;
    doc_type: string | null;
    file_name: string | null;
    size_file: string;
    get_url: string | null;
  }

  export interface ContractFile {
    file_id: number | null;
    doc_type: string | null;
    file_name: string | null;
    size_file: string;
    get_url: string | null;
  }