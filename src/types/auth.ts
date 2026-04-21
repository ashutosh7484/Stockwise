export type Role = 'ADMIN' | 'STAFF';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  role: Role;
  email: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
  iat: number;
}

export interface AuthState {
  token: string | null;
  role: Role | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
