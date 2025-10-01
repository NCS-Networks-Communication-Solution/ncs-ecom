export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company: {
    id: string;
    name: string;
    tier: string;
  } | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthenticatedUser;
}
