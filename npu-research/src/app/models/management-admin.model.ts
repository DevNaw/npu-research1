export interface AdminResponse {
    result: number;
    message: string;
    data: AdminData;
  }
  
  export interface AdminData {
    admins: Admin[];
  }
  
  export interface Admin {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  }