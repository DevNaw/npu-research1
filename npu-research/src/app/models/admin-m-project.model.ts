export interface ResearchResponse {
    result: number;
    message: string;
    data: ResearchData;
  }

  export interface ResearchData {
    count: number;
    project_count: number;
    article_count: number;
    innovation_count: number;
    researchs: Research[];
  }

  export interface Research {
    research_id: number;
    research_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
  
    research_code: string | null;
  
    title_th: string;
    title_en: string | null;
  
    year: number;
    published_date: string;
  
    status: string | null;
    call_other: string | null;
  
    img_url: string | null;
  
    oecd: OECD[];
    funding: Funding;
    own: ResearchOwner[];
  }

  export interface Funding {
    source_funds: string | null;
    funding_name: string | null;
  }

  export interface ResearchOwner {
    user_id: number;
    full_name: string;
    role: string;
  }

  export interface OECD {
    major_id: number;
    name_th: string;
    children?: OECDSub;
  }

  export interface OECDSub {
    sub_id: number;
    name_th: string;
    children?: OECDChild;
  }

  export interface OECDChild {
    child_id: number;
    name_th: string;
  }