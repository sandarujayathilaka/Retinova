import React from "react";
import { ArrowLeft } from "lucide-react";

const Header = ({ patientId, navigate }) => {
  return (
    <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
      <div className="flex items-center text-2xl font-semibold text-gray-800">
        <ArrowLeft
          className="w-6 h-6 mr-2 text-indigo-600 cursor-pointer hover:text-indigo-700 transition-all duration-300"
          onClick={() => navigate("/")}
        />
        Patient Profile
      </div>
      <div className="text-sm text-gray-600">ID: {patientId}</div>
    </div>
  );
};

export default Header;
