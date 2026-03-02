export interface ResearchInitResponse {
    result: number;
    message: string;
    data: {
      organizations: Organization[];
      expertises: Expertise[];
    };
  }

  export interface Organization {
    id: number;
    faculty: string;
  }

  export interface Expertise {
    expertise_id: number;
    name_th: string;
    name_en: string;
  }