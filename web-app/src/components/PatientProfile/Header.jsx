import React from "react";

const Header = ({ patientId, navigate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Back to List
          </button>
        </div>
        <p className="mt-2 text-sm opacity-80">ID: {patientId}</p>
      </div>
    </div>
  );
};

export default Header;
