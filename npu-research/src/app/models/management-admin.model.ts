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

  export interface AdminDataPayload {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }

  export interface Update {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }