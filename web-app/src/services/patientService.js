import { api } from "../services/api.service";

export const patientService = {

     // Fetch patients with a specific status

    fetchPatients: async (status, params = {}) => {
      return api.get("/patients", {
        params: {
          status,
          ...params
        }
      });
    },
    
  
     // Assign or update revisit details for a patient
    
    assignRevisit: async (patientId, doctorId, revisitDate) => {
      const normalizedDate = new Date(
        Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())
      );
      
      return api.put(`/patients/${patientId}/revisit`, {
        doctorId,
        revisitDate: normalizedDate.toISOString(),
      });
    },
    
   
     // Get patient count for a specific date and doctor
     
    getPatientCount: async (params) => {
      return api.get("/patients/count", {
        params,
        headers: { "Cache-Control": "no-cache" }
      });
    }
  };