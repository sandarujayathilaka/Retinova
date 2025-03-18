import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AMD from "./pages/diseases/AMD";
import Diagnose from "./pages/diseases/Diagnose";
import DR from "./pages/diseases/DR";
import Glaucoma from "./pages/diseases/Glaucoma";
import MultiDiagnosePage from "./pages/diseases/MultiDiagnosePage";
import PatientsPage from "./pages/PatientsPage";
import PatientProfile from "./pages/PatientProfile";
import Test from "./pages/diseases/Test";
import MonitoringPatientsPage from "./pages/MonitoringPatientsPage";
import PreMonitoringPatientsPage from "./pages/PreMonitoringPatientsPage";
import CompletedPatientsPage from "./pages/CompletedPatientsPage";
import ReviewPatientsPage from "./pages/ReviewPatientsPage";
import Dashboard from "./pages/admin/AdminDashboard/Dashboard";
import MonitoringPatients from "./pages/nurse/MonitoringPatients/MonitoringPatients";
import PublishedPatients from "./pages/nurse/PublishedPatients/PublishedPatients";
import AddPatient from "./pages/nurse/AddPatient/AddPatient";
import View from "./pages/nurse/View/ViewPatient";
import RVO from "./pages/diseases/RVO";
import DoctorsList from "@/pages/admin/DoctorList.jsx";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import { Roles } from "./constants/roles";
import ProtectedRoute from "./middleware/ProtectedRoute";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
// import PatientProfile from "./pages/testrecord/PatientProfile";
import TestRecords from "./pages/testrecord/TestRecords";
import NurseProfile from "./pages/nurse/NurseProfile";
import NurseDashboard from "./pages/nurse/NurseDashboard";
import NurseList from "@/pages/admin/NurseList";
import AdminList from "./pages/admin/AdminList";
import TestList from "./pages/admin/TestList";
// import AllPatientList from "./pages/testrecord/AllPatientList";
import DoctorDashboard from "./pages/DoctorDashboard/DoctorDashboard";
import AddPatientWizard from "./pages/nurse/AddPatient/AddPatientWizard";
import ReviewPatients from "./pages/nurse/ReviewPatients/ReviewPatients";
import AllNursePatients from "./pages/nurse/AllPatients/AllPatients";
import MultiAMD from "./pages/diseases/MultiAMD";

const App = () => {
  const SAMPLE_NURSE_ID = "67d1eec052a3868b43b617d3"; // Replace with a real ID
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* common routes - for all roles */}
        <Route
          element={
            <ProtectedRoute roles={[Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]} redirectPath="/404" />
          }
        >
          <Route path="/" element={<Diagnose />} />
          <Route path="/monitoring-patients" element={<MonitoringPatients />} />
          <Route path="/published-patients" element={<PublishedPatients />} />
          <Route path="/review-patients" element={<ReviewPatients />} />
          <Route path="/all-patients" element={<AllNursePatients />} />
          {/* <Route path="/addPatientt" element={<AddPatient />} /> */}
          <Route path="/add-patient" element={<AddPatientWizard />} />
          <Route path="/monitoring-patients/view/:id" element={<View />} />
          <Route path="/all-patients/view/:id" element={<View />} />
          
          <Route path="/doctordashboard" element={<DoctorDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnose/dr" element={<DR />} />
          <Route path="/diagnose/amd" element={<AMD />} />
          <Route path="/diagnose/glaucoma" element={<Glaucoma />} />
          <Route path="/diagnose/rvo" element={<RVO />} />
          <Route path="/diagnose/multidr" element={<MultiDiagnosePage />} />
          <Route path="/diagnose/amd/multi" element={<MultiAMD />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/monitorpatients" element={<MonitoringPatientsPage />} />
          <Route path="/pre-monitoring-patients" element={<PreMonitoringPatientsPage />} />
          <Route path="/completed-patients" element={<CompletedPatientsPage />} />
          <Route path="/review-patients" element={<ReviewPatientsPage />} />

          <Route path="/doctors" element={<DoctorsList />} />

          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/patient/:patientId/test-records" element={<TestRecords />} />

          <Route path="/nursedashboard" element={<NurseDashboard />} />
          <Route path="/profile" element={<NurseProfile nurseId={SAMPLE_NURSE_ID} />} />
          {/* <Route path="/profile/:nurseId" element={<NurseProfileWrapper />} /> */}
          <Route path="/nurses" element={<NurseList />} />
          <Route path="/admins" element={<AdminList />} />
          <Route path="/tests" element={<TestList />} />
        </Route>

        {/* <Route path="/allp" element={<AllPatientList />} /> */}
        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route path="/patient/:patientId/test-records" element={<TestRecords />} />

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
