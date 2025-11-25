import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiService, type AuthResponse, type AuthUser, type AuthUserRole, type Branch, type Tokens, type UserPermissionModule } from '@/lib/api';

interface AuthenticatedUser extends AuthUser {
  role: AuthUserRole;
  permissions: string[];
  tokens: Tokens;
  full_name: string;
  branch: Branch;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  permissions: string[];
  sessionId: string | null;
  websocketEndpoints: { notifications: string; messages: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePermissions: (newPermissions: string[] | UserPermissionModule[]) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (codename: string) => boolean;
  hasAnyPermission: (codenames: string[]) => boolean;
  hasAllPermissions: (codenames: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'user_data',
  PERMISSIONS: 'user_permissions',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'sessionid',
  WEBSOCKET_ENDPOINTS: 'websocket_endpoints',
} as const;

const normalizePermissions = (input: string[] | UserPermissionModule[] | undefined): string[] => {
  if (!input || input.length === 0) {
    return [];
  }

  if (typeof input[0] === 'string') {
    return input as string[];
  }

  const modules = input as UserPermissionModule[];
  return modules.flatMap((module) =>
    module.permissions?.map((permission) => permission.codename) ?? [],
  );
};

const buildFullName = (user: Pick<AuthUser, 'first_name' | 'last_name' | 'username'>): string => {
  const names = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return names.length > 0 ? names : user.username;
};

const buildUserFromStorage = (
  storedUser: AuthUser | null,
  storedPermissions: string[],
  tokens: Tokens | null,
): AuthenticatedUser | null => {
  if (!storedUser || !tokens) {
    return null;
  }

  const role: AuthUserRole = storedUser.role ?? {
    id: '',
    name: '',
    slug: '',
    description: '',
    role_type: '',
  };

  const branch: Branch = storedUser.branch ?? {
    id: '',
    organization_id: '',
    name: '',
    code: '',
  };

  const permissions = storedPermissions ?? [];
  const fullName = storedUser.full_name ?? buildFullName(storedUser);

  return {
    ...storedUser,
    role,
    branch,
    permissions,
    tokens,
    full_name: fullName,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [websocketEndpoints, setWebsocketEndpoints] = useState<{ notifications: string; messages: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem(STORAGE_KEYS.USER);
    const storedPermissionsRaw = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const storedWebsocketEndpoints = localStorage.getItem(STORAGE_KEYS.WEBSOCKET_ENDPOINTS);

    try {
      const parsedUser: AuthUser | null = storedUserRaw ? JSON.parse(storedUserRaw) : null;
      const parsedPermissions: string[] = storedPermissionsRaw ? JSON.parse(storedPermissionsRaw) : [];
      const tokens: Tokens | null = accessToken
        ? {
            access: accessToken,
            refresh: refreshToken || '',
          }
        : null;

      const builtUser = buildUserFromStorage(parsedUser, parsedPermissions, tokens);

      if (builtUser && builtUser.tokens.access) {
        setUser(builtUser);
        setPermissions(parsedPermissions);
        apiService.setAccessToken(builtUser.tokens.access);
      }

      if (storedSessionId) {
        setSessionId(storedSessionId);
      }

      if (storedWebsocketEndpoints) {
        try {
          const endpoints = JSON.parse(storedWebsocketEndpoints);
          setWebsocketEndpoints(endpoints);
        } catch (e) {
          console.error('Error parsing websocket endpoints:', e);
        }
      }
    } catch (error) {
      console.error('Error restoring authentication state:', error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      localStorage.removeItem(STORAGE_KEYS.WEBSOCKET_ENDPOINTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    apiService.setOnUnauthorized(() => {
      setUser(null);
      setPermissions([]);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response: AuthResponse = await apiService.login({ username, password });

      const tokens: Tokens = {
        access: response.access,
        refresh: response.refresh ?? '',
      };

      const normalizedPermissions = normalizePermissions(response.user.permissions);
      const fullName = response.user.full_name ?? buildFullName(response.user);

      const authenticatedUser: AuthenticatedUser = {
        ...response.user,
        full_name: fullName,
        permissions: normalizedPermissions,
        tokens,
        branch: response.user.branch,
      };

      setUser(authenticatedUser);
      setPermissions(normalizedPermissions);

      apiService.setAccessToken(tokens.access);

      // Store session ID if available
      // Try localStorage first, then document.cookie as fallback
      let sessionIdValue = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sessionIdValue && typeof document !== 'undefined' && document.cookie) {
        const cookieMatch = document.cookie.match(/sessionid=([^;]+)/);
        if (cookieMatch) {
          sessionIdValue = cookieMatch[1];
          localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionIdValue);
        }
      }
      if (sessionIdValue) {
        setSessionId(sessionIdValue);
      } else {
        console.warn('Session ID not found after login');
      }

      // Store websocket endpoints if available
      if (response.websocket_endpoints) {
        setWebsocketEndpoints(response.websocket_endpoints);
        localStorage.setItem(STORAGE_KEYS.WEBSOCKET_ENDPOINTS, JSON.stringify(response.websocket_endpoints));
      }

      const userToStore: AuthUser = {
        ...response.user,
        full_name: fullName,
        permissions: normalizedPermissions,
        branch: response.user.branch,
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToStore));
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(normalizedPermissions));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setPermissions([]);
      setSessionId(null);
      setWebsocketEndpoints(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      localStorage.removeItem(STORAGE_KEYS.WEBSOCKET_ENDPOINTS);
    }
  };

  const updatePermissions = (newPermissions: string[] | UserPermissionModule[]) => {
    const normalized = normalizePermissions(newPermissions);
    setPermissions(normalized);
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(normalized));

    if (user) {
      const updatedUser: AuthenticatedUser = {
        ...user,
        permissions: normalized,
      };
      setUser(updatedUser);
      const userToStore: AuthUser = {
        ...updatedUser,
        permissions: normalized,
      };
      delete (userToStore as Partial<AuthenticatedUser>).tokens;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToStore));
    }
  };

  const hasPermission = (codename: string): boolean => permissions.includes(codename);

  const hasAnyPermission = (codenames: string[]): boolean => codenames.some(hasPermission);

  const hasAllPermissions = (codenames: string[]): boolean => codenames.every(hasPermission);

  const isAuthenticated = useMemo(() => Boolean(user?.tokens.access), [user]);

  const value: AuthContextType = {
    user,
    permissions,
    sessionId,
    websocketEndpoints,
    login,
    logout,
    updatePermissions,
    isLoading,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

