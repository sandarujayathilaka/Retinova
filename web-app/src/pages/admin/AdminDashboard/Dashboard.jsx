

import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../../hooks/useDashboard";
import {  DashboardHeader} from "../../DashboardComponents/DashboardHeader";
import { 
  LoadingState
} from "../../DashboardComponents/LoadingState";
import {  ErrorState} from "../../DashboardComponents/ErrorState";
import {  GridLayout} from "../../DashboardComponents/GridLayout";
import {  DashboardCard} from "../../DashboardComponents/DashboardCard";
import DoctorSummary from "./DoctorSummary";
import NurseSummary from "./NurseSummary";
import PatientSummary from "../../CommonFiles/PatientSummary";
import StaffSchedule from "./StaffSchedule";
import DoctorsStatusPieChart from "./DoctorsStatusPieChart";
import NursesStatusPieChart from "./NursesStatusPieChart";
import DoctorSpecialtiesChart from "./DoctorSpecialtiesChart";
import NurseSpecialtiesChart from "./NurseSpecialtiesChart";
import PatientTypeChart from "../../CommonFiles/PatientTypeChart";
import DiseaseCategoriesChart from "../../CommonFiles/DiseaseCategoriesChart";
import DiseaseStagesChart from "../../CommonFiles/DiseaseStagesChart";
import LatestDoctorsTable from "./LatestDoctorsTable";
import LatestNursesTable from "./LatestNursesTable";
import LatestPatientsTable from "../../CommonFiles/LatestPatientsTable";


const Dashboard = () => {
  const navigate = useNavigate();
  

  const {
    doctors,
    nurses,
    patients,
    selectedDate,
    setSelectedDate,
    allDoctorsReviewCounts,
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


  const handleRefresh = () => fetchData(true);
  

  if (loading) {
    return <LoadingState message="Loading hospital dashboard..." />;
  }


  if (error) {
    return <ErrorState error={error} onRetry={() => fetchData()} />;
  }
console.log(allDoctorsReviewCounts)

  return (
<div className="bg-gray-50 min-h-screen">
<div className="mx-auto py-4">
  
        <DashboardHeader 
          title="Hospital Dashboard" 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
        />

 
        <GridLayout columns="grid-cols-1 lg:grid-cols-4">

            <DoctorSummary 
              doctors={doctors} 
              doctorFilter={doctorFilter} 
              setDoctorFilter={setDoctorFilter} 
              className="h-full" 
            />
  
          
       
            <NurseSummary 
              nurses={nurses} 
              nurseFilter={nurseFilter} 
              setNurseFilter={setNurseFilter} 
              className="h-full" 
            />
 
          
    
            <PatientSummary 
              patients={patients} 
              patientFilter={patientFilter} 
              setPatientFilter={setPatientFilter} 
              className="h-full" 
            />
    
          
     
            <StaffSchedule 
              doctors={doctors} 
              nurses={nurses} 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
              reviewCounts={allDoctorsReviewCounts}
              className="h-full" 
            />
        
        </GridLayout>


        {/* <GridLayout>
       
            <DoctorsStatusPieChart 
              data={doctorsStatusData} 
              config={doctorsStatusConfig} 
              doctors={doctors} 
            />

          
  
            <NursesStatusPieChart 
              data={nursesStatusData} 
              config={nursesStatusConfig} 
              nurses={nurses} 
            />
 
        </GridLayout> */}


        <GridLayout>

            <DoctorSpecialtiesChart 
              doctors={doctors} 
              doctorChartView={doctorChartView} 
              setDoctorChartView={setDoctorChartView} 
            />

          
  
            <NurseSpecialtiesChart 
              nurses={nurses} 
              nurseChartView={nurseChartView} 
              setNurseChartView={setNurseChartView} 
            />
         
        </GridLayout>

    
        <GridLayout>
  
            <PatientTypeChart data={patientsStatusData} />
  
          
  
            <DiseaseCategoriesChart data={conditionsBarData} />
 
        </GridLayout>

     
        <GridLayout columns="grid-cols-1">
    
            <DiseaseStagesChart data={diagnosesBarData} />
     
        </GridLayout>

 
        <GridLayout columns="grid-cols-1 md:grid-cols-3">
    
            <LatestDoctorsTable 
              doctors={doctors} 
              onSeeAll={() => navigate("/doctors")} 
            />

          

            <LatestNursesTable 
              nurses={nurses} 
              onSeeAll={() => navigate("/nurses")} 
            />

          
      
            <LatestPatientsTable 
              patients={patients} 
              onSeeAll={() => navigate("/patients")} 
            />
   
        </GridLayout>
      </div>
    </div>
  );
};


export default memo(Dashboard);