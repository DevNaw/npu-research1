export interface ExpertiseResponse {
    result: number;
    message: string;
    data: ExpertiseData;
  }

  export interface ExpertiseData {
    expertises: Expertise[];
  }

  export interface Expertise {
    expertise_id: number;
    name_th: string;
    name_en: string;
    is_active: number;
  }