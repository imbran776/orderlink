import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../services/api';

export type UserRole = 'Distributor' | 'Retailer' | 'Driver' | 'Admin';
export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'EN' | 'IND';
export type AppCurrency = 'USD' | 'IDR';

interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  theme: AppTheme;
  language: AppLanguage;
  currency: AppCurrency;
  profileName: string;
  setRole: (role: UserRole) => void;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: AppLanguage) => void;
  setCurrency: (curr: AppCurrency) => void;
  setProfileName: (name: string) => void;
  loginDemo: (role: UserRole) => void;
  loginReal: (userObj: User, role: UserRole) => void;
  loginWithToken: (token: string, user: User) => void;
  signOut: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessPage: (page: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  theme: 'dark',
  language: 'EN',
  currency: 'IDR',
  profileName: 'Alex Morgan',
  setRole: () => {},
  setTheme: () => {},
  setLanguage: () => {},
  setCurrency: () => {},
  setProfileName: () => {},
  loginDemo: () => {},
  loginReal: () => {},
  loginWithToken: () => {},
  signOut: () => {},
  hasPermission: () => false,
  canAccessPage: () => false,
});

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  Admin: ['Dashboard', 'Orders', 'Inventory', 'Customers', 'Analytics', 'Settings', 'Create', 'Edit', 'Delete'],
  Distributor: ['Dashboard', 'Orders', 'Inventory', 'Customers', 'Analytics', 'Create', 'Edit'],
  Retailer: ['Dashboard', 'Orders', 'Customers', 'Create'],
  Driver: ['Dashboard', 'Orders'],
};

const hasPermission = (userRole: UserRole | null, permission: string): boolean => {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(permission) ?? false;
};

const canAccessPage = (userRole: UserRole | null, page: string): boolean => {
  if (!userRole) return false;
  // Map page names to permissions
  const pagePermissions: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'Orders': 'Orders',
    'Inventory': 'Inventory',
    'Customers': 'Customers',
    'Analytics': 'Analytics',
    'Settings': 'Settings',
    '': 'Dashboard',
  };
  const permission = pagePermissions[page] || page;
  return hasPermission(userRole, permission);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Settings States
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [language, setLanguageState] = useState<AppLanguage>('EN');
  const [currency, setCurrencyState] = useState<AppCurrency>('IDR');
  const [profileName, setProfileNameState] = useState('User');

  const fetchUserFromToken = async (token: string) => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const userData = await res.json();
      const userObj: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url
      };
      setUser(userObj);
      localStorage.setItem('user_session', JSON.stringify(userObj));
      setRoleState(userObj.role);
      localStorage.setItem('user_role', userObj.role);
    } else {
      throw new Error('Invalid token');
    }
  };

  useEffect(() => {
    // Load session and settings from localStorage
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user_session');
      }
    }

    const savedRole = localStorage.getItem('user_role') as UserRole | null;
    if (savedRole) {
      setRoleState(savedRole);
    }

    const savedToken = localStorage.getItem('auth_token');
    if (savedToken && !savedUser) {
      // Try to restore session from token
      fetchUserFromToken(savedToken).catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_role');
      });
    }

    const savedTheme = localStorage.getItem('app_theme') as AppTheme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const savedLang = localStorage.getItem('app_lang') as AppLanguage | null;
    if (savedLang) setLanguageState(savedLang);

    const savedCurr = localStorage.getItem('app_curr') as AppCurrency | null;
    if (savedCurr) setCurrencyState(savedCurr);

    const savedName = localStorage.getItem('profile_name');
    if (savedName) setProfileNameState(savedName);

    setLoading(false);
  }, []);


  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('user_role', newRole);
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    localStorage.setItem('app_lang', newLang);
    // Auto-switch currency: IDR for Indonesian, USD for English
    const newCurrency = newLang === 'IND' ? 'IDR' : 'USD';
    setCurrencyState(newCurrency);
    localStorage.setItem('app_curr', newCurrency);
  };

  const setCurrency = (newCurr: AppCurrency) => {
    setCurrencyState(newCurr);
    localStorage.setItem('app_curr', newCurr);
  };

  const setProfileName = (newName: string) => {
    setProfileNameState(newName);
    localStorage.setItem('profile_name', newName);
  };

  const loginDemo = (selectedRole: UserRole) => {
    const demoUser: User = { id: 0, email: 'demo@example.com', role: selectedRole, full_name: 'Demo User' };
    // Demo token — NOT a real JWT, just a placeholder for local UI testing.
    // No secrets are embedded. Backend will reject this token in production.
    const demoToken = `demo-token-${selectedRole.toLowerCase()}-${Date.now()}`;
    
    setUser(demoUser);
    setRoleState(selectedRole);
    localStorage.setItem('user_session', JSON.stringify(demoUser));
    localStorage.setItem('user_role', selectedRole);
    localStorage.setItem('auth_token', demoToken);
  };

  const loginReal = (userObj: User, selectedRole: UserRole) => {
    setUser(userObj);
    setRoleState(selectedRole);
    localStorage.setItem('user_session', JSON.stringify(userObj));
    localStorage.setItem('user_role', selectedRole);
  };

  const loginWithToken = (token: string, userObj: User) => {
    localStorage.setItem('auth_token', token);
    setUser(userObj);
    setRoleState(userObj.role);
    localStorage.setItem('user_session', JSON.stringify(userObj));
    localStorage.setItem('user_role', userObj.role);
  };

  const signOut = () => {
    setUser(null);
    setRoleState(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        theme,
        language,
        currency,
        profileName,
        setRole,
        setTheme,
        setLanguage,
        setCurrency,
        setProfileName,
        loginDemo,
        loginReal,
        loginWithToken,
        signOut,
        hasPermission: (permission: string) => hasPermission(role, permission),
        canAccessPage: (page: string) => canAccessPage(role, page),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);