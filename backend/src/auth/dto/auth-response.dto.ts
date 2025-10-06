import { AdminUser } from '../../types/admin.types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AdminUser;
}
