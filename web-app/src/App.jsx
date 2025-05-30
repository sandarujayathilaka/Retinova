import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AMD from "./pages/diseases/singleDignose/AMD";
import Diagnose from "./components/singleDiagnose/Diagnose";
import DR from "./pages/diseases/singleDignose/DR";
import Glaucoma from "./pages/diseases/singleDignose/Glaucoma";
import MultiDiagnosePage from "./pages/diseases/MultiDiagnose/MultiDiagnosePage";
import PatientsPage from "./pages/Patients/getAllPatients";
import PatientProfile from "./pages/Patients/PatientProfile";
import Test from "./pages/diseases/Test";
import MonitoringPatientsPage from "./pages/Patients/MonitoringStatus/MonitoringPatientsPage";
import PreMonitoringPatientsPage from "./pages/Patients/MonitoringStatus/PreMonitoringPatientsPage";
import CompletedPatientsPage from "./pages/Patients/MonitoringStatus/CompletedPatientsPage";
import ReviewPatientsPage from "./pages/Patients/MonitoringStatus/ReviewPatientsPage";
import Dashboard from "./pages/admin/AdminDashboard/Dashboard";
import MonitoringPatients from "./pages/Nurse/MonitoringPatients/MonitoringPatients";
import PublishedPatients from "./pages/Nurse/PublishedPatients/PublishedPatients";
import AddPatient from "./pages/Nurse/AddPatient/AddPatient";
import View from "./pages/Nurse/View/ViewPatient";
import RVO from "./pages/diseases/singleDignose/RVO";
import DoctorsList from "@/pages/admin/DoctorList.jsx";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import { ROLES } from "./constants/roles";
import ProtectedRoute from "./middleware/ProtectedRoute";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
// import PatientProfile from "./pages/testrecord/PatientProfile";
import TestRecords from "./pages/testrecord/TestRecords";
import NurseProfile from "./pages/Nurse/NurseProfile";
import NurseDashboard from "./pages/Nurse/NurseDashboard";
import NurseList from "@/pages/admin/NurseList";
import AdminList from "./pages/admin/AdminList";
import TestList from "./pages/admin/TestList";
// import AllPatientList from "./pages/testrecord/AllPatientList";
import DoctorDashboard from "./pages/DoctorDashboard/DoctorDashboard";
import AddPatientWizard from "./pages/Nurse/AddPatient/AddPatientWizard";
import ReviewPatients from "./pages/Nurse/ReviewPatients/ReviewPatients";
import UserList from "./pages/admin/UserList";
import AllNursePatients from "./pages/Nurse/AllPatients/AllPatients";
import MultiAMD from "./pages/diseases/MultiDiagnose/MultiAMD";
import MultiRVO from "./pages/diseases/MultiDiagnose/MultiRVO";
import MultiGlaucoma from "./pages/diseases/MultiDiagnose/MultiGlaucoma";

const App = () => {
  const SAMPLE_NURSE_ID = "67d1eec052a3868b43b617d3"; // Replace with a real ID
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* admin routes */}
        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} redirectPath="/404" />}>
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/nurses" element={<NurseList />} />
          <Route path="/admins" element={<AdminList />} />
          <Route path="/tests" element={<TestList />} />
          <Route path="/users" element={<UserList />} />
        </Route>

        {/* doctor routes */}
        <Route element={<ProtectedRoute roles={[ROLES.DOCTOR]} redirectPath="/404" />}>
          <Route path="/doctordashboard" element={<DoctorDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnose/dr" element={<DR />} />
          <Route path="/diagnose/amd" element={<AMD />} />
          <Route path="/diagnose/glaucoma" element={<Glaucoma />} />
          <Route path="/diagnose/rvo" element={<RVO />} />
          <Route path="/diagnose/multidr" element={<MultiDiagnosePage />} />
          <Route path="/diagnose/multiamd" element={<MultiAMD />} />
          <Route path="/diagnose/multirvo" element={<MultiRVO />} />
          <Route path="/diagnose/multiglaucoma" element={<MultiGlaucoma />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/monitorpatients" element={<MonitoringPatientsPage />} />
          <Route path="/pre-monitoring-patients" element={<PreMonitoringPatientsPage />} />
          <Route path="/completed-patients" element={<CompletedPatientsPage />} />
          <Route path="/review-patients-profile" element={<ReviewPatientsPage />} />
        </Route>

        {/* nurese routes */}
        <Route element={<ProtectedRoute roles={[ROLES.NURSE]} redirectPath="/404" />}>
          <Route path="/monitoring-patients" element={<MonitoringPatients />} />
          <Route path="/published-patients" element={<PublishedPatients />} />
          <Route path="/review-patients" element={<ReviewPatients />} />
          <Route path="/addPatientt" element={<AddPatient />} />
          <Route path="/add-patient" element={<AddPatientWizard />} />
          <Route path="/monitoring-patients/view/:id" element={<View />} />
          <Route path="/all-patients" element={<AllNursePatients />} />
          <Route path="/all-patients/view/:id" element={<View />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/patient/:patientId/test-records" element={<TestRecords />} />
          <Route path="/nursedashboard" element={<NurseDashboard />} />
          <Route path="/profile" element={<NurseProfile nurseId={SAMPLE_NURSE_ID} />} />
        </Route>

        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
