export type UserRole = 'use' | 'adm';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}
