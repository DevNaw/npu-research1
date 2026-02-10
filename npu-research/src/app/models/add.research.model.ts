export type Responsibility = 'หัวหน้าโครงการ' | 'ผู้ร่วมโครงการ';

export type ResponsibilityRole =
  | 'ที่ปรึกษา'
  | 'ผู้เชี่ยวชาญ'
  | 'กรรมการ';

export interface InternalPerson {
  name: string;
  organization: ResponsibilityRole | '';
}

export interface ExternalPerson {
  name: string;
  role: ResponsibilityRole | '';
  organization: string;
}

export interface ResearchData {
  responsibility: Responsibility | '';
  funding: string;
  status: string;
}
