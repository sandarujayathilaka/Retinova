import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.service";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";


export function usePatientData(status, options = {}) {
    const {
      searchTerm = "",
      gender = "all",
      page = 1,
      limit = 10,
    } = options;
    
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasShownToast, setHasShownToast] = useState(false);
    const [pagination, setPagination] = useState({
      currentPage: page,
      totalPages: 1,
      totalPatients: 0,
      limit,
    });
    
    const fetchPatients = useCallback(async (currentPage = pagination.currentPage) => {
      setLoading(true);
      setHasShownToast(false);
      
      try {
        const response = await api.get("/patients", {
          params: {
            status,
            page: currentPage,
            limit: pagination.limit,
            search: searchTerm || undefined,
            gender: gender === "all" ? undefined : gender,
          },
        });
        
        if (!response.data || !Array.isArray(response.data.data.patients)) {
          throw new Error("Invalid API response format");
        }
        
        setPatients(response.data.data.patients);
        setPagination({
          currentPage,
          totalPages: response.data.data.pagination?.totalPages || 1,
          totalPatients: response.data.data.pagination?.totalPatients || response.data.data.patients.length,
          limit: pagination.limit,
        });
        
        return response.data.data;
      } catch (error) {
        console.error("Fetch Error:", error);
        
        const errorMessage = `Failed to fetch ${status} patients: ${error.message}`;
        setError(errorMessage);
        
        if (!hasShownToast) {
          toast.custom((t) => (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl border-2 border-red-200 shadow-xl">
              <div className="p-2 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            </div>
          ), { duration: 4000 });
          setHasShownToast(true);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    }, [status, searchTerm, gender, pagination.limit, hasShownToast]);
    
    useEffect(() => {
      let isMounted = true;
      
      const fetchData = async () => {
        if (isMounted) {
          await fetchPatients(pagination.currentPage);
        }
      };
      
      fetchData();
      
      return () => {
        isMounted = false;
      };
    }, [fetchPatients, pagination.currentPage]);
    
    const changePage = useCallback((newPage) => {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }, []);
    
    return {
      patients,
      setPatients,
      loading,
      error,
      pagination,
      changePage,
      refreshPatients: fetchPatients
    };
  }