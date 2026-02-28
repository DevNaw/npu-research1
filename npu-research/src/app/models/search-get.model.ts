export interface SubjectAreaResponse {
    result: number;
    message: string;
    data: SubjectAreaData;
  }
  
  export interface SubjectAreaData {
    organizations: Organization[];
    subject_areas: MajorSubjectArea[];
  }
  
  export interface Organization {
    id: number;
    faculty: string;
  }
  
  export interface MajorSubjectArea {
    major_id: number;
    name_en: string;
    children: SubSubjectArea[];
  }
  
  export interface SubSubjectArea {
    sub_id: number;
    name_en: string;
  }