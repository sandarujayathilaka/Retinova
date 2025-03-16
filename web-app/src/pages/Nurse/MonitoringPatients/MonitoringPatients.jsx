// import React, { useEffect, useState } from "react";
// import { api } from "../../../services/api.service";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import PatientTable from "../CommonFiles/PatientTable";
// import PatientFilters from "../CommonFiles/PatientFilters";
// import PaginationControls from "../CommonFiles/PaginationControls";

// const MonitoringPatients = () => {
//   const [patients, setPatients] = useState([]);
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
//   const navigate = useNavigate();
//   const [hasShownToast, setHasShownToast] = useState(false); // Flag to prevent duplicate toasts

//   useEffect(() => {
//     let isMounted = true; // Flag to prevent state updates on unmounted component
//     setLoading(true);
//     setHasShownToast(false); // Reset toast flag on new effect run

//     const fetchMonitoringPatients = async (page = 1) => {
//       try {
//         const response = await api.get("/patients", {
//           params: {
//             status: "Monitoring",
//             page,
//             limit: pagination.limit,
//             search: searchTerm || undefined,
//             gender: selectedGender === "all" ? undefined : selectedGender,
//           },
//         });
//         console.log(response.data.data)
//         if (!response.data || !Array.isArray(response.data.data.patients)) {
//           throw new Error("Invalid API response format");
//         }

//         if (isMounted) {
//           setPatients(response.data.data.patients);
//           setPagination(response.data.data.pagination || {
//             currentPage: page,
//             totalPages: response.data.data.pagination?.totalPages || 1,
//             totalPatients: response.data.data.pagination?.totalPatients || response.data.data.patients.length,
//             limit: pagination.limit,
//           });
//         }
//       } catch (error) {
//         console.error("Fetch Error:", error);
//         if (isMounted && !hasShownToast) {
//           toast.error("Failed to fetch monitoring patients. Please try again.");
//           setError(`Failed to load patients: ${error.message}`);
//           setHasShownToast(true); // Mark toast as shown
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchMonitoringPatients(pagination.currentPage);

//     // Cleanup function to prevent state updates on unmounted component
//     return () => {
//       isMounted = false;
//     };
//   }, [pagination.currentPage, searchTerm, selectedGender, pagination.limit]); // Added pagination.limit to dependency array

//   const handleViewPatient = (patient) => {
//     const patientId = patient.patientId;
//     navigate(`/monitoring-patients/view/${patientId}`);
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
//           title="Monitoring Patients"
//         />
//         <PatientTable
//           patients={patients}
//           loading={loading}
//           error={error}
//           onViewPatient={handleViewPatient}
//         />
//         <PaginationControls
//           pagination={pagination}
//           onPageChange={(newPage) =>
//             setPagination((prev) => ({ ...prev, currentPage: newPage }))
//           }
//         />
//       </div>
//     </div>
//   );
// };

// export default MonitoringPatients;

import React, { useEffect, useState } from "react";
import { api } from "../../../services/api.service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PatientTable from "../CommonFiles/PatientTable";
import PatientFilters from "../CommonFiles/PatientFilters";
import PaginationControls from "../CommonFiles/PaginationControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, AlertCircle, Loader2 } from "lucide-react";

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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setHasShownToast(false);

    const fetchMonitoringPatients = async (page = 1) => {
      try {
        const response = await api.get("/patients", {
          params: {
            status: "Monitoring",
            page,
            limit: pagination.limit,
            search: searchTerm || undefined,
            gender: selectedGender === "all" ? undefined : selectedGender,
          },
        });
        
        if (!response.data || !Array.isArray(response.data.data.patients)) {
          throw new Error("Invalid API response format");
        }

        if (isMounted) {
          setPatients(response.data.data.patients);
          setPagination(response.data.data.pagination || {
            currentPage: page,
            totalPages: response.data.data.pagination?.totalPages || 1,
            totalPatients: response.data.data.pagination?.totalPatients || response.data.patients.length,
            limit: pagination.limit,
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        if (isMounted && !hasShownToast) {
          // Custom styled toast
          toast.custom(
            (t) => (
              <Card className="bg-red-50 text-red-800 p-3 rounded-xl border-2 border-red-200 shadow-xl">
                <CardContent className="p-2 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="font-medium">Failed to fetch monitoring patients. Please try again.</p>
                </CardContent>
              </Card>
            ),
            { duration: 4000 }
          );
          
          setError(`Failed to load patients: ${error.message}`);
          setHasShownToast(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMonitoringPatients(pagination.currentPage);

    return () => {
      isMounted = false;
    };
  }, [pagination.currentPage, searchTerm, selectedGender, pagination.limit]);

  const handleViewPatient = (patient) => {
    const patientId = patient.patientId;
    navigate(`/monitoring-patients/view/${patientId}`);
  };
// max-w-7xl 
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
              
              {/* Custom filters component styling will be managed in PatientFilters component */}
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
                error={error}
                onViewPatient={handleViewPatient}
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
      </div>
    </div>
  );
};

export default MonitoringPatients;