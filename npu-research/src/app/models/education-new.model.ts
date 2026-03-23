export interface EducationResponseNew {
    result: number;
    message: string;
    data: EducationData;
  }
  
  export interface EducationData {
    education_info: EducationInfo[];
  }
  
  export interface EducationInfo {
    id: number;
    highest_education: string | null;
    field_of_study: string | null;
    qualification: string | null;
    institution: string | null;
    date_graduation: string;
  }