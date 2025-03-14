import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PatientTable from "../CommonFiles/PatientTable";
import PatientFilters from "../CommonFiles/PatientFilters";
import PatientDetailsDialog from "./PatientDetailsDialog";
import PaginationControls from "../CommonFiles/PaginationControls";

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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchPublishedPatientsAndDoctors = async (page = 1) => {
      try {
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
        if (isMounted) {
          setPatients(patientResponse.data.data.patients);
          setPagination(patientResponse.data.data.pagination || {
            currentPage: page,
            totalPages: patientResponse.data.data.pagination?.totalPages || 1,
            totalPatients: patientResponse.data.data.pagination?.totalPatients || patientResponse.data.data.patients.length,
            limit: pagination.limit,
          });

          const doctorIds = [
            ...new Set(
              patientResponse.data.data.patients
                .flatMap((p) => p.diagnoseHistory?.map((d) => d.doctorId) || [])
                .filter((id) => id)
            ),
          ];

          if (doctorIds.length > 0) {
            const doctorResponse = await api.post("/doctors/bulk", { doctorIds });
            setDoctors(doctorResponse.data.doctors || []);
          } else {
            setDoctors([]);
          }
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        if (isMounted) {
          setError(`Failed to load data: ${error.message}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPublishedPatientsAndDoctors(pagination.currentPage);

    return () => {
      isMounted = false;
    };
  }, [pagination.currentPage, searchTerm, selectedGender, pagination.limit]);

  const fetchPatientCountForDate = async (date, doctorId) => {
    if (!doctorId) return 0;
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
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching patient count:", error);
      return 0;
    }
  };

  const handleAssignRevisit = (result) => {
    console.log("handleAssignRevisit called in parent with result:", result);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.message); // Single success toast
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
  };

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <PatientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          setPagination={setPagination}
          title="Published Patients"
        />
        <PatientTable
          patients={patients}
          loading={loading}
          error={error}
          onViewPatient={(patient) => {
            setSelectedPatient(patient);
            const doctorIds = [...new Set(patient.diagnoseHistory?.map((d) => d.doctorId).filter((id) => id) || [])];
            const latestDiagnosis = patient.diagnoseHistory
              ?.slice()
              .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
            setSelectedDoctorId(latestDiagnosis?.doctorId || doctorIds[0] || "");
            setRevisitDate(null);
            setPatientCounts({});
          }}
        />
        <PaginationControls
          pagination={pagination}
          onPageChange={(newPage) => setPagination((prev) => ({ ...prev, currentPage: newPage }))}
        />
        <PatientDetailsDialog
          patient={selectedPatient}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          setSelectedDoctorId={setSelectedDoctorId}
          revisitDate={revisitDate}
          setRevisitDate={setRevisitDate}
          patientCounts={patientCounts}
          setPatientCounts={setPatientCounts}
          onClose={() => setSelectedPatient(null)}
          onAssignRevisit={handleAssignRevisit}
          fetchPatientCountForDate={fetchPatientCountForDate}
        />
      </div>
    </div>
  );
};

export default PublishedPatients;