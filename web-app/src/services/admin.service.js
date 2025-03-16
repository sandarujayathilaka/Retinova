import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

// Add a admin
export const useAddAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => api.post("/auth/admins", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]); // Refresh admin list
    },
  });
};

// Get all admins
export const useGetAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await api.get("/auth/admins");
      return response.data;
    },
  });
};

// Get admin by ID
export const useGetAdminById = id => {
  return useQuery({
    queryKey: ["admin", id],
    queryFn: async () => {
      const response = await api.get(`/auth/admins/${id}`);
      return response.data;
    },
    enabled: !!id, // Prevents query if no ID is provided
  });
};

// Update an admin
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => api.put(`/auth/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
    },
  });
};

// Delete an admin
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async id => api.delete(`/auth/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
    },
  });
};
