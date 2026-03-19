export interface WorkResponse {
  result: number;
  message: string;
  data: WorkData;
}

export interface WorkData {
  work_info: WorkInfo;
  expertises: Expertise[];
  organizations: Organization[];
}

export interface WorkInfo {
  position: string;
  organization: Organization | null;
  type: string;
  line_work: string;
  academic_position: string;
  interest: string | null;
  expertises: string[]; // ✅ ตรงกับ UI (tag input)
  work_start_date: string; // หรือ Date ถ้า parse
  year_of_service: number;
}

export interface Expertise {
  expertise: string;
}

export interface Organization {
  id: number;
  faculty: string;
}