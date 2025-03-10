import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "contact", label: "Contact Info" },
    { key: "medical", label: "Medical History" },
    { key: "diagnosis", label: "Diagnosis History" },
  ];

  return (
    <div className="flex border-b border-indigo-200 text-sm font-medium bg-gradient-to-b from-white/80 to-transparent p-1">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 -mb-px transition-all duration-300 ${
            activeTab === tab.key
              ? "border-b-2 border-indigo-600 text-indigo-700 bg-white"
              : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/20"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
