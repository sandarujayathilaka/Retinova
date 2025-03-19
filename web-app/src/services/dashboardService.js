import { api } from "./api.service";


// Service for dashboard-related API calls

export const dashboardService = {

  //Fetch doctor data by ID
  getDoctorById: async (doctorId) => {
    return api.get(`/doctors/${doctorId}`);
  },
  
 
   //Fetch doctor's patients

  getDoctorPatients: async (doctorId, params = { type: 'summary' }) => {
    return api.get(`/doctors/${doctorId}/patients`, { params });
  },
  

   // Fetch admin dashboard doctors
 
  getAdminDoctors: async (params = { type: 'summary' }) => {
    return api.get('/dashboard/doctors', { params });
  },
  

   // Fetch admin dashboard nurses
 
  getAdminNurses: async (params = { type: 'summary' }) => {
    return api.get('/dashboard/nurses', { params });
  },
  

   // Fetch admin dashboard patients
 
  getAdminPatients: async (params = { type: 'summary' }) => {
    return api.get('/dashboard/patients', { params });
  },
  

   // Fetch patient count by date and doctor
 
  getPatientCountByDate: async (doctorId, date, status = 'Review') => {
    const dateString = date instanceof Date ? 
      date.toISOString().split('T')[0] : 
      date;
    
    return api.get('/ophthalmic-patients/count', {
      params: {
        doctorId,
        nextVisit: dateString,
        patientStatus: status
      },
      headers: { "Cache-Control": "no-cache" }
    });
  }
};


// Process API error and return standardized error message
 
export const processApiError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data.message || error.response.data.error || "An error occurred";
    
    if (status === 404) {
      if (message === "Doctor not found") {
        return "Doctor not found. Please check the doctor ID and try again.";
      }
      return message;
    } else if (status === 400) {
      return message || "Invalid request. Please check the parameters and try again.";
    } else if (status === 500) {
      return "Server error. Please try again later.";
    } else {
      return message || "An error occurred while fetching data.";
    }
  } else if (error.request) {
    return "No response from the server. Please check your network connection and try again.";
  } else {
    return "An error occurred while setting up the request. Please try again.";
  }
};


// Display toast notification for API errors

export const handleApiError = (error, toast, setError = null) => {
  const errorMessage = processApiError(error);
  
  if (setError) {
    setError(errorMessage);
  }
  
  toast.error(errorMessage);
};