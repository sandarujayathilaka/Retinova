import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PatientTable from "../../CommonFiles/PatientTable";
import PatientFilters from "../../CommonFiles/PatientFilters";
import PatientDetailsDialog from "./PatientDetailsDialog";
import PaginationControls from "../../CommonFiles/PaginationControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";

const PublishedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [revisitDate, setRevisitDate] = useState(null);
  const [patientCounts, setPatientCounts] = useState({});
  const [hasShownToast, setHasShownToast] = useState(false);
  const isFetching = useRef(false);

  const fetchPublishedPatientsAndDoctors = useCallback(
    async (page = 1) => {
      if (isFetching.current) return; 
      isFetching.current = true;

      try {
        setLoading(true);
        setError(null);

        const patientResponse = await api.get("/patients", {
          params: {
            status: "Published",
            page,
            limit: pagination.limit,
            search: searchTerm || undefined,
            gender: selectedGender === "all" ? undefined : selectedGender,
          },
        });

        if (!patientResponse.data || !Array.isArray(patientResponse.data.data.patients)) {
          throw new Error("Invalid patient API response format");
        }

        const doctorResponse = await api.get("/doctors/for-revisit", {
          headers: { "Cache-Control": "no-cache" },
        });

        setPatients(patientResponse.data.data.patients);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: patientResponse.data.data.pagination?.totalPages || 1,
          totalPatients: patientResponse.data.data.pagination?.totalPatients || patientResponse.data.data.patients.length,
        }));
        setDoctors(doctorResponse.data.doctors || []);
        setHasShownToast(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        if (!hasShownToast) {
          showErrorToast("Failed to load data. Please try again.");
          setHasShownToast(true);
        }
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [pagination.limit, searchTerm, selectedGender]
  );

 
  useEffect(() => {
    fetchPublishedPatientsAndDoctors(pagination.currentPage);
  }, [pagination.currentPage, fetchPublishedPatientsAndDoctors]);

  
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchPublishedPatientsAndDoctors(1);
  }, [searchTerm, selectedGender, fetchPublishedPatientsAndDoctors]);

  const fetchPatientCountForDate = useCallback(
    async (date, doctorId) => {
      if (!doctorId || !date) return 0;

      try {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dateStr = utcDate.toISOString().split("T")[0];

        const response = await api.get("/patients/count", {
          params: {
            patientStatus: "Review",
            nextVisit: dateStr,
            doctorId,
          },
          headers: { "Cache-Control": "no-cache" },
        });

        return response.data.data.totalCount || 0;
      } catch (error) {
        console.error("Error fetching patient count:", error);
        if (!hasShownToast) {
          showErrorToast(`Error fetching patient count: ${error.message}`);
          setHasShownToast(true);
        }
        return 0;
      }
    },
    []
  );

  const handleAssignRevisit = useCallback(
    (result) => {
      if (result.error) {
        showErrorToast(result.error);
      } else if (result.success) {
        showSuccessToast(result.message);
        setPatients((prev) => prev.filter((p) => p.patientId !== selectedPatient.patientId));
        setPagination((prev) => ({
          ...prev,
          totalPatients: prev.totalPatients - 1,
          totalPages: Math.ceil((prev.totalPatients - 1) / prev.limit),
        }));
        setSelectedPatient(null);
        setSelectedDoctorId("");
        setRevisitDate(null);
        setPatientCounts({});
      }
    },
    [selectedPatient]
  );

  const handleViewPatient = useCallback(
    (patient) => {
      setSelectedPatient(patient);
      const latestDiagnosis = patient.diagnoseHistory
        ?.slice()
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
      setSelectedDoctorId(latestDiagnosis?.doctorId || "");
      setRevisitDate(null);
      setPatientCounts({});
    },
    []
  );

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
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
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Published Patients
                  </CardTitle>
                  <p className="text-blue-200 mt-2 font-medium">
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading patients...
                      </span>
                    ) : (
                      `Total: ${pagination.totalPatients} patient${pagination.totalPatients !== 1 ? "s" : ""}`
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
              setPagination={setPagination}
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
                tableType="published"
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

        <PatientDetailsDialog
          patient={selectedPatient}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          setSelectedDoctorId={setSelectedDoctorId}
          revisitDate={revisitDate}
          setRevisitDate={setRevisitDate}
          patientCounts={patientCounts}
          setPatientCounts={setPatientCounts}
          onClose={() => {
            setSelectedPatient(null);
            setSelectedDoctorId("");
            setRevisitDate(null);
            setPatientCounts({});
          }}
          onAssignRevisit={handleAssignRevisit}
          fetchPatientCountForDate={fetchPatientCountForDate}
        />
      </div>
    </div>
  );
};

export default PublishedPatients;