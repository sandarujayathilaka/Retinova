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


//Initialize the add record form with empty values

  const initAddRecord = useCallback(() => {
    setShowAddForm(true);
    setEditingRecord(null);
    resetForms();
  }, [resetForms]);


   // Handle saving new medical records

  const handleAddMultipleRecords = useCallback(async () => {
    const result = await addRecords(newRecords);
    if (result.success) {
      setShowAddForm(false);
      resetForms();
    }
  }, [newRecords, addRecords, resetForms]);

  
   // Prepare a record for editing

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

  
  // Handle saving an edited record
  const handleSaveEditedRecord = useCallback(async () => {
    if (!editingRecord || !editingRecord._id) return;
    
    const result = await updateRecord(editingRecord._id, editingRecord);
    if (result.success) {
      setEditingRecord(null);
    }
  }, [editingRecord, updateRecord]);


//Delete a record after confirmation
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


//Render appropriate content based on current state

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


      {renderContent()}

  
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