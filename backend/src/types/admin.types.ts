export type AdminRole = 'ADMIN' | 'PURCHASER' | 'VIEWER' | 'SALES';

export interface AdminCompanySummary {
  id: string;
  name: string;
  tier: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  company: AdminCompanySummary | null;
}
