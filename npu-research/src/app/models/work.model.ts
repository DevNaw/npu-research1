export interface WorkInfoResponse {
    result: number;
    message: string;
    data: WorkInfoData;
  }
  
  export interface WorkInfoData {
    work_info: WorkInfo;
    expertises: ExpertiseOption[];
    organizations: OrganizationOption[];
  }
  
  /* ===== Work Info ===== */
  
  export interface WorkInfo {
    position: string;
    organization: Organization;
    type: string;
    line_work: string;
    academic_position: string;
    interest: string;
    expertise: Expertise[];
    work_start_date: string;
    year_of_service: number;
  }
  
  /* ===== Organization ===== */
  
  export interface Organization {
    id: number;
    faculty: string;
  }
  
  export interface OrganizationOption {
    organization_id: number;
    faculty: string;
  }
  
  /* ===== Expertise ===== */
  
  export interface Expertise {
    id: number;
    name_th: string;
    name_en: string;
  }
  
  export interface ExpertiseOption {
    expertise_id: number;
    name_th: string;
    name_en: string;
  }