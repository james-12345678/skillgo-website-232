import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  completedAutobiography?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  updateUser: (patch: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
