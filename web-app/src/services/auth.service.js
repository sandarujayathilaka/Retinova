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
export const useResendResetLink = () => {
  return useMutation({
    mutationFn: async email => api.post("/auth/resend-reset-link", { email }),
  });
};
