import { api } from "../services/api.service";

export const patientService = {
    /**
     * Fetch patients with a specific status
     * @param {string} status - Patient status
     * @param {object} params - Query parameters
     * @returns {Promise} API response
     */
    fetchPatients: async (status, params = {}) => {
      return api.get("/patients", {
        params: {
          status,
          ...params
        }
      });
    },
    
    /**
     * Assign or update revisit details for a patient
     * @param {string} patientId - Patient ID
     * @param {string} doctorId - Doctor ID
     * @param {Date} revisitDate - Revisit date
     * @returns {Promise} API response
     */
    assignRevisit: async (patientId, doctorId, revisitDate) => {
      const normalizedDate = new Date(
        Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())
      );
      
      return api.put(`/patients/${patientId}/revisit`, {
        doctorId,
        revisitDate: normalizedDate.toISOString(),
      });
    },
    
    /**
     * Get patient count for a specific date and doctor
     * @param {object} params - Query parameters
     * @returns {Promise} API response
     */
    getPatientCount: async (params) => {
      return api.get("/patients/count", {
        params,
        headers: { "Cache-Control": "no-cache" }
      });
    }
  };