import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Stethoscope,
  Users,
  Activity,
  FileText,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Hospital,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, expandedSections, toggleSection }) => {
  const location = useLocation();

  const user = {
    name: "Dr. Anil Kumar",
    email: "anilkumar@ihsl.com",
    avatar: "https://github.com/shadcn.png",
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dashboard",
      isExpandable: false,
    },
    {
      title: "Diagnose",
      icon: Activity,
      url: "/",
      isExpandable: true,
      section: "diagnose",
      subItems: [
        { title: "Diagnose Home", url: "/" },
        { title: "DR", url: "/diagnose/dr" },
        { title: "AMD", url: "/diagnose/amd" },
        { title: "Glaucoma", url: "/diagnose/glaucoma" },
        { title: "RVO", url: "/diagnose/rvo" },
        { title: "Multi DR", url: "/diagnose/multidr" },
      ],
    },
    {
      title: "Patients",
      icon: Users,
      url: "/patients",
      isExpandable: true,
      section: "patients",
      subItems: [
        { title: "All Patients", url: "/patients" },
        { title: "Monitoring", url: "/monitorpatients" },
        { title: "Pre-Monitoring", url: "/pre-monitoring-patients" },
        { title: "Completed", url: "/completed-patients" },
        { title: "Review", url: "/review-patients" },
      ],
    },
    {
      title: "Nurse",
      icon: FileText,
      url: "/monitoringPatients",
      isExpandable: true,
      section: "nurse",
      subItems: [
        { title: "Admin Dashboard", url: "/dashboard" },
        { title: "Add Patient", url: "/add-patient" },
        { title: "Monitoring patients", url: "/monitoring-patients" },
        { title: "Published patients", url: "/published-patients" },
        { title: "Review patients", url: "/review-patients" },
        { title: "Doctor Dashboard", url: "/doctordashboard" },
      ],
    },
    {
      title: "Doctors",
      icon: Stethoscope,
      url: "/doctors",
      isExpandable: true,
      section: "doctors",
      subItems: [
        { title: "List", url: "/doctors" },
        { title: "Add Doctor", url: "/add" },
      ],
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-indigo-950 via-blue-900 to-indigo-900 text-white transition-all duration-500 ${
          isOpen ? "w-64" : "w-16"
        } shadow-2xl flex flex-col justify-between overflow-y-auto overflow-x-hidden`}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {isOpen && (
              <div className="flex items-center space-x-3">
                <Hospital className="h-8 w-8 text-indigo-300" />
                <div>
                  <h1 className="text-xl font-bold text-white">MediSys</h1>
                  <p className="text-xs text-indigo-200">Healthcare Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-indigo-700 transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          {navItems.map(item => (
            <div key={item.title} className="mb-2">
              <div
                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700/80 transition-all duration-300 cursor-pointer ${
                  location.pathname === item.url || expandedSections[item.section]
                    ? "bg-indigo-700/50"
                    : ""
                }`}
                onClick={() => item.isExpandable && toggleSection(item.section)}
              >
                <item.icon className="h-6 w-6 text-indigo-300" />
                {isOpen && (
                  <>
                    <Link to={item.url} className="flex-1 ml-3 text-sm font-medium">
                      {item.title}
                    </Link>
                    {item.isExpandable && (
                      <div>
                        {expandedSections[item.section] ? (
                          <ChevronDown className="h-5 w-5 text-indigo-300" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-indigo-300" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              {item.isExpandable && isOpen && expandedSections[item.section] && (
                <div className="pl-8 mt-1 space-y-1 animate-fade-in">
                  {item.subItems.map(subItem => (
                    <Link
                      key={subItem.title}
                      to={subItem.url}
                      className={`block p-2 text-sm text-indigo-200 rounded-lg hover:bg-indigo-600/50 transition-all duration-300 ${
                        location.pathname === subItem.url ? "bg-indigo-600/70" : ""
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-indigo-700/50">
          <div
            className={`flex items-center p-3 rounded-lg hover:bg-indigo-700/80 transition-all duration-300 ${
              !isOpen && "justify-center"
            }`}
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full border-2 border-indigo-400"
              />
              <span className="absolute bottom-0 right-0 h-5 w-5 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            {isOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-indigo-300">{user.email}</p>
              </div>
            )}
            {isOpen && (
              <button className="p-1 rounded-full hover:bg-indigo-600 transition-all duration-300">
                <LogOut className="h-5 w-5 text-indigo-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default Sidebar;
