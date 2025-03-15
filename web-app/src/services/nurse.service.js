import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

// Add a nurse
export const useAddNurse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => api.post("/nurses", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurses"]); // Refresh nurse list
    },
  });
};

// Get all nurses
export const useGetNurses = () => {
  return useQuery({
    queryKey: ["nurses"],
    queryFn: async () => {
      const response = await api.get("/nurses");
      return response.data;
    },
  });
};

// Get nurse by ID
export const useGetNurseById = id => {
  return useQuery({
    queryKey: ["nurse", id],
    queryFn: async () => {
      const response = await api.get(`/nurses/${id}`);
      return response.data;
    },
    enabled: !!id, // Prevents query if no ID is provided
  });
};

// Update a nurse
export const useUpdateNurse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => api.put(`/nurses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurses"]);
    },
  });
};

// Delete a nurse
export const useDeleteNurse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async id => api.delete(`/nurses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurses"]);
    },
  });
};
