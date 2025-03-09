import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

// Add a doctor
export const useAddDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => api.post("/doctors", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]); // Refresh doctor list
    },
  });
};

// Get all doctors
export const useGetDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await api.get("/doctors");
      return response.data;
    },
  });
};

// Get doctor by ID
export const useGetDoctorById = id => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    },
    enabled: !!id, // Prevents query if no ID is provided
  });
};

// Update a doctor
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });
};

// Delete a doctor
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async id => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });
};
