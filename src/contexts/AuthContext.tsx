
import React, { createContext, useState, useEffect, useContext } from 'react';
import { findUser } from '@/lib/storage';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('current_user');
      }
    }
  }, []);
  
  const login = (username: string, password: string): boolean => {
    const foundUser = findUser(username, password);
    
    if (foundUser) {
      console.log('Login successful:', foundUser);
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('current_user', JSON.stringify(foundUser));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      return true;
    } else {
      console.error('Login failed for username:', username);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('current_user');
    toast({
      title: "Logged Out",
      description: "You've been successfully logged out",
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        role: user?.role || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
