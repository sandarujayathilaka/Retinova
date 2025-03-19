import { useState } from "react";
import { toast } from "react-hot-toast";
import TestCard from "./TestCard";
import { CheckCircle, Save, AlertTriangle, FileText, Eye, ChevronUp, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

const TestRecordItem = ({ record, onSave, onComplete, handleFileUpload }) => {
  const [pendingUploads, setPendingUploads] = useState({});
  const [selectedFileNames, setSelectedFileNames] = useState({});
  const [localTests, setLocalTests] = useState([...record.recommend.tests]);
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);

  const savedTests = record.recommend.tests; // Saved state from the record

  const handleSave = async () => {
    const hasUnsavedChanges = localTests.some(
      (test, index) =>
        test.status !== savedTests[index].status || pendingUploads[index]
    );
    
    if (!hasUnsavedChanges) {
      toast.info("No changes to save.");
      return;
    }
    
    setSaving(true);
    try {
      const updatedTests = localTests.map((test, index) => ({
        ...test,
        attachmentURL: pendingUploads[index] || test.attachmentURL,
      }));
      await onSave(record._id, updatedTests);
      setPendingUploads({});
      setSelectedFileNames({});
    } finally {
      setSaving(false);
    }
  };

  const allTestsCompletedOrReviewed = localTests.every(
    (test) => test.status === "Completed" || test.status === "Reviewed"
  );
  
  const hasUnsavedChanges = localTests.some(
    (test, index) =>
      test.status !== savedTests[index].status || pendingUploads[index]
  );

  const renderStatusIndicator = () => {
    const statuses = {
      "Test Completed": { color: "bg-teal-100 text-teal-800", icon: CheckCircle },
    };
    const statusInfo = statuses[record.status] || { color: "bg-gray-100 text-gray-800", icon: Eye };
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-md ${statusInfo.color}`}>
        <statusInfo.icon className="h-4 w-4" />
        <span className="text-sm font-medium">{record.status}</span>
      </div>
    );
  };

  const testSummary = localTests.reduce((acc, test) => {
    acc[test.status] = (acc[test.status] || 0) + 1;
    return acc;
  }, {});

  const completedTests = localTests.filter(test => 
    test.status === "Completed" || test.status === "Reviewed"
  ).length;
  const progressPercentage = (completedTests / localTests.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg mb-4">
      {/* Header Section (unchanged) */}
      <div 
        className="bg-gradient-to-r from-indigo-100 to-indigo-100 px-6 py-4 cursor-pointer border-l-4 border-blue-900"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900">{record.diagnosis}</h3>
            <div className="flex items-center mt-2 mb-3 space-x-2">
              <span className="text-blue-900 font-semibold text-sm">
                AFFECTED EYE | <span className="font-semibold">{record.eye}</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-blue-900 mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Progress | </span>
                  <div className="flex items-center">
                    <span className="font-semibold">{completedTests}</span>
                    <span>/</span>
                    <span>{localTests.length}</span>
                  </div>
                </div>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
                <div className="flex h-full">
                  {["Pending", "In Progress", "Completed", "Reviewed"].map(statusType => {
                    if (testSummary[statusType]) {
                      const width = (testSummary[statusType] / localTests.length) * 100;
                      return (
                        <div 
                          key={statusType}
                          className={`h-full transition-all duration-300 ${
                            statusType === "Reviewed" ? "bg-purple-300" : 
                            statusType === "Completed" ? "bg-teal-400" : 
                            statusType === "In Progress" ? "bg-sky-300" : 
                            "bg-gray-100"
                          }`}
                          style={{ width: `${width}%` }}
                          title={`${testSummary[statusType]} ${statusType}`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                {["Pending", "In Progress", "Completed", "Reviewed"].map(statusType => {
                  if (testSummary[statusType]) {
                    return (
                      <div key={statusType} className="flex items-center space-x-1">
                        <div className={`w-3 h-3 rounded-full ${
                          statusType === "Reviewed" ? "bg-purple-300" : 
                          statusType === "Completed" ? "bg-teal-400" : 
                          statusType === "In Progress" ? "bg-sky-300" : 
                          "bg-gray-100"
                        }`}></div>
                        <span className="text-xs text-blue-500">{statusType}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-6">
            <button 
              className="bg-white bg-opacity-10 rounded-full p-2 text-white hover:bg-opacity-20 transition"
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {expanded && (
        <div className="p-6">
          <div className="bg-indigo-50 rounded-lg p-4 mb-6 border-l-4 border-indigo-400">
            <h4 className="text-indigo-900 font-medium text-sm mb-2">DOCTOR'S NOTE</h4>
            <p className="text-gray-700">
              {record.recommend.note || "No additional notes provided by the doctor."}
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center px-4 py-3 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
              <p className="text-amber-700 text-sm">
                You have unsaved changes. Don't forget to save your updates.
              </p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-800">Test Records</h4>
              <div className="flex space-x-2">
                {Object.entries(testSummary).map(([status, count]) => (
                  <div key={status} className={`px-2 py-1 rounded-md text-xs font-medium ${
                    status === "Reviewed" ? "bg-purple-100 text-purple-700" : 
                    status === "Completed" ? "bg-teal-100 text-teal-700" : 
                    status === "In Progress" ? "bg-sky-100 text-sky-700" : 
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {count} {status}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center">
                <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload test files before changing status. Once a test is marked as "Completed", it can't be modified.
              </p>
            </div>
            
            <div className="space-y-4">
              {localTests.map((test, index) => (
                <TestCard
                  key={index}
                  test={test}
                  index={index}
                  localTests={localTests}
                  setLocalTests={setLocalTests}
                  pendingUploads={pendingUploads}
                  setPendingUploads={setPendingUploads}
                  selectedFileNames={selectedFileNames}
                  setSelectedFileNames={setSelectedFileNames}
                  record={{ ...record, handleFileUpload }}
                  savedTests={savedTests} // Pass savedTests
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {allTestsCompletedOrReviewed ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All tests completed
                </span>
              ) : (
                <span>
                  Please complete all tests to proceed
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
                className={`
                  flex items-center px-4 py-2 rounded-md transition 
                  ${!hasUnsavedChanges || saving
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-sky-600 text-white hover:bg-sky-700"}
                `}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => onComplete(record._id)}
                disabled={!allTestsCompletedOrReviewed || record.status === "Test Completed"}
                className={`
                  flex items-center px-4 py-2 rounded-md transition
                  ${!allTestsCompletedOrReviewed || record.status === "Test Completed"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"}
                `}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRecordItem;