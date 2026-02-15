export interface ResearcherResponse {
    result: number;
    message: string;
    data: {
      $researchers: Researcher[];
    };
  }
  
  export interface Researcher {
    user_id: number;
    full_name: string;
    image: string | null;
  }
  