import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Stethoscope,
  Users,
  Activity,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  Hospital,
  Shield,
  FlaskConical,
  Users2,
} from "lucide-react";
import { ROLES } from "@/constants/roles"; // Ensure path is correct
import { FaUserNurse } from "react-icons/fa";
import useUserStore from "@/stores/auth";

const Sidebar = ({ isOpen, toggleSidebar, expandedSections, toggleSection }) => {
  const location = useLocation();

  const { user: userData, logout } = useUserStore();

  console.log(userData);

  const user = {
    name: userData?.name,
    email: userData?.email,
    avatar: userData?.image?.Location,
    role: userData?.role,
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dashboard",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
    },
    {
      title: "Diagnose",
      icon: Activity,
      isExpandable: true,
      section: "diagnose",
      allowedRoles: [ROLES.DOCTOR],
      subItems: [
        {
          title: "DR",
          section: "dr",
          allowedRoles: [ROLES.DOCTOR],
          subItems: [
            { title: "Single Image", url: "/diagnose/dr", allowedRoles: [ROLES.DOCTOR] },
            { title: "Multi Image", url: "/diagnose/multidr", allowedRoles: [ROLES.DOCTOR] },
          ],
        },
        {
          title: "AMD",
          section: "amd",
          allowedRoles: [ROLES.DOCTOR],
          subItems: [
            { title: "Single Image", url: "/diagnose/amd", allowedRoles: [ROLES.DOCTOR] },
            { title: "Multi Image", url: "/diagnose/multiamd", allowedRoles: [ROLES.DOCTOR] },
          ],
        },
        {
          title: "RVO",
          section: "rvo",
          allowedRoles: [ROLES.DOCTOR],
          subItems: [
            { title: "Single Image", url: "/diagnose/rvo", allowedRoles: [ROLES.DOCTOR] },
            { title: "Multi Image", url: "/diagnose/multirvo", allowedRoles: [ROLES.DOCTOR] },
          ],
        },
        {
          title: "Glaucoma",
          section: "glaucoma",
          allowedRoles: [ROLES.DOCTOR],
          subItems: [
            { title: "Single Image", url: "/diagnose/glaucoma", allowedRoles: [ROLES.DOCTOR] },
            { title: "Multi Image", url: "/diagnose/multiglaucoma", allowedRoles: [ROLES.DOCTOR] },
          ],
        },
      ],
    },
    {
      title: "Patients",
      icon: Users,
      isExpandable: true,
      section: "patients",
      allowedRoles: [ROLES.DOCTOR],
      subItems: [
        { title: "All Patients", url: "/patients", allowedRoles: [ROLES.DOCTOR] },
        { title: "Monitoring", url: "/monitorpatients", allowedRoles: [ROLES.DOCTOR] },
        { title: "Pre-Monitoring", url: "/pre-monitoring-patients", allowedRoles: [ROLES.DOCTOR] },
        { title: "Completed", url: "/completed-patients", allowedRoles: [ROLES.DOCTOR] },
        { title: "Review", url: "/review-patients-profile", allowedRoles: [ROLES.DOCTOR] },
      ],
    },
    {
      title: "Nurse Dashboard",
      icon: FileText,
      isExpandable: true,
      section: "nurse",
      allowedRoles: [ROLES.NURSE],
      subItems: [
        { title: "Admin Dashboard", url: "/dashboard", allowedRoles: [ROLES.NURSE] },
        { title: "Add Patient", url: "/add-patient", allowedRoles: [ROLES.NURSE] },
        { title: "All Patients", url: "/all-patients", allowedRoles: [ROLES.NURSE] },
        { title: "Monitoring patients", url: "/monitoring-patients", allowedRoles: [ROLES.NURSE] },
        { title: "Published patients", url: "/published-patients", allowedRoles: [ROLES.NURSE] },
        { title: "Review patients", url: "/review-patients", allowedRoles: [ROLES.NURSE] },
        { title: "Doctor Dashboard", url: "/doctordashboard", allowedRoles: [ROLES.NURSE] },
      ],
    },
    {
      title: "Users",
      icon: Users2,
      url: "/users",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: "Users",
      icon: Users2,
      url: "/users",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: "Doctors",
      icon: Stethoscope,
      url: "/doctors",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: "Nurses",
      icon: FaUserNurse,
      url: "/nurses",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: "Admin",
      icon: Shield,
      url: "/admins",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: "Tests",
      icon: FlaskConical,
      url: "/tests",
      isExpandable: false,
      allowedRoles: [ROLES.ADMIN],
    },
  ];

  // Filter navItems based on user role
  const filteredNavItems = navItems.filter(
    item => item.allowedRoles && item.allowedRoles.includes(user.role),
  );

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex">
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-900 text-white transition-all duration-500 ease-in-out ${
          isOpen ? "w-72" : "w-20"
        } shadow-xl flex flex-col justify-between overflow-y-auto overflow-x-hidden`}
      >
        {/* Header */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                  <Hospital className="h-7 w-7 text-blue-200" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">MediSys</h1>
                  <p className="text-xs font-medium text-blue-200/80">Healthcare Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 ${
                !isOpen && "mx-auto"
              }`}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className={`space-y-1.5 ${!isOpen && "flex flex-col items-center"}`}>
            {filteredNavItems.map(item => (
              <div key={item.title} className="mb-1.5">
                <Link
                  to={item.url || "#"}
                  className={`flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 group ${
                    location.pathname === item.url || expandedSections[item.section]
                      ? "bg-white/15 backdrop-blur-sm"
                      : "hover:bg-white/10"
                  }`}
                  onClick={e => {
                    if (item.isExpandable) {
                      e.preventDefault();
                      toggleSection(item.section);
                    }
                  }}
                >
                  <div className={`${!isOpen && "mx-auto"} relative`}>
                    <div
                      className={`absolute inset-0 bg-blue-400/20 rounded-lg blur-xl group-hover:bg-blue-400/30 transition-all duration-200 opacity-0 group-hover:opacity-80 ${
                        (location.pathname === item.url || expandedSections[item.section]) &&
                        "opacity-100"
                      }`}
                    ></div>
                    <item.icon
                      className={`h-5 w-5 text-blue-200 relative z-10 ${
                        (location.pathname === item.url || expandedSections[item.section]) &&
                        "text-white"
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <>
                      <span
                        className={`flex-1 ml-3.5 text-sm font-medium ${
                          location.pathname === item.url || expandedSections[item.section]
                            ? "text-white"
                            : "text-blue-100"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.isExpandable && (
                        <div>
                          {expandedSections[item.section] ? (
                            <ChevronDown className="h-4 w-4 text-blue-300" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-blue-300" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Link>
                {item.isExpandable && isOpen && expandedSections[item.section] && (
                  <div className="pl-8 mt-1.5 space-y-1.5 animate-fadeIn">
                    {item.subItems
                      .filter(
                        subItem => subItem.allowedRoles && subItem.allowedRoles.includes(user.role),
                      )
                      .map(subItem =>
                        subItem.subItems ? (
                          <div key={subItem.title} className="rounded-lg overflow-hidden">
                            <div
                              className={`flex items-center px-3 py-2 text-sm text-blue-200 rounded-lg transition-all duration-200 ${
                                expandedSections[subItem.section]
                                  ? "bg-blue-800/50"
                                  : "hover:bg-white/5"
                              }`}
                              onClick={() => subItem.section && toggleSection(subItem.section)}
                            >
                              <span className="flex-1 font-medium">{subItem.title}</span>
                              <div>
                                {expandedSections[subItem.section] ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-blue-300" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
                                )}
                              </div>
                            </div>
                            {expandedSections[subItem.section] && (
                              <div className="pl-4 space-y-1 pt-1.5">
                                {subItem.subItems
                                  .filter(
                                    nestedItem =>
                                      nestedItem.allowedRoles &&
                                      nestedItem.allowedRoles.includes(user.role),
                                  )
                                  .map(nestedItem => (
                                    <Link
                                      key={nestedItem.title}
                                      to={nestedItem.url}
                                      className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        location.pathname === nestedItem.url
                                          ? "bg-blue-800/50 text-white"
                                          : "text-blue-200/80 hover:bg-white/5 hover:text-blue-100"
                                      }`}
                                    >
                                      {nestedItem.title}
                                    </Link>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === subItem.url
                                ? "bg-blue-800/50 text-white"
                                : "text-blue-200/80 hover:bg-white/5 hover:text-blue-100"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ),
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-4">
          <div className="mx-2 mb-3 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>
          <div
            className={`flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 ${
              !isOpen && "justify-center"
            }`}
          >
            <div className="relative">
              <div className="p-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 min-w-8 rounded-full object-cover border-2 border-blue-950"
                />
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 rounded-full border-2 border-blue-950"></span>
            </div>
            {isOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs font-medium text-blue-200/80">{user.email}</p>
              </div>
            )}
            {isOpen && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-blue-200 hover:text-white"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
