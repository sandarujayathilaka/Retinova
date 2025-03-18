import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.service";

// Get all diagnoses for a patient
export const useGetDiagnoses = (patientId: string) => {
  return useQuery<any[], Error>({
    queryKey: ["diagnoses", patientId],
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}/history`);
      return response.data;
    },
    enabled: !!patientId, // Prevents query if no patientId is provided
  });
};

// Get diagnosis by ID
export const useGetDiagnosisById = (patientId: string, diagnosisId: string) => {
  return useQuery<any, Error>({
    queryKey: ["diagnosis", patientId, diagnosisId],
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}/diagnoses/${diagnosisId}`);
      return response.data;
    },
    enabled: !!patientId && !!diagnosisId, // Prevents query if no IDs are provided
  });
};