export interface ResearcherSearchResponse {
    result: number;
    message: string;
    data: ResearcherSearchData;
  }

  export interface ResearcherSearchData {
    total: number;
    graph: ResearcherGraph[];
    result: Researcher[];
  }

  export interface ResearcherGraph {
    organization_id: number | null;
    faculty: string;
    count: number;
  }

  export interface Researcher {
    id: number;
    name: string;
    avatar: string | null;
    expertises: string | null;
    organization: string | null;
    position: string;
  }