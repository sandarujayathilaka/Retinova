import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Filters from "../components/PatientsPage/Filters";
import PatientsTable from "../components/PatientsPage/PatientsTable";
import Pagination from "../components/PatientsPage/Pagination";

const MonitoringPatientsPage = () => {
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
    status: "Monitoring", // Fixed status for Monitoring patients
  });
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  const fetchMonitoringPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/patients/status", {
        params: filters,
      });
      setPatients(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching Monitoring patients:", error);
      alert("Failed to fetch Monitoring patients");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isInitialLoad) {
      fetchMonitoringPatients();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchMonitoringPatients();
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));
    fetchMonitoringPatients();
  };

  const handleViewPatient = patientId => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Monitoring Patients</h1>
        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleSearch={handleSearch}
        />
        <PatientsTable
          patients={patients}
          loading={loading}
          handleViewPatient={handleViewPatient}
        />
        <Pagination pagination={pagination} handlePageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default MonitoringPatientsPage;
