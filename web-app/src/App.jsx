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
import DoctorsList from "./pages/doctors/List";
import Add from "./pages/doctors/New";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Diagnose />} />
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
          <Route path="/add" element={<Add />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </AdminLayout>
    </BrowserRouter>
  );
};

export default App;
