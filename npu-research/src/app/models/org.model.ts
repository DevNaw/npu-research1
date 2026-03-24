export interface OrganizationResponse {
    result: number;
    message: string;
    data: OrganizationData;
  }
  
  export interface OrganizationData {
    organizations: Organization[];
  }
  
  export interface Organization {
    organization_id: number;
    faculty: string;
    faculty_en: string;
    faculty_short: string;
    faculty_code: string;
  }