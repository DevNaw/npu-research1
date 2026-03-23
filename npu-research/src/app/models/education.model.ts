export interface EducationResponse {
    result: number;
    message: string;
    data: EducationData;
  }
  
  export interface EducationData {
    education_info: EducationInfo;
  }
  
  export interface EducationInfo {
    highest_education: string;
    field_of_study: string;
    qualification: string;
    gpa: string;
    institution: string;
    date_enrollment: string;
    date_graduation: string;
  }


  // New
  