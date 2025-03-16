// import { useState, useEffect } from "react";
// import { api } from "../../../services/api.service";
// import { toast } from "react-hot-toast";
// import PatientTable from "../CommonFiles/PatientTable";
// import PatientFilters from "../CommonFiles/PatientFilters";
// import PatientDetailsDialog from "./PatientDetailsDialog";
// import PaginationControls from "../CommonFiles/PaginationControls";

// const PublishedPatients = () => {
//   const [patients, setPatients] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedGender, setSelectedGender] = useState("all");
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalPatients: 0,
//     limit: 10,
//   });
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [selectedDoctorId, setSelectedDoctorId] = useState("");
//   const [revisitDate, setRevisitDate] = useState(null);
//   const [patientCounts, setPatientCounts] = useState({});

//   useEffect(() => {
//     let isMounted = true;
//     setLoading(true);

//     const fetchPublishedPatientsAndDoctors = async (page = 1) => {
//       try {
//         const patientResponse = await api.get("/patients", {
//           params: {
//             status: "Published",
//             page,
//             limit: pagination.limit,
//             search: searchTerm || undefined,
//             gender: selectedGender === "all" ? undefined : selectedGender,
//           },
//         });
//         if (!patientResponse.data || !Array.isArray(patientResponse.data.data.patients)) {
//           throw new Error("Invalid patient API response format");
//         }
//         if (isMounted) {
//           setPatients(patientResponse.data.data.patients);
//           setPagination(patientResponse.data.data.pagination || {
//             currentPage: page,
//             totalPages: patientResponse.data.data.pagination?.totalPages || 1,
//             totalPatients: patientResponse.data.data.pagination?.totalPatients || patientResponse.data.data.patients.length,
//             limit: pagination.limit,
//           });

//           const doctorIds = [
//             ...new Set(
//               patientResponse.data.data.patients
//                 .flatMap((p) => p.diagnoseHistory?.map((d) => d.doctorId) || [])
//                 .filter((id) => id)
//             ),
//           ];

//           if (doctorIds.length > 0) {
//             const doctorResponse = await api.post("/doctors/bulk", { doctorIds });
//             setDoctors(doctorResponse.data.doctors || []);
//           } else {
//             setDoctors([]);
//           }
//         }
//       } catch (error) {
//         console.error("Fetch Error:", error);
//         if (isMounted) {
//           setError(`Failed to load data: ${error.message}`);
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchPublishedPatientsAndDoctors(pagination.currentPage);

//     return () => {
//       isMounted = false;
//     };
//   }, [pagination.currentPage, searchTerm, selectedGender, pagination.limit]);

//   const fetchPatientCountForDate = async (date, doctorId) => {
//     if (!doctorId) return 0;
//     try {
//       const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//       const dateStr = utcDate.toISOString().split("T")[0];
//       const response = await api.get("/patients/count", {
//         params: {
//           patientStatus: "Review",
//           nextVisit: dateStr,
//           doctorId,
//         },
//         headers: { "Cache-Control": "no-cache" },
//       });
//       return response.data.count || 0;
//     } catch (error) {
//       toast.error("Error fetching patient count:", error);
//       return 0;
//     }
//   };

//   const handleAssignRevisit = (result) => {
//     console.log("handleAssignRevisit called in parent with result:", result);
//     if (result.error) {
//       toast.error(result.error);
//     } else if (result.success) {
//       toast.success(result.message); // Single success toast
//       setPatients((prev) => prev.filter((p) => p.patientId !== selectedPatient.patientId));
//       setPagination((prev) => ({
//         ...prev,
//         totalPatients: prev.totalPatients - 1,
//         totalPages: Math.ceil((prev.totalPatients - 1) / prev.limit),
//       }));
//       setSelectedPatient(null);
//       setSelectedDoctorId("");
//       setRevisitDate(null);
//       setPatientCounts({});
//     }
//   };

//   return (
//     <div className="bg-gray-100">
//       <div className="max-w-7xl mx-auto">
//         <PatientFilters
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           selectedGender={selectedGender}
//           setSelectedGender={setSelectedGender}
//           setPagination={setPagination}
//           title="Published Patients"
//         />
//         <PatientTable
//           patients={patients}
//           loading={loading}
//           error={error}
//           onViewPatient={(patient) => {
//             setSelectedPatient(patient);
//             const doctorIds = [...new Set(patient.diagnoseHistory?.map((d) => d.doctorId).filter((id) => id) || [])];
//             const latestDiagnosis = patient.diagnoseHistory
//               ?.slice()
//               .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
//             setSelectedDoctorId(latestDiagnosis?.doctorId || doctorIds[0] || "");
//             setRevisitDate(null);
//             setPatientCounts({});
//           }}
//         />
//         <PaginationControls
//           pagination={pagination}
//           onPageChange={(newPage) => setPagination((prev) => ({ ...prev, currentPage: newPage }))}
//         />
//         <PatientDetailsDialog
//           patient={selectedPatient}
//           doctors={doctors}
//           selectedDoctorId={selectedDoctorId}
//           setSelectedDoctorId={setSelectedDoctorId}
//           revisitDate={revisitDate}
//           setRevisitDate={setRevisitDate}
//           patientCounts={patientCounts}
//           setPatientCounts={setPatientCounts}
//           onClose={() => setSelectedPatient(null)}
//           onAssignRevisit={handleAssignRevisit}
//           fetchPatientCountForDate={fetchPatientCountForDate}
//         />
//       </div>
//     </div>
//   );
// };

// export default PublishedPatients;

import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PatientTable from "../CommonFiles/PatientTable";
import PatientFilters from "../CommonFiles/PatientFilters";
import PatientDetailsDialog from "./PatientDetailsDialog";
import PaginationControls from "../CommonFiles/PaginationControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Users, AlertCircle } from "lucide-react";

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

        const doctorResponse = await api.get("/doctors/for-revisit");
        if (isMounted) {
          setPatients(patientResponse.data.data.patients);
          setPagination(patientResponse.data.data.pagination || {
            currentPage: page,
            totalPages: patientResponse.data.data.pagination?.totalPages || 1,
            totalPatients: patientResponse.data.data.pagination?.totalPatients || patientResponse.data.data.patients.length,
            limit: pagination.limit,
          });
          setDoctors(doctorResponse.data.doctors || []);
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
    if (!doctorId || !date) return 0;
    try {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStr = utcDate.toISOString().split("T")[0];
      const response = await api.get("/patients/count", {
        params: {
          patientStatus: "Review", // Since we're assigning to Review status
          nextVisit: dateStr,
          doctorId,
        },
        headers: { "Cache-Control": "no-cache" },
      });
      return response.data.data.totalCount || 0; // Use totalCount from the updated response
    } catch (error) {
      console.error("Error fetching patient count:", error);
      toast.error(`Error fetching patient count: ${error.message}`);
      return 0;
    }
  };

  const handleAssignRevisit = (result) => {
    if (result.error) {
      toast.custom(
        (t) => (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="font-medium">{result.error}</div>
          </div>
        ),
        { duration: 4000 }
      );
    } else if (result.success) {
      toast.custom(
        (t) => (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl shadow-md flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-4 w-4 text-blue-700" />
            </div>
            <div className="font-medium">{result.message}</div>
          </div>
        ),
        { duration: 4000 }
      );
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
            
            {error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p>{error}</p>
              </div>
            ) : null}
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <PatientTable
                patients={patients}
                loading={loading}
                error={null}
                onViewPatient={(patient) => {
                  setSelectedPatient(patient);
                  const latestDiagnosis = patient.diagnoseHistory
                    ?.slice()
                    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
                  setSelectedDoctorId(latestDiagnosis?.doctorId || "");
                  setRevisitDate(null);
                  setPatientCounts({});
                }}
              />
            </div>
            
            <div className="mt-6">
              <PaginationControls
                pagination={pagination}
                onPageChange={(newPage) =>
                  setPagination((prev) => ({ ...prev, currentPage: newPage }))
                }
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