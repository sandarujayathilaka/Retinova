import { EyeIcon, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import StatusBadge from "./StatusBadge";
import { useState } from "react";

const TestCard = ({
  test,
  index,
  localTests,
  setLocalTests,
  pendingUploads,
  setPendingUploads,
  selectedFileNames,
  setSelectedFileNames,
  record,
  savedTests, // Added savedTests prop
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const statusOrder = {
    Pending: 0,
    "In Progress": 1,
    Completed: 2,
    Reviewed: 3,
  };

  const handleStatusChange = (index, value) => {
    const test = localTests[index];
    const savedStatusOrder = statusOrder[savedTests[index].status];
    const newStatusOrder = statusOrder[value];
    
    if (newStatusOrder < savedStatusOrder) {
      toast.error(`Cannot select a status before ${savedTests[index].status}.`, {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }
    
    if (!test.attachmentURL && !pendingUploads[index]) {
      toast.error("Please upload an attachment before changing the status.", {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }
    
    const updatedTests = [...localTests];
    updatedTests[index].status = value;
    setLocalTests(updatedTests);
    
    if (value === "Completed") {
      toast.success("Test marked as completed!", {
        icon: '✅',
      });
    }
  };

  const handleFileChange = async (index, file) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller file.", {
        duration: 5000, 
        icon: '⚠️'
      });
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, GIF or PDF files only.", {
        duration: 5000,
        icon: '⚠️'
      });
      return;
    }
    
    setUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      const url = await record.handleFileUpload(file, record._id, index);
      setPendingUploads((prev) => ({ ...prev, [index]: url }));
      setSelectedFileNames((prev) => ({ ...prev, [index]: file.name }));
      
      const updatedTests = [...localTests];
      updatedTests[index].status = "In Progress";
      setLocalTests(updatedTests);
      
      setUploadProgress(100);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
      console.error("Upload error:", error);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-gray-100 border-gray-200",
      "In Progress": "bg-sky-50 border-sky-200",
      Completed: "bg-teal-50 border-teal-200",
      Reviewed: "bg-purple-50 border-purple-200"
    };
    return colors[status] || "bg-gray-100 border-gray-200";
  };

  // Use savedTests for UI state
  const savedTest = savedTests[index];
  const isDisabled = savedTest.status === "Completed" || savedTest.status === "Reviewed";
  const hasCurrentAttachment = savedTest.attachmentURL;
  const hasPendingAttachment = pendingUploads[index];
  const showEyeIcon = (hasCurrentAttachment || hasPendingAttachment) && savedTest.status !== "Reviewed";

  return (
    <div 
      className={`rounded-lg p-5 border ${getStatusColor(savedTest.status)} transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-3 h-3 rounded-full ${
              savedTest.status === "Completed" ? "bg-teal-500" : 
              savedTest.status === "In Progress" ? "bg-sky-500" : 
              savedTest.status === "Reviewed" ? "bg-purple-500" : "bg-gray-400"
            }`}
          />
          <h4 className="font-medium text-gray-800">{test.testName}</h4>
        </div>
        <StatusBadge status={savedTest.status} />
      </div>

      {savedTest.status === "Reviewed" ? (
        <div className="bg-purple-50 rounded-lg p-3 flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-md">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800">This test has been reviewed</p>
            {hasCurrentAttachment && (
              <a 
                href={savedTest.attachmentURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline flex items-center mt-1"
              >
                <EyeIcon className="h-4 w-4 mr-1" /> View attachment
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Upload test result file</p>

            {uploading ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  <label className="relative">
                    <span 
                      className={`
                        flex items-center space-x-1 px-4 py-2 rounded-md text-sm transition
                        ${isDisabled 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer"}
                      `}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </span>
                    <input 
                      type="file"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isDisabled}
                    />
                  </label>
                </div>

                {hasCurrentAttachment && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={savedTest.attachmentURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm truncate max-w-[200px]"
                      title="Current attachment"
                    >
                      Current Attachment
                    </a>
                    {showEyeIcon && (
                      <button
                        onClick={() => window.open(savedTest.attachmentURL, "_blank")}
                        className="p-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                        title="View current attachment"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {hasPendingAttachment && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={pendingUploads[index]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm truncate max-w-[200px]"
                      title={selectedFileNames[index] || "Pending attachment"}
                    >
                      {selectedFileNames[index] || "Pending Attachment"}
                    </a>
                    {showEyeIcon && (
                      <button
                        onClick={() => window.open(pendingUploads[index], "_blank")}
                        className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                        title="View pending attachment"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {(!hasCurrentAttachment && !hasPendingAttachment) && (
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                File required before status can be changed
              </p>  
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Status
            </label>
            <select
              value={localTests[index].status} // Dropdown shows local state
              onChange={(e) => handleStatusChange(index, e.target.value)}
              className={`
                w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${(!hasCurrentAttachment && !hasPendingAttachment) 
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                  : "bg-white border-gray-300"
                }
                ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}
              `}
              disabled={!hasCurrentAttachment && !hasPendingAttachment || isDisabled}
            >
              <option value="Pending" disabled={statusOrder["Pending"] < statusOrder[savedTest.status]}>
                Pending
              </option>
              <option
                value="In Progress"
                disabled={statusOrder["In Progress"] < statusOrder[savedTest.status]}
              >
                In Progress
              </option>
              <option value="Completed" disabled={statusOrder["Completed"] < statusOrder[savedTest.status]}>
                Completed
              </option>
            </select>
            
            {isDisabled && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                This test has been finalized and cannot be modified
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TestCard;