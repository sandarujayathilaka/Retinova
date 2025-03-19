import { useMutation } from "@tanstack/react-query";
import { api } from "./api.service";

// Request new password reset link
export const useRequestPasswordResetLink = () => {
  return useMutation({
    mutationFn: async (email: string) =>
      api.post("/auth/request-password-reset-link", { email }),
  });
};

// Define the types for the authentication data
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login user with proper typing
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return api.post("/auth/signin", credentials);
    },
  });
};

export const useGetUserProfile = () => {
  return useMutation({
    mutationFn: async () => {
      return api.get("/auth/me");
    },
  });
};
