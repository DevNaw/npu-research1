export interface InnovationOwner {
    user_id: number;
    full_name: string;
    role: string;
  }
  export interface Innovation {
    research_id: number;
    research_type: string;
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    year: number;
    subjectAreas: SubjectArea[];
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    own: InnovationOwner[];
    research_code: string;
    funding: Funding;
    oecd: OecdMajor[];
  }
  export interface InnovationData {
    innovations: Innovation[];
  }
  export interface InnovationResponse {
    result: number;
    message: string;
    data: InnovationData;
  }

  export interface SubjectArea {
    subject_area_id: number;
    name_en: string;
  }

  export interface Funding {
    source_funds: string;
    funding_name: string;
  }

  export interface OecdMajor {
    major_id: number;
    name_th: string;
    children: OecdSub;
  }

  export interface OecdSub {
    sub_id: number;
    name_th: string;
    children: OecdChild;
  }

  export interface OecdChild {
    child_id: number;
    name_th: string;
  }