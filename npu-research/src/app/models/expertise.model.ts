export interface Expertise {
    expertise_id: number;
    name_th: string;
    name_en: string;
  }
  
  export interface ExpertiseResponse {
    result: number;
    message: string;
    data: {
      expertises: Expertise[];
    };
  }
  