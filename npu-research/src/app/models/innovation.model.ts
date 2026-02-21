export interface InnovationSubjectArea {
  subject_area_id: number;
  name_en: string;
}

export interface InternalMember {
  user_id: number;
  full_name: string;
  role: string;
  no: string;
}

export interface ExternalMember {
  full_name: string;
  role: string;
  organization: string;
  no: string;
}

export interface FullReport {
  file_id: number | null;
  doc_type: string | null;
  file_name: string | null;
  size_file: string;
  get_url: string | null;
}

export interface InnovationImage {
  id?: number;
  file_name?: string;
  file_url?: string;
}

export interface ResearchInnovation {
  id: number;
  title_th: string;
  title_en: string;
  abstract: string;
  year: string;
  published_date: string;
  image: string | null;
  call_other: string | null;
  img_url: string | null;
  subject_area?: InnovationSubjectArea[];
  subject_area_id: number;
  principle: string;
  source_funds: string | null;
  budget_amount: string | null;
  name_funding: string | null;
  year_received_budget: string | null;
  patent_number: string | null;
  application_number: string | null;
  examination_url: string | null;
  responsibilities: string | null;
  internal_members: InternalMember[];
  external_members: ExternalMember[];
  full_report: FullReport | null;
  innovation_images: InnovationImage[] | null;
}
