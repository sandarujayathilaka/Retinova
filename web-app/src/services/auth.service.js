import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

// Get all users
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/auth/users");
      return response.data;
    },
  });
};

// Toggle user status
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }) =>
      api.patch(`/auth/users/${userId}/status`, {
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
};
