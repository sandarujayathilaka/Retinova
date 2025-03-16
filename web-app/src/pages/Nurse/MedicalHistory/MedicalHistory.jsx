

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon, Loader2, Plus, FileText, Activity, History } from "lucide-react";
// import { toast } from "react-hot-toast";
// import { api } from "../../../services/api.service";
// import AddRecordForm from "./AddRecordForm";
// import RecordList from "./RecordList";
// import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
// import ImageViewerDialog from "./ImageViewerDialog";
// import { Card } from "@/components/ui/card";

// const MedicalHistory = ({ patientId }) => {
//   const [records, setRecords] = useState([]);
//   const [newRecords, setNewRecords] = useState([
//     { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false },
//   ]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [recordToDelete, setRecordToDelete] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [enlargedImage, setEnlargedImage] = useState(null);
//   const [hasShownToast, setHasShownToast] = useState(false);

//   const fetchRecords = async () => {
//     let isMounted = true;
//     setLoading(true);
//     try {
//       const response = await api.get(`/patients/${patientId}/medical-records`);
//       const medicalHistory = Array.isArray(response.data.data.medicalHistory)
//         ? response.data.data.medicalHistory.filter((record) => record && typeof record === "object")
//         : [];
//       if (isMounted) setRecords(medicalHistory);
//     } catch (error) {
//       const errorData = error.response?.data || {};
//       if (isMounted && !hasShownToast) {
//         toast.error(
//           errorData.message ||
//           (errorData.errorCode === "PATIENT_NOT_FOUND"
//             ? "Patient not found"
//             : "Error fetching medical records")
//         );
//         setHasShownToast(true);
//       }
//     } finally {
//       if (isMounted) setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecords();
//     return () => {
//       setHasShownToast(false);
//     };
//   }, [patientId]);

//   const handleAddMultipleRecords = async () => {
//     const invalidRecords = newRecords.filter((record) => !record.condition);
//     if (invalidRecords.length > 0) {
//       toast.error("Condition is required for all records");
//       return;
//     }

//     setSaveLoading(true);
//     try {
//       const formData = new FormData();
//       newRecords.forEach((record, index) => {
//         formData.append(`records[${index}][condition]`, record.condition);
//         if (record.diagnosedAt) formData.append(`records[${index}][diagnosedAt]`, record.diagnosedAt);
//         record.medications.forEach((med, medIndex) => {
//           if (med) formData.append(`records[${index}][medications][${medIndex}]`, med);
//         });
//         record.files.forEach((file, fileIndex) => {
//           formData.append(`records[${index}][files][${fileIndex}]`, file);
//         });
//         formData.append(`records[${index}][notes]`, record.notes || "");
//         formData.append(`records[${index}][isChronicCondition]`, (record.isChronicCondition ?? false).toString());
//       });

//       const responsePromise = api.post(`/patients/${patientId}/medical-records`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       // Custom toast
//       await toast.promise(responsePromise, {
//         loading: "Saving medical records...",
//         success: (
//           <div className="flex items-center gap-2 text-blue-900">
//             <div className="bg-blue-100 p-2 rounded-full">
//               <FileText className="h-4 w-4 text-blue-700" />
//             </div>
//             <span className="font-medium">Medical records added successfully</span>
//           </div>
//         ),
//         error: (error) => {
//           const errorData = error.response?.data || {};
//           return errorData.message ||
//             (errorData.errorCode === "PATIENT_NOT_FOUND"
//               ? "Patient not found"
//               : "Error adding medical records");
//         },
//       });

//       await fetchRecords();
//       setNewRecords([{ condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false }]);
//       setShowAddForm(false);
//     } catch (error) {
//       // Error handled by toast.promise
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleEditRecord = (record) => {
//     if (!record || !record._id) {
//       toast.error("Cannot edit this record: Invalid data");
//       return;
//     }
//     setShowAddForm(false);
//     setEditingRecord({
//       ...record,
//       diagnosedAt: record.diagnosedAt ? record.diagnosedAt.split("T")[0] : "",
//       medications: record.medications?.length > 0 ? [...record.medications] : [],
//       files: [],
//       filesToRemove: [],
//       notes: record.notes === "No additional notes" ? "" : record.notes || "",
//       isChronicCondition: record.isChronicCondition || false,
//     });
//   };

//   const handleDeleteRecord = async () => {
//     if (!recordToDelete) {
//       toast.error("No record selected for deletion");
//       setShowDeleteModal(false);
//       return;
//     }
//     setSaveLoading(true);
//     try {
//       const responsePromise = api.delete(`/patients/${patientId}/medical-records/${recordToDelete}`);
//       await toast.promise(responsePromise, {
//         loading: "Deleting medical record...",
//         success: "Medical record deleted successfully",
//         error: (error) => {
//           const errorData = error.response?.data || {};
//           return errorData.message ||
//             (errorData.errorCode === "PATIENT_NOT_FOUND"
//               ? "Patient not found"
//               : "Error deleting record");
//         },
//       });
//       await fetchRecords();
//       setShowDeleteModal(false);
//       setRecordToDelete(null);
//     } catch (error) {
//       // Error handled by toast.promise
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const initAddRecord = () => {
//     setShowAddForm(true);
//     setEditingRecord(null);
//     setNewRecords([{ condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false }]);
//   };

//   // Only show the content based on loading state and records existence
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex flex-col justify-center items-center h-64">
//           <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
//           <p className="text-indigo-700 font-medium">Loading medical records...</p>
//         </div>
//       );
//     }

//     // If showing add form, display that
//     if (showAddForm) {
//       return (
//         <AddRecordForm
//           newRecords={newRecords}
//           setNewRecords={setNewRecords}
//           onSave={handleAddMultipleRecords}
//           onCancel={() => setShowAddForm(false)}
//           saveLoading={saveLoading}
//           disabled={saveLoading}
//         />
//       );
//     }

//     // If no records and not adding, show empty state
//     if (records.length === 0) {
//       return (
//         <Card className="p-8 bg-white border border-blue-100 rounded-xl text-center">
//           <div className="flex flex-col items-center">
//             <div className="bg-blue-50 p-4 rounded-full mb-4">
//               <FileText className="h-12 w-12 text-blue-300" />
//             </div>
//             <h3 className="text-xl font-semibold text-blue-900 mb-2">No Medical Records</h3>
//             <p className="text-blue-600 mb-6">This patient doesn't have any medical records yet.</p>
//             <Button
//               onClick={initAddRecord}
//               className="px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
//             >
//               <Plus className="mr-2 h-4 w-4" /> Add First Record
//             </Button>
//           </div>
//         </Card>
//       );
//     }

//     // Otherwise show the records list
//     return (
//       <RecordList
//         records={records}
//         editingRecord={editingRecord}
//         setEditingRecord={setEditingRecord}
//         onEdit={handleEditRecord}
//         onDelete={(recordId) => setRecordToDelete(recordId)}
//         setShowDeleteModal={setShowDeleteModal}
//         setEnlargedImage={setEnlargedImage}
//         patientId={patientId}
//         fetchRecords={fetchRecords}
//         saveLoading={saveLoading}
//       />
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-blue-50 p-4 rounded-xl mb-6">
//         <div className="flex flex-row justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-100 p-3 rounded-full">
//               <History className="h-6 w-6 text-indigo-700" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-blue-900">Medical History</h2>
//               <p className="text-sm text-blue-700">
//                 {records.length > 0 
//                   ? `${records.length} medical record${records.length !== 1 ? 's' : ''} available`
//                   : 'No medical records available yet'}
//               </p>
//             </div>
//           </div>
          
//           {/* Only show Add Record button if we have records and aren't in add/edit mode */}
//           {records.length > 0 && !showAddForm && !editingRecord && (
//             <Button
//               onClick={initAddRecord}
//               disabled={saveLoading}
//               className="h-11 px-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
//             >
//               <Plus className="mr-2 h-4 w-4" /> Add Record
//             </Button>
//           )}
//         </div>
//       </div>

//       {renderContent()}

//       {/* These dialogs should always be available */}
//       <DeleteConfirmationDialog
//         open={showDeleteModal}
//         onOpenChange={setShowDeleteModal}
//         onConfirm={handleDeleteRecord}
//         disabled={saveLoading}
//       />
//       <ImageViewerDialog
//         image={enlargedImage}
//         onClose={() => setEnlargedImage(null)}
//         disabled={saveLoading}
//       />
//     </div>
//   );
// };

// export default MedicalHistory;



import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, History } from "lucide-react";
import AddRecordForm from "./AddRecordForm";
import RecordList from "./RecordList";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import ImageViewerDialog from "./ImageViewerDialog";
import { Card } from "@/components/ui/card";
import { useMedicalRecords, useMultipleRecordForms } from "../../../hooks/medicalRecordsHooks";
import { LoadingState, EmptyState } from "./MedicalRecordComponents";

/**
 * MedicalHistory component to manage a patient's medical records
 * Using custom hooks for improved separation of concerns
 */
const MedicalHistory = ({ patientId }) => {
  // Use custom hooks for medical records management
  const {
    records,
    loading,
    saveLoading,
    fetchRecords,
    addRecords,
    updateRecord,
    deleteRecord
  } = useMedicalRecords(patientId);

  // Use custom hooks for form state management
  const {
    records: newRecords,
    setRecords: setNewRecords,
    resetForms
  } = useMultipleRecordForms();

  // Local component state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);

  /**
   * Initialize the add record form with empty values
   */
  const initAddRecord = useCallback(() => {
    setShowAddForm(true);
    setEditingRecord(null);
    resetForms();
  }, [resetForms]);

  /**
   * Handle saving new medical records
   */
  const handleAddMultipleRecords = useCallback(async () => {
    const result = await addRecords(newRecords);
    if (result.success) {
      setShowAddForm(false);
      resetForms();
    }
  }, [newRecords, addRecords, resetForms]);

  /**
   * Prepare a record for editing
   */
  const handleEditRecord = useCallback((record) => {
    if (!record || !record._id) return;
    
    setShowAddForm(false);
    setEditingRecord({
      ...record,
      diagnosedAt: record.diagnosedAt ? record.diagnosedAt.split("T")[0] : "",
      medications: record.medications?.length > 0 ? [...record.medications] : [],
      files: [],
      filesToRemove: [],
      notes: record.notes === "No additional notes" ? "" : record.notes || "",
      isChronicCondition: record.isChronicCondition || false,
    });
  }, []);

  /**
   * Handle saving an edited record
   */
  const handleSaveEditedRecord = useCallback(async () => {
    if (!editingRecord || !editingRecord._id) return;
    
    const result = await updateRecord(editingRecord._id, editingRecord);
    if (result.success) {
      setEditingRecord(null);
    }
  }, [editingRecord, updateRecord]);

  /**
   * Delete a record after confirmation
   */
  const handleDeleteRecord = useCallback(async () => {
    if (!recordToDelete) {
      setShowDeleteModal(false);
      return;
    }
    
    const result = await deleteRecord(recordToDelete);
    if (result.success) {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  }, [recordToDelete, deleteRecord]);

  /**
   * Render appropriate content based on current state
   */
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (showAddForm) {
      return (
        <AddRecordForm
          newRecords={newRecords}
          setNewRecords={setNewRecords}
          onSave={handleAddMultipleRecords}
          onCancel={() => setShowAddForm(false)}
          saveLoading={saveLoading}
          disabled={saveLoading}
        />
      );
    }

    if (records.length === 0) {
      return <EmptyState onAddRecord={initAddRecord} />;
    }

    return (
      <RecordList
        records={records}
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        onEdit={handleEditRecord}
        onDelete={setRecordToDelete}
        setShowDeleteModal={setShowDeleteModal}
        setEnlargedImage={setEnlargedImage}
        patientId={patientId}
        fetchRecords={fetchRecords}
        saveLoading={saveLoading}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with count and add button */}
      <div className="bg-blue-50 p-4 rounded-xl mb-6">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <History className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">Medical History</h2>
              <p className="text-sm text-blue-700">
                {records.length > 0 
                  ? `${records.length} medical record${records.length !== 1 ? 's' : ''} available`
                  : 'No medical records available yet'}
              </p>
            </div>
          </div>
          
          {/* Only show Add Record button if we have records and aren't in add/edit mode */}
          {records.length > 0 && !showAddForm && !editingRecord && (
            <Button
              onClick={initAddRecord}
              disabled={saveLoading}
              className="h-11 px-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      {renderContent()}

      {/* Modals */}
      <DeleteConfirmationDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteRecord}
        disabled={saveLoading}
      />
      
      <ImageViewerDialog
        image={enlargedImage}
        onClose={() => setEnlargedImage(null)}
        disabled={saveLoading}
      />
    </div>
  );
};

export default MedicalHistory;