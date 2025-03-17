import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

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
export const useGetDoctorById = (id: string) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    },
    enabled: !!id, // Prevents query if no ID is provided
  });
};
