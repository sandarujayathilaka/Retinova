import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AMD from "./pages/diseases/AMD";
import Diagnose from "./pages/diseases/Diagnose";
import DR from "./pages/diseases/DR";
import Glaucoma from "./pages/diseases/Glaucoma";
import MultiDiagnosePage from "./pages/diseases/MultiDiagnosePage";
import RVO from "./pages/diseases/RVO";
import DoctorsList from "./pages/doctors/List";
import Add from "./pages/doctors/New";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import { Roles } from "./constants/roles";
import ProtectedRoute from "./middleware/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Diagnose />} />

        {/* common routes - for all roles */}
        <Route
          element={
            <ProtectedRoute roles={[Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]} redirectPath="/404" />
          }
        >
          <Route path="/diagnose/dr" element={<DR />} />
          <Route path="/diagnose/amd" element={<AMD />} />
          <Route path="/diagnose/glaucoma" element={<Glaucoma />} />
          <Route path="/diagnose/rvo" element={<RVO />} />
          <Route path="/diagnose/multidr" element={<MultiDiagnosePage />} />

          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/add" element={<Add />} />
        </Route>

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
