
import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import {  DashboardHeader} from "../DashboardComponents/DashboardHeader";
import { 
  LoadingState
} from "../DashboardComponents/LoadingState";
import {  ErrorState} from "../DashboardComponents/ErrorState";
import {  GridLayout} from "../DashboardComponents/GridLayout";
import {  DashboardCard} from "../DashboardComponents/DashboardCard";



import PatientSummary from "../CommonFiles/PatientSummary";
import DoctorSchedule from "./DoctorSchedule";
import PatientTypeChart from "../CommonFiles/PatientTypeChart";
import DiseaseCategoriesChart from "../CommonFiles/DiseaseCategoriesChart";
import DiseaseStagesChart from "../CommonFiles/DiseaseStagesChart";
import LatestPatientsTable from "../CommonFiles/LatestPatientsTable";


const DOCTOR_ID = "67d7122bd060b20213da7cb1"; 


const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  const {
    doctor,
    patients,
    selectedDate,
    setSelectedDate,
    patientFilter,
    setPatientFilter,
    reviewPatientCounts,
    loading,
    isRefreshing,
    error,
    fetchData,
    patientsStatusData,
    diagnosesBarData,
    conditionsBarData
  } = useDashboard('doctor', DOCTOR_ID);


  const handleRefresh = () => fetchData(true);
  

  if (loading) {
    return <LoadingState message="Loading doctor dashboard..." />;
  }

 
  if (error && !doctor) {
    return <ErrorState error={error} onRetry={() => fetchData()} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
<div className="mx-auto px-4 sm:px-6 py-4 lg:mx-8 xl:mx-12">
       
        <DashboardHeader 
          title="Doctor Dashboard" 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
        />

        {/* First Row: Patient Summary, Doctor Schedule, Latest Patients Table */}
        <GridLayout columns="grid-cols-1 lg:grid-cols-3">

            <PatientSummary
              patients={patients}
              patientFilter={patientFilter}
              setPatientFilter={setPatientFilter}
              doctorId={DOCTOR_ID}
              className="h-full flex flex-col"
            />
 
          
            <DoctorSchedule
              doctor={doctor}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              reviewPatientCounts={reviewPatientCounts}
              className="h-full flex flex-col"
            />
          

            <LatestPatientsTable
              patients={patients}
              onSeeAll={() => navigate(`/doctors/${DOCTOR_ID}/patients`)}
              className="h-full flex flex-col"
            />
     
        </GridLayout>

        {/* Second Row: Patient Type Chart and Disease Categories Chart */}
        <GridLayout>
      
            <PatientTypeChart data={patientsStatusData} />
      
          

            <DiseaseCategoriesChart data={conditionsBarData} />
   
        </GridLayout>

        {/* Third Row: Disease Stages Chart */}
        <GridLayout columns="grid-cols-1">
        
            <DiseaseStagesChart data={diagnosesBarData} />
         
        </GridLayout>
      </div>
    </div>
  );
};


export default memo(DoctorDashboard);