import { useMutation } from "@tanstack/react-query";
import { api } from "./api.service";

// Reset password with token
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }) =>
      api.post("/auth/reset-password", { token, newPassword }),
  });
};

// Request new password reset link
export const useRequestPasswordResetLink = () => {
  return useMutation({
    mutationFn: async email => api.post("/auth/request-password-reset-link", { email }),
  });
};

// Login user
export const useLogin = () => {
  return useMutation({
    mutationFn: async credentials => api.post("/auth/signin", credentials),
  });
};
