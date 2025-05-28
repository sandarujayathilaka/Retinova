import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, RefreshCw, AlertCircle } from "lucide-react";
import Filters from "../../components/PatientsPage/Filters";
import PatientsTable from "../../components/PatientsPage/PatientsTable";
import Pagination from "../../components/PatientsPage/Pagination";
import { ErrorAlert } from "@/components/error/ErrorAlert";
import { api } from "@/services/api.service";

const PatientsPage = () => {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch patients with current filters
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get("patients/getallpatients", {
        params: filters,
      });
      setPatients(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching patients:", error.response.data.error);
      setError(error.response.data.error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Reset all filters if reset button is clicked
    if (name === 'resetAll') {
      setFilters({
        page: 1,
        limit: 10,
        category: "",
        gender: "",
        ageMin: "",
        ageMax: "",
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return;
    }
    
    // Otherwise, update the specific filter
    setFilters(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset to page 1 when filters change
      ...(name !== 'page' && { page: 1 })
    }));
  };

  // Handle search button click
  const handleSearch = () => {
    fetchPatients();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Navigate to patient details
  const handleViewPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="p-2 mr-3 bg-indigo-100 rounded-full shadow-sm">
              <Users className="w-6 h-6 text-indigo-800" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Patient Records</h1>
          </div>
          
          <button 
            onClick={fetchPatients} 
            className="flex items-center justify-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-sm self-start sm:self-auto"
          >
            <RefreshCw size={16} className="mr-2" />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
        <ErrorAlert message={error} />
        )}
        
        {/* Filters */}
        <Filters 
          filters={filters} 
          handleFilterChange={handleFilterChange} 
          handleSearch={handleSearch} 
        />
        
        {/* Patients Table */}
        <PatientsTable 
          patients={patients} 
          loading={loading} 
          handleViewPatient={handleViewPatient} 
        />
        
        {/* Pagination - only show if not loading and we have patients */}
        {!loading && patients.length > 0 && (
          <div className="mt-6">
            <Pagination 
              pagination={pagination} 
              handlePageChange={handlePageChange} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;