export interface Organization {
  id: number;
  faculty: string;
}

export interface OrganizationData {
  organizations: Organization[];
}

export interface OrganizationResponse {
  result: number;
  message: string;
  data: OrganizationData;
}