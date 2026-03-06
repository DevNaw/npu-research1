export interface UsersResponse {
    result: number;
    message: string;
    data: UsersData;
  }
  
  export interface UsersData {
    users: User[];
  }
  
  export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    role: string;
  }