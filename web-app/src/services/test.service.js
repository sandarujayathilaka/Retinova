import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

// Add a test
export const useAddTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => api.post("/tests", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tests"]); // Refresh test list
    },
  });
};

// Get all tests
export const useGetTests = () => {
  return useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await api.get("/tests");
      return response.data;
    },
  });
};

// Get test by ID
export const useGetTestById = id => {
  return useQuery({
    queryKey: ["test", id],
    queryFn: async () => {
      const response = await api.get(`/tests/${id}`);
      return response.data;
    },
    enabled: !!id, // Prevents query if no ID is provided
  });
};

// Update a test
export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => api.put(`/tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tests"]);
    },
  });
};

// Delete a test
export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async id => api.delete(`/tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["tests"]);
    },
  });
};
