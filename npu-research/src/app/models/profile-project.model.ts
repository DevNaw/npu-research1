export interface ResearchListResponse {
    result: number;
    message: string;
    data: ResearchListData;
  }

  export interface ResearchListData {
    count: number;
    project_count: number;
    article_count: number;
    innovation_count: number;
    researchs: ResearchItem[];
  }

  export interface ResearchItem {
    research_id: number;
    research_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    year: number;
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    own: ResearchOwner[];
  }

  export interface ResearchOwner {
    user_id: number;
    full_name: string;
    role: string;
  }