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
import Dashboard from "./pages/Dashboard";
import MonitoringPatients from "./pages/Nurse/MonitoringPatients";
import PublishedPatients from "./pages/Nurse/PublishedPatients";
import AddPatient from "./pages/Nurse/AddPatient";
import View from "./pages/Nurse/View";
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
import NurseList from "@/pages/admin/NurseList";
import AdminList from "./pages/admin/AdminList";
import TestList from "./pages/admin/TestList";
// import AllPatientList from "./pages/testrecord/AllPatientList";

const App = () => {
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoringPatients" element={<MonitoringPatients />} />
          <Route path="/publishedPatients" element={<PublishedPatients />} />
          <Route path="/addPatient" element={<AddPatient />} />
          <Route path="/monitoringPatients/view/:id" element={<View />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnose/dr" element={<DR />} />
          <Route path="/diagnose/amd" element={<AMD />} />
          <Route path="/diagnose/glaucoma" element={<Glaucoma />} />
          <Route path="/diagnose/rvo" element={<RVO />} />
          <Route path="/diagnose/multidr" element={<MultiDiagnosePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/monitorpatients" element={<MonitoringPatientsPage />} />
          <Route path="/pre-monitoring-patients" element={<PreMonitoringPatientsPage />} />
          <Route path="/completed-patients" element={<CompletedPatientsPage />} />
          <Route path="/review-patients" element={<ReviewPatientsPage />} />

          <Route path="/doctors" element={<DoctorsList />} />
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
