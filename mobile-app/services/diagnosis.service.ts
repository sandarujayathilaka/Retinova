import { useQuery } from "@tanstack/react-query";
import { api } from "./api.service";

export const useGetDiagnoses = () => {
  return useQuery<any[], Error>({
    queryKey: ["diagnoses"],
    queryFn: async () => {
      try {
        console.log("Fetching diagnoses from /patients/diagnosehistory");
        const response = await api.get("/patients/my/diagnosehistory");
        console.log("Diagnoses response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching diagnoses:", JSON.stringify(error));
        throw error; // Re-throw to let React Query handle the error state
      }
    },
  });
};


export const useGetDiagnosisById = (diagnosisId: string) => {
  return useQuery<any, Error>({
    queryKey: ["diagnosis", diagnosisId],
    queryFn: async () => {
      console.log("Fetching diagnosis by ID:", diagnosisId);
      const response = await api.get(`/patients/diagnoses/${diagnosisId}`);
      console.log("Diagnosis response:", response.data);
      return response.data;
    },
    enabled: !!diagnosisId,
  });
};