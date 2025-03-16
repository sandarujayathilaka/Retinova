import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.service";

export function useDoctors(options = {}) {
    const {
      endpoint = "/doctors/for-revisit",
      doctorIds = null
    } = options;
    
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchDoctors = useCallback(async () => {
      setLoading(true);
      
      try {
        let response;
        
        if (doctorIds && doctorIds.length > 0) {
          response = await api.post("/doctors/bulk", { doctorIds });
        } else {
          response = await api.get(endpoint);
        }
        
        setDoctors(response.data.doctors || []);
        return response.data.doctors;
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError(`Failed to load doctors: ${error.message}`);
        return [];
      } finally {
        setLoading(false);
      }
    }, [endpoint, doctorIds]);
    
    useEffect(() => {
      let isMounted = true;
      
      const loadDoctors = async () => {
        if (isMounted) {
          await fetchDoctors();
        }
      };
      
      loadDoctors();
      
      return () => {
        isMounted = false;
      };
    }, [fetchDoctors]);
    
    return {
      doctors,
      loading,
      error,
      refreshDoctors: fetchDoctors
    };
  }
  