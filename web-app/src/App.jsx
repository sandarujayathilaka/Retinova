import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Diagnose from "./pages/Diagnose";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";

const App = () => {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Diagnose />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
};

export default App;
