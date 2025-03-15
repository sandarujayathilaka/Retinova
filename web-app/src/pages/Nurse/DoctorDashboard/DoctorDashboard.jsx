// // import React, { useEffect, useState } from "react";

// // import { Button } from "@/components/ui/button";
// // import { useNavigate } from "react-router-dom";
// // import { api } from "../../../services/api.service";
// // import { toast } from "react-hot-toast";
// // import { Activity, Loader2,SquareActivityIcon } from "lucide-react";
// // import PatientSummary from "../CommonFiles/PatientSummary";
// // import DoctorSchedule from "./DoctorSchedule";
// // import PatientTypeChart from "../CommonFiles/PatientTypeChart";
// // import DiseaseCategoriesChart from "../CommonFiles/DiseaseCategoriesChart";
// // import DiseaseStagesChart from "../CommonFiles/DiseaseStagesChart";
// // import LatestPatientsTable from "../CommonFiles/LatestPatientsTable";

// // const DoctorDashboard = () => {
// //   const navigate = useNavigate();
// //   const [doctor, setDoctor] = useState(null);
// //   const [patients, setPatients] = useState([]); // Default to empty array
// //   const [selectedDate, setSelectedDate] = useState(new Date());
// //   const [patientFilter, setPatientFilter] = useState("total");
// //   const [reviewPatientCounts, setReviewPatientCounts] = useState({});
// //   const [loading, setLoading] = useState(true); // Track loading state
// //   const [error, setError] = useState(null); // Track errors for doctor fetch
// //   const id = "67cc3fd45e6d4c9cd4a602d5"; // Doctor ID

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setLoading(true); // Start loading
// //       try {
// //         const [doctorRes, patientsRes] = await Promise.all([
// //           api.get(`/doctors/${id}`),
// //           api.get(`/doctors/${id}/patients?type=summary`),
// //         ]);

// //         setDoctor(doctorRes.data);
// //         const patientData = patientsRes.data.data?.patients || [];
// //         setPatients(patientData);

// //         const reviewCounts = patientData.reduce((acc, patient) => {
// //           if (patient.patientStatus?.toLowerCase() === "review" && patient.nextVisit) {
// //             const visitDate = new Date(patient.nextVisit).toLocaleDateString("en-US", {
// //               year: "numeric",
// //               month: "2-digit",
// //               day: "2-digit",
// //             });
// //             acc[visitDate] = (acc[visitDate] || 0) + 1;
// //           }
// //           return acc;
// //         }, {});
// //         setReviewPatientCounts(reviewCounts);

// //         if (patientData.length === 0) {
// //           toast("No patients found for this doctor.");
// //         }
// //       } catch (error) {
// //         if (error.response) {
// //           const status = error.response.status;
// //           const message = error.response.data.message || error.response.data.error || "An error occurred";
// //           if (status === 404) {
// //             if (message === "Doctor not found") {
// //               setError("Doctor not found. Please check the doctor ID and try again.");
// //               toast.error("Doctor not found. Please check the doctor ID and try again.");
// //             } else {
// //               toast.error(message);
// //             }
// //           } else if (status === 400) {
// //             toast.error(message || "Invalid request. Please check the parameters and try again.");
// //           } else if (status === 500) {
// //             toast.error("Server error. Please try again later.");
// //           } else {
// //             toast.error(message || "An error occurred while fetching data.");
// //           }
// //         } else if (error.request) {
// //           toast.error("No response from the server. Please check your network connection and try again.");
// //         } else {
// //           toast.error("An error occurred while setting up the request. Please try again.");
// //         }
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [id]);

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
// //       </div>
// //     );
// //   }

// //   if (error && !doctor) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <p className="text-red-500 text-lg">{error}</p>
// //       </div>
// //     );
// //   }

// //   const patientsStatus = patients.reduce(
// //     (acc, p) => {
// //       const isNew = p.isNew;
// //       const key = isNew ? "New Patients" : "Existing Patients";
// //       acc[key].count += 1;
// //       acc[key].dates.push(
// //         p.diagnoseHistory.length
// //           ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
// //           : new Date(p.createdAt).getTime()
// //       );
// //       return acc;
// //     },
// //     {
// //       "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
// //       "Existing Patients": { count: 0, dates: [], fill: "#FBBF24" },
// //     }
// //   );
// //   const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, fill, dates }]) => ({
// //     name,
// //     value: count,
// //     fill,
// //     dates,
// //   }));

// //   const conditionsByDate = patients.reduce((acc, p) => {
// //     p.diagnoseHistory.forEach((record) => {
// //       const date = new Date(record.uploadedAt).toLocaleDateString();
// //       if (!acc[date]) acc[date] = {};
// //       acc[date][record.diagnosis] = (acc[date][record.diagnosis] || 0) + 1;
// //     });
// //     return acc;
// //   }, {});
// //   const conditionsBarData = Object.entries(conditionsByDate).flatMap(([date, diagnoses], index) =>
// //     Object.entries(diagnoses).map(([diagnose, value]) => ({
// //       date,
// //       stage: diagnose,
// //       value,
// //       fill: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 4],
// //     }))
// //   );

// //   const diagnosesByDate = patients.reduce((acc, p) => {
// //     p.diagnoseHistory.forEach((diag) => {
// //       const date = new Date(diag.uploadedAt).toLocaleDateString();
// //       if (!acc[date]) acc[date] = {};
// //       acc[date][diag.diagnosis] = (acc[date][diag.diagnosis] || 0) + 1;
// //     });
// //     return acc;
// //   }, {});
// //   const diagnosesBarData = Object.entries(diagnosesByDate).flatMap(([date, diagnoses], index) =>
// //     Object.entries(diagnoses).map(([diagnosis, value]) => ({
// //       date,
// //       disease: diagnosis,
// //       value,
// //       fill: ["#6366F1", "#EC4899", "#14B8A6", "#F97316"][index % 4],
// //     }))
// //   );

// //   return (
// //     <div className="bg-gray-100 min-h-screen flex justify-center">
// //       <div className="space-y-8 p-6 w-full">
// //         {/* Header */}
// //         <div className="flex items-center justify-between">
// //           <h1 className="text-3xl font-extrabold text-teal-700 flex items-center gap-2">
// //             <SquareActivityIcon className="h-8 w-8" /> Doctor Dashboard
// //           </h1>
// //           <Button
// //             onClick={() => navigate(`/doctors/${id}`)}
// //             className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md"
// //           >
// //             Refresh Data
// //           </Button>
// //         </div>

// //         {/* First Row: Patient Summary, Doctor Schedule, Latest Patients Table */}
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px] lg:min-h-[450px]">
// //           <div className="h-full">
// //             <PatientSummary
// //               patients={patients}
// //               patientFilter={patientFilter}
// //               setPatientFilter={setPatientFilter}
// //               className="h-full flex flex-col"
// //             />
// //           </div>
// //           <div className="h-full">
// //             <DoctorSchedule
// //               doctor={doctor}
// //               selectedDate={selectedDate}
// //               setSelectedDate={setSelectedDate}
// //               reviewPatientCounts={reviewPatientCounts}
// //               className="h-full flex flex-col"
// //             />
// //           </div>
// //           <div className="h-full">
// //             <LatestPatientsTable
// //               patients={patients}
// //               onSeeAll={() => navigate(`/doctors/${id}/patients`)}
// //               className="h-full flex flex-col"
// //             />
// //           </div>
// //         </div>

// //         {/* Second Row: Patient Type Chart and Disease Categories Chart */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //           <PatientTypeChart data={patientsStatusData} />
// //           <DiseaseCategoriesChart data={conditionsBarData} />
// //         </div>

// //         {/* Third Row: Disease Stages Chart */}
// //         <div className="grid grid-cols-1 gap-6">
// //           <DiseaseStagesChart data={diagnosesBarData} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DoctorDashboard;




// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../../services/api.service";
// import { toast } from "react-hot-toast";
// import { 
//   ActivitySquare, 
//   Loader2, 
//   RefreshCw, 
//   PieChart, 
//   BarChart3, 
//   Users, 
//   Calendar,
//   LineChart
// } from "lucide-react";
// import PatientSummary from "../CommonFiles/PatientSummary";
// import DoctorSchedule from "./DoctorSchedule";
// import PatientTypeChart from "../CommonFiles/PatientTypeChart";
// import DiseaseCategoriesChart from "../CommonFiles/DiseaseCategoriesChart";
// import DiseaseStagesChart from "../CommonFiles/DiseaseStagesChart";
// import LatestPatientsTable from "../CommonFiles/LatestPatientsTable";

// const DoctorDashboard = () => {
//   const navigate = useNavigate();
//   const [doctor, setDoctor] = useState(null);
//   const [patients, setPatients] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [patientFilter, setPatientFilter] = useState("total");
//   const [reviewPatientCounts, setReviewPatientCounts] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const id = "67cc3fd45e6d4c9cd4a602d5";

//   const fetchData = async (showRefreshing = false) => {
//     if (showRefreshing) {
//       setIsRefreshing(true);
//     } else {
//       setLoading(true);
//     }
    
//     try {
//       const [doctorRes, patientsRes] = await Promise.all([
//         api.get(`/doctors/${id}`),
//         api.get(`/doctors/${id}/patients?type=summary`),
//       ]);

//       setDoctor(doctorRes.data);
//       const patientData = patientsRes.data.data?.patients || [];
//       setPatients(patientData);

//       const reviewCounts = patientData.reduce((acc, patient) => {
//         if (patient.patientStatus?.toLowerCase() === "review" && patient.nextVisit) {
//           const visitDate = new Date(patient.nextVisit).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//           });
//           acc[visitDate] = (acc[visitDate] || 0) + 1;
//         }
//         return acc;
//       }, {});
//       setReviewPatientCounts(reviewCounts);

//       if (patientData.length === 0) {
//         toast("No patients found for this doctor.");
//       }
      
//       if (showRefreshing) {
//         toast.success("Dashboard data refreshed successfully");
//       }
//     } catch (error) {
//       if (error.response) {
//         const status = error.response.status;
//         const message = error.response.data.message || error.response.data.error || "An error occurred";
//         if (status === 404) {
//           if (message === "Doctor not found") {
//             setError("Doctor not found. Please check the doctor ID and try again.");
//             toast.error("Doctor not found. Please check the doctor ID and try again.");
//           } else {
//             toast.error(message);
//           }
//         } else if (status === 400) {
//           toast.error(message || "Invalid request. Please check the parameters and try again.");
//         } else if (status === 500) {
//           toast.error("Server error. Please try again later.");
//         } else {
//           toast.error(message || "An error occurred while fetching data.");
//         }
//       } else if (error.request) {
//         toast.error("No response from the server. Please check your network connection and try again.");
//       } else {
//         toast.error("An error occurred while setting up the request. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const handleRefresh = () => {
//     fetchData(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-700 font-medium">Loading doctor dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !doctor) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
//           <div className="text-red-500 text-lg mb-4 font-medium">{error}</div>
//           <Button 
//             onClick={() => fetchData()}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white"
//           >
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const patientsStatus = patients.reduce(
//     (acc, p) => {
//       const isNew = p.isNew;
//       const key = isNew ? "New Patients" : "Existing Patients";
//       acc[key].count += 1;
//       acc[key].dates.push(
//         p.diagnoseHistory.length
//           ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
//           : new Date(p.createdAt).getTime()
//       );
//       return acc;
//     },
//     {
//       "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
//       "Existing Patients": { count: 0, dates: [], fill: "#4338CA" },
//     }
//   );
  
//   const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, fill, dates }]) => ({
//     name,
//     value: count,
//     fill,
//     dates,
//   }));

//   const conditionsByDate = patients.reduce((acc, p) => {
//     p.diagnoseHistory.forEach((record) => {
//       const date = new Date(record.uploadedAt).toLocaleDateString();
//       if (!acc[date]) acc[date] = {};
//       acc[date][record.diagnosis] = (acc[date][record.diagnosis] || 0) + 1;
//     });
//     return acc;
//   }, {});
  
//   const conditionsBarData = Object.entries(conditionsByDate).flatMap(([date, diagnoses], index) =>
//     Object.entries(diagnoses).map(([diagnose, value]) => ({
//       date,
//       stage: diagnose,
//       value,
//       fill: ["#1E40AF", "#4338CA", "#312E81", "#1E3A8A"][index % 4],
//     }))
//   );

//   const diagnosesByDate = patients.reduce((acc, p) => {
//     p.diagnoseHistory.forEach((diag) => {
//       const date = new Date(diag.uploadedAt).toLocaleDateString();
//       if (!acc[date]) acc[date] = {};
//       acc[date][diag.diagnosis] = (acc[date][diag.diagnosis] || 0) + 1;
//     });
//     return acc;
//   }, {});
  
//   const diagnosesBarData = Object.entries(diagnosesByDate).flatMap(([date, diagnoses], index) =>
//     Object.entries(diagnoses).map(([diagnosis, value]) => ({
//       date,
//       disease: diagnosis,
//       value,
//       fill: ["#1E3A8A", "#312E81", "#4338CA", "#3730A3"][index % 4],
//     }))
//   );

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <div className="mx-auto px-4 sm:px-6 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
//             <ActivitySquare className="h-8 w-8 text-indigo-700" /> 
//             <span>Doctor Dashboard</span>
//           </h1>
//           <Button
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 rounded-lg px-6 py-2 text-white shadow-md flex items-center gap-2 transition-all duration-200"
//           >
//             {isRefreshing ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 <span>Refreshing...</span>
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Refresh Data</span>
//               </>
//             )}
//           </Button>
//         </div>

//         {/* First Row: Patient Summary, Doctor Schedule, Latest Patients Table */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           <div className="h-full">
         
//               <PatientSummary
//                 patients={patients}
//                 patientFilter={patientFilter}
//                 setPatientFilter={setPatientFilter}
//                 className="h-full flex flex-col"
//               />
//             </div>

//           <div className="h-full">
//             <DoctorSchedule
//               doctor={doctor}
//               selectedDate={selectedDate}
//               setSelectedDate={setSelectedDate}
//               reviewPatientCounts={reviewPatientCounts}
//               className="h-full flex flex-col"
//             />
//           </div>
//           <div className="h-full">
          
//               <LatestPatientsTable
//                 patients={patients}
//                 onSeeAll={() => navigate(`/doctors/${id}/patients`)}
//                 className="h-full flex flex-col"
//               />
      
//            </div>
//         </div>

//         {/* Second Row: Patient Type Chart and Disease Categories Chart */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
//             <div className="h-full">
//               <PatientTypeChart data={patientsStatusData} />
//             </div>
      
//             <div className="h-full">
//               <DiseaseCategoriesChart data={conditionsBarData} />
//             </div>
   
//         </div>

//         {/* Third Row: Disease Stages Chart */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          
//           <div className="h-full">
//             <DiseaseStagesChart data={diagnosesBarData} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import { 
  ActivitySquare, 
  Loader2, 
  RefreshCw, 
  PieChart, 
  BarChart3, 
  Users, 
  Calendar,
  LineChart
} from "lucide-react";
import PatientSummary from "../CommonFiles/PatientSummary";
import DoctorSchedule from "./DoctorSchedule";
import PatientTypeChart from "../CommonFiles/PatientTypeChart";
import DiseaseCategoriesChart from "../CommonFiles/DiseaseCategoriesChart";
import DiseaseStagesChart from "../CommonFiles/DiseaseStagesChart";
import LatestPatientsTable from "../CommonFiles/LatestPatientsTable";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patientFilter, setPatientFilter] = useState("total");
  const [reviewPatientCounts, setReviewPatientCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const id = "67cc3fd45e6d4c9cd4a602d5";

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const [doctorRes, patientsRes] = await Promise.all([
        api.get(`/doctors/${id}`),
        api.get(`/doctors/${id}/patients?type=summary`),
      ]);

      setDoctor(doctorRes.data);
      const patientData = patientsRes.data.data?.patients || [];
      setPatients(patientData);

      const reviewCounts = patientData.reduce((acc, patient) => {
        if (patient.patientStatus?.toLowerCase() === "review" && patient.nextVisit) {
          const visitDate = new Date(patient.nextVisit).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          acc[visitDate] = (acc[visitDate] || 0) + 1;
        }
        return acc;
      }, {});
      setReviewPatientCounts(reviewCounts);

      if (patientData.length === 0) {
        toast("No patients found for this doctor.");
      }
      
      if (showRefreshing) {
        toast.success("Dashboard data refreshed successfully");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message || error.response.data.error || "An error occurred";
        if (status === 404) {
          if (message === "Doctor not found") {
            setError("Doctor not found. Please check the doctor ID and try again.");
            toast.error("Doctor not found. Please check the doctor ID and try again.");
          } else {
            toast.error(message);
          }
        } else if (status === 400) {
          toast.error(message || "Invalid request. Please check the parameters and try again.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(message || "An error occurred while fetching data.");
        }
      } else if (error.request) {
        toast.error("No response from the server. Please check your network connection and try again.");
      } else {
        toast.error("An error occurred while setting up the request. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-lg mb-4 font-medium">{error}</div>
          <Button 
            onClick={() => fetchData()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const patientsStatus = patients.reduce(
    (acc, p) => {
      const isNew = p.isNew;
      const key = isNew ? "New Patients" : "Existing Patients";
      acc[key].count += 1;
      acc[key].dates.push(
        p.diagnoseHistory.length
          ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
          : new Date(p.createdAt).getTime()
      );
      return acc;
    },
    {
      "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
      "Existing Patients": { count: 0, dates: [], fill: "#4338CA" },
    }
  );
  
  const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, fill, dates }]) => ({
    name,
    value: count,
    fill,
    dates,
  }));

  const conditionsByDate = patients.reduce((acc, p) => {
    p.diagnoseHistory.forEach((record) => {
      const date = new Date(record.uploadedAt).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      acc[date][record.diagnosis] = (acc[date][record.diagnosis] || 0) + 1;
    });
    return acc;
  }, {});
  
  const conditionsBarData = Object.entries(conditionsByDate).flatMap(([date, diagnoses], index) =>
    Object.entries(diagnoses).map(([diagnose, value]) => ({
      date,
      stage: diagnose,
      value,
      fill: ["#1E40AF", "#4338CA", "#312E81", "#1E3A8A"][index % 4],
    }))
  );

  const diagnosesByDate = patients.reduce((acc, p) => {
    p.diagnoseHistory.forEach((diag) => {
      const date = new Date(diag.uploadedAt).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      acc[date][diag.diagnosis] = (acc[date][diag.diagnosis] || 0) + 1;
    });
    return acc;
  }, {});
  
  const diagnosesBarData = Object.entries(diagnosesByDate).flatMap(([date, diagnoses], index) =>
    Object.entries(diagnoses).map(([diagnosis, value]) => ({
      date,
      disease: diagnosis,
      value,
      fill: ["#1E3A8A", "#312E81", "#4338CA", "#3730A3"][index % 4],
    }))
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-1">
      <div className="mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
            <ActivitySquare className="h-8 w-8 text-indigo-700" /> 
            <span>Doctor Dashboard</span>
          </h1>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 rounded-lg px-6 py-2 text-white shadow-md flex items-center gap-2 transition-all duration-200"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </>
            )}
          </Button>
        </div>

        {/* First Row: Patient Summary, Doctor Schedule, Latest Patients Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Each card has a fixed minimum height to ensure consistent display */}
          <div className="min-h-[500px]">
            <PatientSummary
              patients={patients}
              patientFilter={patientFilter}
              setPatientFilter={setPatientFilter}
              doctorId={id}
              className="h-full flex flex-col"
            />
          </div>
          <div className="min-h-[500px]">
            <DoctorSchedule
              doctor={doctor}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              reviewPatientCounts={reviewPatientCounts}
              className="h-full flex flex-col"
            />
          </div>
          <div className="min-h-[500px]">
            <LatestPatientsTable
              patients={patients}
              onSeeAll={() => navigate(`/doctors/${id}/patients`)}
              className="h-full flex flex-col"
            />
          </div>
        </div>

        {/* Second Row: Patient Type Chart and Disease Categories Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Each chart has a fixed minimum height to ensure proper display */}
          <div className="min-h-[600px]">
            <PatientTypeChart data={patientsStatusData} />
          </div>
          <div className="min-h-[600px]">
            <DiseaseCategoriesChart data={conditionsBarData} />
          </div>
        </div>

        {/* Third Row: Disease Stages Chart */}
        <div className="grid grid-cols-1 gap-6">
          {/* Extra height for the disease stages chart */}
          <div className="min-h-[600px]">
            <DiseaseStagesChart data={diagnosesBarData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;