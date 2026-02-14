export interface InternalMember {
    user_id: string;
    role: string;
    no: string;
  }
  
  export interface ExternalMember {
    full_name: string;
    role: string;
    organization: string;
    no: string;
  }

  export interface ResearchData {
    id?: number;
    title_th: string;
    title_en: string;
    abstract: string;
    year: string;
    published_date: string;
    call_other: string;
    image: File | null;
    source_funds: string;
    name_funding: string;
    budget_amount: string;
    budget: string;
    year_received_budget: string;
    research_area: string;
    usable_area: string;
    start_date: string;
    end_date: string;
  
    internal_members: InternalMember[];
    external_members: ExternalMember[];
  
    full_report: File | null;
    contract_file: File | null;
  }
  

  export interface ResearchResponse {
    result: number;
    message: string;
    data: {
      projects: ResearchData[];
    };
  }
  

  export interface Research {
    id: number;
    name: string;
    type: string;
    subType: string;
    faculty: string;
    agency: string;
    funding: string;
    year: number;
    date: Date;
    title: string;
    img: string;
  }

  export interface ResearchPublicResponse {
    result: number;
    message: string;
    data: {
      projects: ResearchDataPublic[];
      articles: ArticleDataPublic[];
      innovations: InnovationDataPublic[];
    };
  }
  
  export interface ResearchDataPublic {
    research_id: number;
    research_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
    title_th: string;
    title_en: string;
    abstract: string;
    year: number;
    published_date: string; // API ส่งเป็น string
    status: string | null;
    call_other: string;
    img_url: string;
    own: ResearchOwner[];
  }
  
  export interface ResearchOwner {
    id: number;
    output_id: number;
    user_id: number;
    role: string;
    no: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface ArticleDataPublic {
    article_id: number;
    article_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
    title_th: string;
    title_en: string;
    abstract: string;
    date: string;
    year: number;
    published_date: string; // API ส่งเป็น string
    status: string | null;
    call_other: string;
    img_url: string;
    own: ArticleOwner[];
  }
  
  export interface ArticleOwner {
    id: number;
    output_id: number;
    user_id: number;
    role: string;
    no: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface InnovationDataPublic {
    innovation_id: number;
    innovation_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
    title_th: string;
    title_en: string;
    abstract: string;
    year: number;
    published_date: string; // API ส่งเป็น string
    status: string | null;
    call_other: string;
    img_url: string;
    own: InnovationOwner[];
  }
  
  export interface InnovationOwner {
    id: number;
    output_id: number;
    user_id: number;
    role: string;
    no: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  }
  
  