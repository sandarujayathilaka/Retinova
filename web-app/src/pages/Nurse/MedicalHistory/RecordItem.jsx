// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Pencil, Trash2, ZoomIn } from "lucide-react";
// import EditRecordForm from "./EditRecordForm";
// import { api } from "../../../services/api.service";
// import { toast } from "react-hot-toast";

// const RecordItem = ({
//   record,
//   editingRecord,
//   setEditingRecord,
//   onEdit,
//   onDelete,
//   setEnlargedImage,
//   patientId,
//   fetchRecords,
//   saveLoading, // Added to disable buttons during save
// }) => {
//   const [localSaveLoading, setLocalSaveLoading] = useState(false); // Loading state for this record's save

//   const handleSaveEditedRecord = async () => {
//     if (!editingRecord || !editingRecord.condition || !editingRecord._id) {
//       toast.error("Condition is required or record ID is missing");
//       return;
//     }

//     setLocalSaveLoading(true); // Start loading
//     try {
//       const formData = new FormData();
//       formData.append("condition", editingRecord.condition);
//       if (editingRecord.diagnosedAt) formData.append("diagnosedAt", editingRecord.diagnosedAt);
//       if (editingRecord.medications && editingRecord.medications.length > 0) {
//         formData.append("medications", JSON.stringify(editingRecord.medications));
//       }
//       if (editingRecord.files && editingRecord.files.length > 0) {
//         editingRecord.files.forEach((file) => {
//           if (file) formData.append("files", file);
//         });
//       }
//       if (editingRecord.filesToRemove && editingRecord.filesToRemove.length > 0) {
//         formData.append("filesToRemove", JSON.stringify(editingRecord.filesToRemove));
//       }
//       formData.append("notes", editingRecord.notes || "");
//       formData.append("isChronicCondition", editingRecord.isChronicCondition.toString());

//       const responsePromise = api.put(`/patients/${patientId}/medical-records/${editingRecord._id}`, formData);
//       await toast.promise(responsePromise, {
//         loading: "Saving changes...",
//         success: "Record updated successfully",
//         error: (error) => {
//           const errorData = error.response?.data || {};
//           return errorData.message ||
//             (errorData.errorCode === "PATIENT_NOT_FOUND"
//               ? "Patient not found"
//               : errorData.errorCode === "RECORD_NOT_FOUND"
//               ? "Record not found"
//               : "Error updating record");
//         },
//       });

//       await fetchRecords();
//       setEditingRecord(null);
//     } catch (error) {
//       // Error handled by toast.promise
//     } finally {
//       setLocalSaveLoading(false); // Stop loading
//     }
//   };

//   const getCleanFileName = (path) => {
//     const fileName = path.split("/").pop();
//     return decodeURIComponent(fileName.replace(/^\d+_/, ""));
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md border border-teal-100 hover:shadow-lg transition-shadow duration-200">
//       {editingRecord && editingRecord._id === record._id ? (
//         <EditRecordForm
//           record={editingRecord}
//           setRecord={setEditingRecord}
//           onSave={handleSaveEditedRecord}
//           onCancel={() => setEditingRecord(null)}
//           setEnlargedImage={setEnlargedImage}
//           saveLoading={localSaveLoading}
//           disabled={localSaveLoading || saveLoading}
//         />
//       ) : (
//         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
//           <div className="space-y-3 flex-1">
//             <h3 className="text-xl font-semibold text-teal-700">{record.condition || "Unnamed Condition"}</h3>
//             <div className="text-sm text-gray-600">
//               {record.diagnosedAt && (
//                 <span>
//                   Diagnosed: <span className="font-medium">{new Date(record.diagnosedAt).toLocaleDateString()}</span>
//                 </span>
//               )}
//               {record.diagnosedAt && record.hasOwnProperty("isChronicCondition") && <span className="ml-2">|</span>}
//               {record.hasOwnProperty("isChronicCondition") && (
//                 <span className="ml-2">
//                   Type: <span className="font-medium">{record.isChronicCondition ? "Chronic" : "Acute"}</span>
//                 </span>
//               )}
//             </div>
//             {record.medications?.length > 0 && (
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-700">Medications:</p>
//                 <ul className="list-disc pl-4">
//                   {record.medications.map((med, index) => (
//                     <li key={index} className="text-sm text-gray-600">{med}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {record.filePaths?.length > 0 && (
//               <div className="mt-3">
//                 <p className="text-sm font-medium text-gray-700">Attachments:</p>
//                 <div className="grid grid-cols-2 gap-4 mt-2">
//                   {record.filePaths.map((path, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       {path.match(/\.(jpg|png|jpeg)$/i) ? (
//                         <div className="text-center">
//                           <img
//                             src={path}
//                             alt={record.condition}
//                             className="w-24 h-24 object-cover rounded-md border border-gray-200"
//                           />
//                           <span className="text-xs text-gray-600 block mt-1 truncate max-w-xs">{getCleanFileName(path)}</span>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setEnlargedImage(path)}
//                             disabled={localSaveLoading || saveLoading}
//                             className="mt-1 text-teal-600 hover:bg-teal-100"
//                           >
//                             <ZoomIn className="h-4 w-4 mr-1" /> View
//                           </Button>
//                         </div>
//                       ) : (
//                         <a
//                           href={path}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-teal-600 hover:underline text-sm truncate max-w-xs"
//                         >
//                           {getCleanFileName(path)}
//                         </a>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {record.notes && record.notes !== "No additional notes" && (
//               <div className="mt-3">
//                 <p className="text-sm font-medium text-gray-700">Notes:</p>
//                 <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
//               </div>
//             )}
//           </div>
//           <div className="flex flex-col items-end gap-2">
//             <p className="text-xs text-gray-500">
//               {record.updatedAt &&
//                 `Last Modified: ${new Date(record.updatedAt).toLocaleString("en-US", {
//                   year: "numeric",
//                   month: "short",
//                   day: "numeric",
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   second: "2-digit",
//                   hour12: true,
//                 })}`}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 onClick={() => onEdit(record)}
//                 variant="outline"
//                 size="sm"
//                 disabled={localSaveLoading || saveLoading}
//                 className="text-teal-600 hover:bg-teal-100"
//               >
//                 <Pencil className="h-4 w-4 mr-2" /> Edit
//               </Button>
//               <Button
//                 onClick={onDelete}
//                 variant="outline"
//                 size="sm"
//                 disabled={localSaveLoading || saveLoading}
//                 className="text-red-600 hover:bg-red-50"
//               >
//                 <Trash2 className="h-4 w-4 mr-2" /> Delete
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecordItem;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ZoomIn, Clock, Calendar, Tag, FileText } from "lucide-react";
import EditRecordForm from "./EditRecordForm";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const RecordItem = ({
  record,
  editingRecord,
  setEditingRecord,
  onEdit,
  onDelete,
  setShowDeleteModal,
  setEnlargedImage,
  patientId,
  fetchRecords,
  saveLoading,
}) => {
  const [localSaveLoading, setLocalSaveLoading] = useState(false);

  const handleSaveEditedRecord = async () => {
    if (!editingRecord || !editingRecord.condition || !editingRecord._id) {
      toast.error("Condition is required or record ID is missing");
      return;
    }

    setLocalSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append("condition", editingRecord.condition);
      if (editingRecord.diagnosedAt) formData.append("diagnosedAt", editingRecord.diagnosedAt);
      if (editingRecord.medications && editingRecord.medications.length > 0) {
        formData.append("medications", JSON.stringify(editingRecord.medications));
      }
      if (editingRecord.files && editingRecord.files.length > 0) {
        editingRecord.files.forEach((file) => {
          if (file) formData.append("files", file);
        });
      }
      if (editingRecord.filesToRemove && editingRecord.filesToRemove.length > 0) {
        formData.append("filesToRemove", JSON.stringify(editingRecord.filesToRemove));
      }
      formData.append("notes", editingRecord.notes || "");
      formData.append("isChronicCondition", editingRecord.isChronicCondition.toString());

      const responsePromise = api.put(`/patients/${patientId}/medical-records/${editingRecord._id}`, formData);
      await toast.promise(responsePromise, {
        loading: "Saving changes...",
        success: (
          <div className="flex items-center gap-2 text-blue-900">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-4 w-4 text-blue-700" />
            </div>
            <span className="font-medium">Record updated successfully</span>
          </div>
        ),
        error: (error) => {
          const errorData = error.response?.data || {};
          return errorData.message ||
            (errorData.errorCode === "PATIENT_NOT_FOUND"
              ? "Patient not found"
              : errorData.errorCode === "RECORD_NOT_FOUND"
              ? "Record not found"
              : "Error updating record");
        },
      });

      await fetchRecords();
      setEditingRecord(null);
    } catch (error) {
      // Error handled by toast.promise
    } finally {
      setLocalSaveLoading(false);
    }
  };

  const getCleanFileName = (path) => {
    const fileName = path.split("/").pop();
    return decodeURIComponent(fileName.replace(/^\d+_/, ""));
  };

  return (
    <Card className="bg-white rounded-xl overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-200">
      {editingRecord && editingRecord._id === record._id ? (
        <EditRecordForm
          record={editingRecord}
          setRecord={setEditingRecord}
          onSave={handleSaveEditedRecord}
          onCancel={() => setEditingRecord(null)}
          setEnlargedImage={setEnlargedImage}
          saveLoading={localSaveLoading}
          disabled={localSaveLoading || saveLoading}
        />
      ) : (
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-blue-800">{record.condition || "Unnamed Condition"}</h3>
                <Badge className={`${record.isChronicCondition 
                  ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-700" 
                  : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700"} px-3 py-1 rounded-full`}>
                  {record.isChronicCondition ? "Chronic" : "Acute"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {record.diagnosedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>Diagnosed: <span className="font-medium">{new Date(record.diagnosedAt).toLocaleDateString()}</span></span>
                  </div>
                )}
              </div>
              
              {record.medications?.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-indigo-600" />
                    Medications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {record.medications.map((med, index) => (
                      <Badge key={index} className="bg-white text-blue-700 border-blue-200 px-3 py-1 rounded-full hover:bg-white hover:text-blue-700">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {record.filePaths?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Attachments:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {record.filePaths.map((path, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {path.match(/\.(jpg|png|jpeg)$/i) ? (
                          <div className="text-center bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                            <div className="mb-1 relative">
                              <img
                                src={path}
                                alt={record.condition}
                                className="w-24 h-24 object-cover rounded-md"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEnlargedImage(path)}
                                disabled={localSaveLoading || saveLoading}
                                className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="text-xs text-gray-600 block truncate max-w-xs">
                              {getCleanFileName(path)}
                            </span>
                          </div>
                        ) : (
                          <a
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-3 rounded-lg border border-blue-100 text-indigo-600 hover:text-indigo-600 hover:underline text-sm truncate max-w-xs flex flex-col items-center"
                          >
                            <FileText className="h-8 w-8 mb-1 text-indigo-500" />
                            {getCleanFileName(path)}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {record.notes && record.notes !== "No additional notes" && (
                <div className="bg-blue-50 p-3 rounded-lg mt-3">
                  <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Notes:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-indigo-400" />
                {record.updatedAt &&
                  `Last Modified: ${new Date(record.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => onEdit(record)}
                  variant="outline"
                  size="sm"
                  disabled={localSaveLoading || saveLoading}
                  className="h-9 px-4 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  onClick={() => {
                    onDelete(record._id);
                    setShowDeleteModal(true);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={localSaveLoading || saveLoading}
                  className="h-9 px-4 rounded-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecordItem;