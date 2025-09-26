export interface RegisterRequestDto {
    email: string;
    password: string;
    name: string;
    companyId: string;
    role?: UserRole;
}
export interface LoginRequestDto {
    email: string;
    password: string;
}
export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserDto;
}
export interface RefreshTokenRequestDto {
    refreshToken: string;
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    PURCHASER = "PURCHASER",
    VIEWER = "VIEWER",
    SALES = "SALES"
}
export interface UserDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    companyId: string;
    company?: CompanyDto;
}
export interface CompanyDto {
    id: string;
    name: string;
    taxId?: string;
    tier: CompanyTier;
    createdAt: string;
}
export declare enum CompanyTier {
    STANDARD = "STANDARD",
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD"
}
