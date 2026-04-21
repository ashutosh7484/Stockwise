import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Role, JwtPayload } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  role: Role | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: Role, email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  // exp is in seconds
  return Date.now() / 1000 > payload.exp;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as Role | null;
    const storedEmail = localStorage.getItem('email');

    if (storedToken && storedRole) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
      } else {
        setToken(storedToken);
        setRole(storedRole);
        setEmail(storedEmail);
      }
    }
    setIsLoading(false);
  }, []);

  // Periodic expiry check every 60 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        setToken(null);
        setRole(null);
        setEmail(null);
        window.location.href = '/login';
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token]);

  const login = useCallback((newToken: string, newRole: Role, newEmail: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('email', newEmail);
    setToken(newToken);
    setRole(newRole);
    setEmail(newEmail);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setToken(null);
    setRole(null);
    setEmail(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      role,
      email,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [token, role, email, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
