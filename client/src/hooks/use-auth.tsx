import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "./use-toast";
import { AuthResponse, LoginFormData, RegisterFormData, User } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<AuthResponse>;
  register: (userData: RegisterFormData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/current-user");
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        // User is not logged in, that's ok
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await response.json();
        setUser(data.user);
        return data;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (formData: RegisterFormData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        // First create the user
        const userResponse = await apiRequest("POST", "/api/users", formData);
        const userData = await userResponse.json();
        
        // Then login with the new credentials
        const loginResponse = await apiRequest("POST", "/api/auth/login", {
          username: formData.username,
          password: formData.password
        });
        
        const authData = await loginResponse.json();
        setUser(authData.user);
        return authData;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Registration failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Could not create account",
      });
    }
  });

  const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
    return await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: RegisterFormData): Promise<AuthResponse> => {
    return await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}