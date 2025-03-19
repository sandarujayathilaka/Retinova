import { useState, useEffect } from "react";
import { api } from "../services/api.service";
import { showErrorToast } from "../pages/utils/toastUtils";

const useReviewPatients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({ searchTerm: "", gender: "all" });

  const fetchReviewPatientsAndDoctors = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const patientResponse = await api.get("/patients", {
        params: {
          status: "Review",
          page,
          limit: pagination.limit,
          search: filters.searchTerm || undefined,
          gender: filters.gender === "all" ? undefined : filters.gender,
        },
      });
      if (!patientResponse.data || !Array.isArray(patientResponse.data.data.patients)) {
        throw new Error("Invalid patient API response format");
      }

      const doctorResponse = await api.get("/doctors/for-revisit");
      setPatients(patientResponse.data.data.patients);
      setPagination({
        currentPage: page,
        totalPages: patientResponse.data.data.pagination?.totalPages || 1,
        totalPatients: patientResponse.data.data.pagination?.totalPatients || patientResponse.data.data.patients.length,
        limit: pagination.limit,
      });
      setDoctors(doctorResponse.data.doctors || []);
    } catch (error) {
      const errorMessage = `Failed to load data: ${error.message}`;
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewPatientsAndDoctors(pagination.currentPage);
  }, [pagination.currentPage, filters.searchTerm, filters.gender, pagination.limit]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return {
    patients,
    setPatients,
    doctors,
    loading,
    error,
    pagination,
    setPagination,
    filters,
    updateFilters,
    fetchReviewPatientsAndDoctors,
  };
};

export default useReviewPatients;