import React, { useState, useEffect, useCallback,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PatientTable from "../../CommonFiles/PatientTable";
import PatientFilters from "../../CommonFiles/PatientFilters";
import PaginationControls from "../../CommonFiles/PaginationControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, AlertCircle, Loader2 } from "lucide-react";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils"; 

const MonitoringPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10,
  });
  
  const navigate = useNavigate();
  const [hasShownToast, setHasShownToast] = useState(false);
  const isFetching = useRef(false); 

  // Data fetching with useCallback for memoization
  const fetchMonitoringPatients = useCallback(async (page = 1) => {
    if (isFetching.current) return; 
    isFetching.current = true;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/patients", {
        params: {
          status: "Monitoring",
          page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          gender: selectedGender === "all" ? undefined : selectedGender,
        },
        headers: { "Cache-Control": "no-cache" },
      });
      
      if (!response.data || !Array.isArray(response.data.data.patients)) {
        throw new Error("Invalid API response format");
      }

      setPatients(response.data.data.patients);
      setPagination(prev => ({
        currentPage: page,
        totalPages: response.data.data.pagination?.totalPages || 1,
        totalPatients: response.data.data.pagination?.totalPatients || response.data.data.patients.length,
        limit: prev.limit,
      }));
      
      setHasShownToast(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      if (!hasShownToast) {
        showErrorToast("Failed to fetch monitoring patients. Please try again.");
        setHasShownToast(true);
      }
      setError(`Failed to load patients: ${error.message}`);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [pagination.limit, searchTerm, selectedGender]);

  
  useEffect(() => {
    fetchMonitoringPatients(pagination.currentPage);
  }, [pagination.currentPage, fetchMonitoringPatients]);


  useEffect(() => {
    fetchMonitoringPatients(1);
  }, [searchTerm, selectedGender, fetchMonitoringPatients]);

  // Memoize handler functions to prevent unnecessary re-renders
  const handleViewPatient = useCallback((patient) => {
    const patientId = patient.patientId;
    navigate(`/monitoring-patients/view/${patientId}`);
  }, [navigate]);
  
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    setHasShownToast(false); 
  }, []);

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mx-auto">
        <Card className="rounded-3xl overflow-hidden border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-8 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Monitoring Patients
                  </CardTitle>
                  <p className="text-blue-200 mt-2 font-medium">
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading patients...
                      </span>
                    ) : (
                      `Total: ${pagination.totalPatients} patient${pagination.totalPatients !== 1 ? 's' : ''}`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <PatientFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              setPagination={(newState) => setPagination(prev => ({ ...prev, currentPage: 1 }))}
              title=""
              customClass="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm mb-6"
            />
            
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <PatientTable
                patients={patients}
                loading={loading}
                error={error}
                onViewPatient={handleViewPatient}
                showStatus={true}
                showStatusColumn={false}
                tableType="monitoring"
              />
            </div>
            
            <div className="mt-6">
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
                customClass="flex justify-center"
                buttonClass="h-10 w-10 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium flex items-center justify-center"
                activeButtonClass="bg-indigo-600 hover:bg-indigo-700 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringPatients;