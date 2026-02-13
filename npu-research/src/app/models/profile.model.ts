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
  expertise_ids: number[];
  password: string;
  password_confirmation: string;
}
