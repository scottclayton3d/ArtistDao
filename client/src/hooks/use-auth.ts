import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthResponse, LoginFormData, RegisterFormData } from "@/types";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await response.json();
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
    mutationFn: async (userData: RegisterFormData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        // First create the user
        const userResponse = await apiRequest("POST", "/api/users", userData);
        const user = await userResponse.json();
        
        // Then login with the new credentials
        const loginResponse = await apiRequest("POST", "/api/auth/login", {
          username: userData.username,
          password: userData.password
        });
        
        const authData = await loginResponse.json();
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

  return {
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    loginError: loginMutation.error,
    registerError: registerMutation.error
  };
}
