import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    diagnose: true,
    patients: false,
    nurse: false,
    doctors: false,
  });

  // Detect screen size and set sidebar accordingly
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setIsMobile(!isLargeScreen);
      setIsOpen(isLargeScreen);
    };

    // Set initial state
    handleResize();

    // Add event listener with debounce for better performance
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);

    // Clean up
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-white">
      {/* Always render the sidebar for desktop, but use CSS to control visibility on mobile */}
      <div className={`${isMobile && !isOpen ? "hidden" : "block"}`}>
        <Sidebar
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        <div
          className={`
            p-4 md:p-6 transition-all duration-500 ease-in-out
            ${!isMobile && (isOpen ? "ml-72" : "ml-20")}
          `}
        >
          <Outlet />
        </div>
      </div>

      {/* Floating Mobile Sidebar Toggle */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default AdminLayout;
