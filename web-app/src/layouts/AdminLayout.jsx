import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    diagnose: true,
    patients: false,
    nurse: false,
    doctors: false,
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 transition-all duration-500 ${
          isOpen ? "ml-64" : "ml-16"
        } bg-gradient-to-br from-blue-50 via-gray-100 to-white`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
