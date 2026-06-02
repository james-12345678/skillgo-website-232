import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  completedAutobiography?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string, role?: 'admin' | 'user') => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (patch: Partial<User>) => void;
  handleTokenExpiry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize user state immediately from localStorage to avoid loading flicker
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // On mount, if a pending name exists (from signup or API), merge it into existing user
  useEffect(() => {
    try {
      const pendingName = localStorage.getItem('pending_user_name');
      const pendingEmail = localStorage.getItem('pending_user_email');
      if (pendingName && pendingName.trim()) {
        const storedUserRaw = localStorage.getItem('user');
        if (storedUserRaw) {
          const storedUser: User = JSON.parse(storedUserRaw);
          const emailMatches = pendingEmail ? storedUser.email === pendingEmail : true;
          if (emailMatches && (!storedUser.name || storedUser.name !== pendingName)) {
            const merged: User = { ...storedUser, name: pendingName.trim() };
            localStorage.setItem('user', JSON.stringify(merged));
            setUser(merged);
          }
        }
      }
    } catch {}
  }, []);

  const login = async (email: string, password: string, providedName?: string, role?: 'admin' | 'user'): Promise<boolean> => {
    console.log('AuthContext.login called with:', { email, password: '***', providedName, role });
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      let selectedName: string | null = null;

      // If a name was explicitly provided during sign-in (e.g. biometric/full-name flows), prefer it
      try {
        if (providedName && String(providedName).trim()) {
          selectedName = String(providedName).trim();
        } else {
          const pendingName = localStorage.getItem('pending_user_name');
          const pendingEmail = localStorage.getItem('pending_user_email');
          if (pendingName && pendingName.trim() && (!pendingEmail || pendingEmail === email)) {
            selectedName = pendingName.trim();
          } else {
            const existingRaw = localStorage.getItem('user');
            if (existingRaw) {
              const existing = JSON.parse(existingRaw);
              if (existing?.email === email && existing?.name) {
                selectedName = existing.name;
              }
            }
          }
        }
      } catch {}

      const name = selectedName && selectedName.trim() ? selectedName : "";

      const normalizedRole = (role?.toLowerCase() || 'user') as 'admin' | 'user';

      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: normalizedRole,
        completedAutobiography: true,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      // If we used a providedName, prefer keeping the user 'name' and clear pending only if it matched
      try {
        localStorage.removeItem('pending_user_name');
        localStorage.removeItem('pending_user_email');
      } catch {}

      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('AuthContext.login: Error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    console.log('AuthContext.signup called with:', { name, email, password: '***' });
    setIsLoading(true);

    try {
      // Minimal delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 100));

      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        completedAutobiography: true,
      };

      console.log('AuthContext.signup: Setting user data:', userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      console.log('AuthContext.signup: Success');
      return true;
    } catch (error) {
      console.error('AuthContext.signup: Error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("biometric_registered");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("pending_user_name");
    localStorage.removeItem("pending_user_email");

    // Clear active interview session
    localStorage.removeItem("active_interview_session_id");

    // Clear all interview-related question timestamps
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith("interview_question_served_at_")) {
        localStorage.removeItem(key);
      }
    });

    sessionStorage.clear();
    setUser(null);
  }, []);

  const updateUser = (patch: Partial<User>) => {
    setUser(prev => {
      const next = { ...(prev as User), ...patch } as User;
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleTokenExpiry = useCallback(() => {
    logout();
    navigate('/signin', { replace: true });
  }, [logout, navigate]);

  // Sync auth state across tabs without forcing timed session expiry on the frontend
  useEffect(() => {
    const handleSync = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        if (user) {
          setUser(null);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (!user || JSON.stringify(user) !== JSON.stringify(parsedUser)) {
          setUser(parsedUser);
        }
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  // Listen for token expiry events from API responses
  useEffect(() => {
    const handleTokenExpired = (event: CustomEvent) => {
      handleTokenExpiry();
    };

    window.addEventListener('tokenExpired', handleTokenExpired as EventListener);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired as EventListener);
    };
  }, [handleTokenExpiry]);

  const authValue = useMemo<AuthContextType>(() => ({
    user,
    login,
    signup,
    logout,
    isLoading,
    updateUser,
    handleTokenExpiry,
  }), [user, isLoading, logout, handleTokenExpiry]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
