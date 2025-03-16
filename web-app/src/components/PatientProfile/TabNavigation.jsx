import React from "react";
import { User, Phone, FileText, Activity } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "basic", label: "Basic Info", icon: <User className="w-4 h-4" /> },
    { key: "contact", label: "Contact", icon: <Phone className="w-4 h-4" /> },
    { key: "medical", label: "Medical History", icon: <FileText className="w-4 h-4" /> },
    { key: "diagnosis", label: "Diagnosis History", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap border-b border-indigo-100 bg-gradient-to-r from-blue-50/30 via-indigo-50/30 to-white">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === tab.key
              ? "text-blue-900 border-b-2 border-blue-900 bg-white"
              : "text-gray-600 hover:text-blue-900 hover:bg-blue-50/50"
          }`}
        >
          <span className={`mr-2 ${activeTab === tab.key ? "text-blue-900" : "text-gray-500"}`}>
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;