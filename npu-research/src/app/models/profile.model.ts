export interface DataProfile {
  id: number;
  faculty: string;
  name: string;
  major: string;
  position: string;
}

// Register Data
export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  org_id: number;
  expertises: string[];
  password: string;
  password_confirmation: string;
}
