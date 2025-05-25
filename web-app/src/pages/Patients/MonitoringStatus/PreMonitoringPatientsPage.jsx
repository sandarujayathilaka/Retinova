import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Filters from "../../../components/PatientsPage/Filters";
import PatientsTable from "../../../components/PatientsPage/PatientsTable";
import Pagination from "../../../components/PatientsPage/Pagination";
import { set } from "date-fns";
import { ErrorAlert } from "@/components/error/ErrorAlert";
import { api } from "@/services/api.service";



const PreMonitoringPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    patientsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "Pre-Monitoring", // Fixed status for Pre-Monitoring patients
  });
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPreMonitoringPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get("patients/status", {
        params: filters,
      });
      setPatients(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching Pre-Monitoring patients:", error);
      setError(error.response?.data?.error || "Error fetching Pre-Monitoring patients");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isInitialLoad) {
      fetchPreMonitoringPatients();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchPreMonitoringPatients();
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));
    fetchPreMonitoringPatients();
  };

const handleViewPatient = patientId => {
  navigate(`/patients/${patientId}`, { state: { referrer: "PreMonitoringPatientsPage" } });
};
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pre-Monitoring Patients</h1>
      {error && <ErrorAlert message={error} />}
      <Filters
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
      />
      <PatientsTable patients={patients} loading={loading} handleViewPatient={handleViewPatient} />
      <div className="mt-6">
      <Pagination  pagination={pagination} handlePageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default PreMonitoringPatientsPage;
