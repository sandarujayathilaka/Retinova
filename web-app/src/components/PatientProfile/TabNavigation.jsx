import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "contact", label: "Contact Info" },
    { key: "medical", label: "Medical History" },
    { key: "diagnosis", label: "Diagnosis History" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider transition-colors duration-200 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
