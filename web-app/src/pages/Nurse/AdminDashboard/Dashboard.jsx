
// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../../services/api.service";
// import { toast } from "react-hot-toast";
// import { 
//   ActivitySquare, 
//   Loader2,
//   RefreshCw
// } from "lucide-react";
// import DoctorSummary from "./DoctorSummary";
// import NurseSummary from "./NurseSummary";
// import PatientSummary from "../CommonFiles/PatientSummary";
// import StaffSchedule from "./StaffSchedule";
// import DoctorsStatusPieChart from "./DoctorsStatusPieChart";
// import NursesStatusPieChart from "./NursesStatusPieChart";
// import DoctorSpecialtiesChart from "./DoctorSpecialtiesChart";
// import NurseSpecialtiesChart from "./NurseSpecialtiesChart";
// import PatientTypeChart from "../../Nurse/CommonFiles/PatientTypeChart";
// import DiseaseCategoriesChart from "../../Nurse/CommonFiles/DiseaseCategoriesChart";
// import DiseaseStagesChart from "../../Nurse/CommonFiles/DiseaseStagesChart";
// import LatestDoctorsTable from "./LatestDoctorsTable";
// import LatestNursesTable from "./LatestNursesTable";
// import LatestPatientsTable from "../../Nurse/CommonFiles/LatestPatientsTable";
// import NurseSpecialtiesLineChart from "./NurseSpecialtiesLineChart";
// import DoctorSpecialtiesLineChart from "./DoctorSpecialtiesLineChart";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [doctors, setDoctors] = useState([]);
//   const [nurses, setNurses] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [doctorChartView, setDoctorChartView] = useState("specialties");
//   const [nurseChartView, setNurseChartView] = useState("specialties");
//   const [doctorFilter, setDoctorFilter] = useState("total");
//   const [nurseFilter, setNurseFilter] = useState("total");
//   const [patientFilter, setPatientFilter] = useState("total");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const fetchData = async (showRefreshing = false) => {
//     if (showRefreshing) {
//       setIsRefreshing(true);
//     } else {
//       setLoading(true);
//     }
    
//     try {
//       const [doctorsRes, nursesRes, patientsRes] = await Promise.all([
//         api.get("/dashboard/doctors?type=summary"),
//         api.get("/dashboard/doctors?type=summary"), // This would be nurses endpoint in production
//         api.get("/dashboard/patients?type=summary"),
//       ]);
      
//       setDoctors(doctorsRes.data.doctors);
//       setNurses(nursesRes.data.doctors); // Using doctors data for nurses temporarily
//       setPatients(patientsRes.data.patients);
      
//       if (showRefreshing) {
//         toast.success("Dashboard data refreshed successfully");
//       }
//     } catch (err) {
//       setError("Error fetching data. Please try again.");
//       toast.error("Error fetching data. Please try again.");
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchData();
//   }, []);
  
//   const handleRefresh = () => {
//     fetchData(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xl">
//           <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-700 font-medium">Loading dashboard data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xlmax-w-md">
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

//   const onlineDoctors = doctors.filter((doc) => doc.status).length;
//   const offlineDoctors = doctors.length - onlineDoctors;
//   const doctorsStatusData = [
//     { name: "Online", value: onlineDoctors, fill: "#34D399" },
//     { name: "Offline", value: offlineDoctors, fill: "#F87171" },
//   ];
//   const doctorsStatusConfig = {
//     Online: { label: "Online", color: "#34D399" },
//     Offline: { label: "Offline", color: "#F87171" },
//   };

//   const onlineNurses = nurses.filter((nurse) => nurse.status).length;
//   const offlineNurses = nurses.length - onlineNurses;
//   const nursesStatusData = [
//     { name: "Online", value: onlineNurses, fill: "#34D399" },
//     { name: "Offline", value: offlineNurses, fill: "#F87171" },
//   ];
//   const nursesStatusConfig = {
//     Online: { label: "Online", color: "#34D399" },
//     Offline: { label: "Offline", color: "#F87171" },
//   };

//   const patientsStatus = patients.reduce(
//     (acc, p) => {
//       const diagnoseCount = p.diagnoseHistory ? p.diagnoseHistory.length : 0;
//       const hasNextVisit = p.nextVisit && !isNaN(new Date(p.nextVisit).getTime());
//       const isNew = diagnoseCount <= 2 && !hasNextVisit;
//       const key = isNew ? "New Patients" : "Existing Patients";
//       const latestDate = diagnoseCount
//         ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
//         : new Date(p.createdAt).getTime();
//       acc[key].count += 1;
//       acc[key].dates.push(latestDate);
//       return acc;
//     },
//     {
//       "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
//       "Existing Patients": { count: 0, dates: [], fill: "#4338CA" },
//     }
//   );
  
//   const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, dates, fill }]) => ({
//     name,
//     value: count,
//     dates,
//     fill,
//   }));

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

//   return (
//     <div className="bg-gray-50 min-h-screen pb-1">
//       <div className="mx-auto px-4 sm:px-6 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
//             <ActivitySquare className="h-8 w-8 text-indigo-700" /> 
//             <span>Hospital Dashboard</span>
//           </h1>
//           <Button
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 rounded-lg px-6 py-2 text-white flex items-center gap-2 transition-all duration-200"
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

//         {/* Summary Cards Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
//           <div className="min-h-[500px]">
//             <DoctorSummary 
//               doctors={doctors} 
//               doctorFilter={doctorFilter} 
//               setDoctorFilter={setDoctorFilter} 
//               className="h-full" 
//             />
//           </div>
//           <div className="min-h-[500px]">
//             <NurseSummary 
//               nurses={nurses} 
//               nurseFilter={nurseFilter} 
//               setNurseFilter={setNurseFilter} 
//               className="h-full" 
//             />
//           </div>
//           <div className="min-h-[500px]">
//             <PatientSummary 
//               patients={patients} 
//               patientFilter={patientFilter} 
//               setPatientFilter={setPatientFilter} 
//               className="h-full" 
//             />
//           </div>
//           <div className="min-h-[500px]">
//             <StaffSchedule 
//               doctors={doctors} 
//               nurses={nurses} 
//               selectedDate={selectedDate} 
//               setSelectedDate={setSelectedDate} 
//               className="h-full" 
//             />
//           </div>
//         </div>

//         {/* Status Pie Charts Row */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="min-h-[400px]">
//             <DoctorsStatusPieChart 
//               data={doctorsStatusData} 
//               config={doctorsStatusConfig} 
//               doctors={doctors} 
//             />
//           </div>
//           <div className="min-h-[400px]">
//             <NursesStatusPieChart 
//               data={nursesStatusData} 
//               config={nursesStatusConfig} 
//               nurses={nurses} 
//             />
//           </div>
//         </div>

//         {/* Specialty Bar Charts Row */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="min-h-[450px]">
//             <DoctorSpecialtiesChart 
//               doctors={doctors} 
//               doctorChartView={doctorChartView} 
//               setDoctorChartView={setDoctorChartView} 
//             />
//           </div>
//           <div className="min-h-[450px]">
//             <NurseSpecialtiesChart 
//               nurses={nurses} 
//               nurseChartView={nurseChartView} 
//               setNurseChartView={setNurseChartView} 
//             />
//           </div>
//         </div>

//         {/* Specialty Line Charts Row */}
//         {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="min-h-[450px]">
//             <DoctorSpecialtiesLineChart 
//               doctors={doctors} 
//               doctorChartView={doctorChartView} 
//               setDoctorChartView={setDoctorChartView} 
//             />
//           </div>
//           <div className="min-h-[450px]">
//             <NurseSpecialtiesLineChart 
//               nurses={nurses} 
//               nurseChartView={nurseChartView} 
//               setNurseChartView={setNurseChartView} 
//             />
//           </div>
//         </div> */}

//         {/* Patient Charts Row */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="min-h-[450px]">
//             <PatientTypeChart data={patientsStatusData} />
//           </div>
//           <div className="min-h-[450px]">
//             <DiseaseCategoriesChart data={conditionsBarData} />
//           </div>
//         </div>

//         {/* Disease Stages Row */}
//         <div className="grid grid-cols-1 gap-6 mb-8">
//           <div className="min-h-[500px]">
//             <DiseaseStagesChart data={diagnosesBarData} />
//           </div>
//         </div>

//         {/* Latest Tables Row */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="min-h-[500px]">
//             <LatestDoctorsTable doctors={doctors} onSeeAll={() => navigate("/doctors")} />
//           </div>
//           <div className="min-h-[500px]">
//             <LatestNursesTable nurses={nurses} onSeeAll={() => navigate("/nurses")} />
//           </div>
//           <div className="min-h-[500px]">
//             <LatestPatientsTable patients={patients} onSeeAll={() => navigate("/patients")} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../../hooks/useDashboard";
// import { 
//   DashboardHeader, 
//   LoadingState, 
//   ErrorState, 
//   GridLayout, 
//   DashboardCard 
// } from "../../../components/DashboardComponents";
import {  DashboardHeader} from "../DashboardHeader";
import { 
  LoadingState
} from "../LoadingState";
import {  ErrorState} from "../ErrorState";
import {  GridLayout} from "../GridLayout";
import {  DashboardCard} from "../DashboardCard";
import DoctorSummary from "./DoctorSummary";
import NurseSummary from "./NurseSummary";
import PatientSummary from "../CommonFiles/PatientSummary";
import StaffSchedule from "./StaffSchedule";
import DoctorsStatusPieChart from "./DoctorsStatusPieChart";
import NursesStatusPieChart from "./NursesStatusPieChart";
import DoctorSpecialtiesChart from "./DoctorSpecialtiesChart";
import NurseSpecialtiesChart from "./NurseSpecialtiesChart";
import PatientTypeChart from "../../Nurse/CommonFiles/PatientTypeChart";
import DiseaseCategoriesChart from "../../Nurse/CommonFiles/DiseaseCategoriesChart";
import DiseaseStagesChart from "../../Nurse/CommonFiles/DiseaseStagesChart";
import LatestDoctorsTable from "./LatestDoctorsTable";
import LatestNursesTable from "./LatestNursesTable";
import LatestPatientsTable from "../../Nurse/CommonFiles/LatestPatientsTable";

/**
 * Admin Dashboard Component
 * Shows a comprehensive view of hospital operations
 */
const Dashboard = () => {
  const navigate = useNavigate();
  
  // Use the dashboard hook with 'admin' type
  const {
    doctors,
    nurses,
    patients,
    selectedDate,
    setSelectedDate,
    patientFilter,
    setPatientFilter,
    doctorFilter,
    setDoctorFilter,
    nurseFilter,
    setNurseFilter,
    doctorChartView,
    setDoctorChartView,
    nurseChartView,
    setNurseChartView,
    loading,
    isRefreshing,
    error,
    fetchData,
    doctorsStatusData,
    nursesStatusData,
    patientsStatusData,
    diagnosesBarData,
    conditionsBarData,
    doctorsStatusConfig,
    nursesStatusConfig
  } = useDashboard('admin');

  // Handle refresh button click
  const handleRefresh = () => fetchData(true);
  
  // Show loading state
  if (loading) {
    return <LoadingState message="Loading hospital dashboard..." />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={() => fetchData()} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-1">
      <div className="mx-auto px-4 sm:px-6 py-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          title="Hospital Dashboard" 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
        />

        {/* Summary Cards Row */}
        <GridLayout columns="grid-cols-1 lg:grid-cols-4">
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <DoctorSummary 
              doctors={doctors} 
              doctorFilter={doctorFilter} 
              setDoctorFilter={setDoctorFilter} 
              className="h-full" 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <NurseSummary 
              nurses={nurses} 
              nurseFilter={nurseFilter} 
              setNurseFilter={setNurseFilter} 
              className="h-full" 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <PatientSummary 
              patients={patients} 
              patientFilter={patientFilter} 
              setPatientFilter={setPatientFilter} 
              className="h-full" 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <StaffSchedule 
              doctors={doctors} 
              nurses={nurses} 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
              className="h-full" 
            />
          {/* </DashboardCard> */}
        </GridLayout>

        {/* Status Pie Charts Row */}
        <GridLayout>
          {/* <DashboardCard minHeight="min-h-[400px]"> */}
            <DoctorsStatusPieChart 
              data={doctorsStatusData} 
              config={doctorsStatusConfig} 
              doctors={doctors} 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[400px]"> */}
            <NursesStatusPieChart 
              data={nursesStatusData} 
              config={nursesStatusConfig} 
              nurses={nurses} 
            />
          {/* </DashboardCard> */}
        </GridLayout>

        {/* Specialty Bar Charts Row */}
        <GridLayout>
          {/* <DashboardCard minHeight="min-h-[450px]"> */}
            <DoctorSpecialtiesChart 
              doctors={doctors} 
              doctorChartView={doctorChartView} 
              setDoctorChartView={setDoctorChartView} 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[450px]"> */}
            <NurseSpecialtiesChart 
              nurses={nurses} 
              nurseChartView={nurseChartView} 
              setNurseChartView={setNurseChartView} 
            />
          {/* </DashboardCard> */}
        </GridLayout>

        {/* Patient Charts Row */}
        <GridLayout>
          {/* <DashboardCard minHeight="min-h-[450px]"> */}
            <PatientTypeChart data={patientsStatusData} />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[450px]"> */}
            <DiseaseCategoriesChart data={conditionsBarData} />
          {/* </DashboardCard> */}
        </GridLayout>

        {/* Disease Stages Row */}
        <GridLayout columns="grid-cols-1">
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <DiseaseStagesChart data={diagnosesBarData} />
          {/* </DashboardCard> */}
        </GridLayout>

        {/* Latest Tables Row */}
        <GridLayout columns="grid-cols-1 md:grid-cols-3">
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <LatestDoctorsTable 
              doctors={doctors} 
              onSeeAll={() => navigate("/doctors")} 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <LatestNursesTable 
              nurses={nurses} 
              onSeeAll={() => navigate("/nurses")} 
            />
          {/* </DashboardCard> */}
          
          {/* <DashboardCard minHeight="min-h-[500px]"> */}
            <LatestPatientsTable 
              patients={patients} 
              onSeeAll={() => navigate("/patients")} 
            />
          {/* </DashboardCard> */}
        </GridLayout>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(Dashboard);