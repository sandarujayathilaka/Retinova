import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Diagnose from "./pages/diseases/Diagnose";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import DR from "./pages/diseases/DR";
import Glaucoma from "./pages/diseases/Glaucoma";
import RVO from "./pages/diseases/RVO";
import AMD from "./pages/diseases/AMD";
import { Toaster } from "react-hot-toast";
import PatientProfile from "./pages/testrecord/PatientProfile";
import TestRecords from "./pages/testrecord/TestRecords";
import AllPatientList from "./pages/testrecord/AllPatientList";

const App = () => {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Diagnose />} />

          <Route path="/diagnose/dr" element={<DR />} />
          <Route path="/diagnose/amd" element={<AMD />} />
          <Route path="/diagnose/glaucoma" element={<Glaucoma />} />
          <Route path="/diagnose/rvo" element={<RVO />} />

       



          <Route path="/allp" element={<AllPatientList />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/patient/:patientId/test-records" element={<TestRecords />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
};

export default App;
