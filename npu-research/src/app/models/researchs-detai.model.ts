export interface ResearchSubjectArea {
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

export interface ResearchFileResponse {
  file_id: number;
  doc_type: string;
  file_name: string;
  size_file: string;
  get_url: string;
}

export interface ResearchContractFile {
  file_id: number;
  doc_type: string;
  file_name: string;
  size_file: string;
  get_url: string;
}

export interface ResearchProjectData {
  id: number;
  title_th: string;
  title_en: string;
  abstract: string;
  abstract_en: string;
  keywords: string[];
  status: string;
  year: string;
  published_date: string;
  call_other: string | null;
  image: string | null;
  source_funds: string;
  name_funding: string;
  budget_amount: string;
  year_received_budget: number;
  research_area: string;
  usable_area: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
  subject_area_id: number;
  subject_area?: ResearchSubjectArea[];
  internal_members: InternalMember[];
  external_members: ExternalMember[];
  full_report: ResearchFileResponse | null;
  contract_file: ResearchContractFile | null;
  oecd_id: number;
  funding_code: string;
  funding_id: number;
}

export interface ResearchKeyword {
  id: number;
  keyword: string;
}