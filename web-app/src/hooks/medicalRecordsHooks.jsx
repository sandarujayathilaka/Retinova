import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { api } from "../services/api.service";
import { FileText } from "lucide-react";

/**
 * Hook for managing medical records
 * 
 * @param {string} patientId - ID of the patient whose records are being managed
 * @returns {object} - Medical record operations and state
 */
export function useMedicalRecords(patientId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  // Fetch all records for the patient
  const fetchRecords = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/patients/${patientId}/medical-records`);
      const medicalHistory = Array.isArray(response.data.data.medicalHistory)
        ? response.data.data.medicalHistory.filter((record) => record && typeof record === "object")
        : [];
      setRecords(medicalHistory);
    } catch (error) {
      const errorData = error.response?.data || {};
      if (!hasShownToast) {
        toast.error(
          errorData.message ||
          (errorData.errorCode === "PATIENT_NOT_FOUND"
            ? "Patient not found"
            : "Error fetching medical records")
        );
        setHasShownToast(true);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, hasShownToast]);

  // Add new medical records
  const addRecords = useCallback(async (newRecords) => {
    if (!patientId) return { success: false, error: "Patient ID is required" };
    if (!Array.isArray(newRecords) || newRecords.length === 0) {
      return { success: false, error: "No records to add" };
    }
    
    // Validate records
    const invalidRecords = newRecords.filter((record) => !record.condition);
    if (invalidRecords.length > 0) {
      toast.error("Condition is required for all records");
      return { success: false, error: "Condition is required for all records" };
    }
    
    setSaveLoading(true);
    try {
      const formData = new FormData();
      
      // Process the records array
      newRecords.forEach((record, index) => {
        formData.append(`records[${index}][condition]`, record.condition);
        if (record.diagnosedAt) formData.append(`records[${index}][diagnosedAt]`, record.diagnosedAt);
        record.medications?.forEach((med, medIndex) => {
          if (med) formData.append(`records[${index}][medications][${medIndex}]`, med);
        });
        record.files?.forEach((file, fileIndex) => {
          formData.append(`records[${index}][files][${fileIndex}]`, file);
        });
        formData.append(`records[${index}][notes]`, record.notes || "");
        formData.append(`records[${index}][isChronicCondition]`, (record.isChronicCondition ?? false).toString());
      });

      const responsePromise = api.post(`/patients/${patientId}/medical-records`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Show toast notification
      await toast.promise(responsePromise, {
        loading: "Saving medical records...",
        success: (
          <div className="flex items-center gap-2 text-blue-900">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-4 w-4 text-blue-700" />
            </div>
            <span className="font-medium">Medical records added successfully</span>
          </div>
        ),
        error: (error) => {
          const errorData = error.response?.data || {};
          return errorData.message ||
            (errorData.errorCode === "PATIENT_NOT_FOUND"
              ? "Patient not found"
              : "Error adding medical records");
        },
      });

      await fetchRecords();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaveLoading(false);
    }
  }, [patientId, fetchRecords]);

  // Update an existing medical record
  const updateRecord = useCallback(async (recordId, recordData) => {
    if (!patientId || !recordId) {
      return { success: false, error: "Patient ID and Record ID are required" };
    }
    
    if (!recordData.condition) {
      toast.error("Condition is required");
      return { success: false, error: "Condition is required" };
    }
    
    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append("condition", recordData.condition);
      if (recordData.diagnosedAt) formData.append("diagnosedAt", recordData.diagnosedAt);
      if (recordData.medications && recordData.medications.length > 0) {
        formData.append("medications", JSON.stringify(recordData.medications));
      }
      if (recordData.files && recordData.files.length > 0) {
        recordData.files.forEach((file) => {
          if (file) formData.append("files", file);
        });
      }
      if (recordData.filesToRemove && recordData.filesToRemove.length > 0) {
        formData.append("filesToRemove", JSON.stringify(recordData.filesToRemove));
      }
      formData.append("notes", recordData.notes || "");
      formData.append("isChronicCondition", recordData.isChronicCondition.toString());

      const responsePromise = api.put(`/patients/${patientId}/medical-records/${recordId}`, formData);
      
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
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaveLoading(false);
    }
  }, [patientId, fetchRecords]);

  // Delete a medical record
  const deleteRecord = useCallback(async (recordId) => {
    if (!patientId || !recordId) {
      return { success: false, error: "Patient ID and Record ID are required" };
    }
    
    setSaveLoading(true);
    try {
      const responsePromise = api.delete(`/patients/${patientId}/medical-records/${recordId}`);
      
      await toast.promise(responsePromise, {
        loading: "Deleting medical record...",
        success: "Medical record deleted successfully",
        error: (error) => {
          const errorData = error.response?.data || {};
          return errorData.message ||
            (errorData.errorCode === "PATIENT_NOT_FOUND"
              ? "Patient not found"
              : "Error deleting record");
        },
      });
      
      await fetchRecords();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaveLoading(false);
    }
  }, [patientId, fetchRecords]);

  // Load records on component mount
  useEffect(() => {
    fetchRecords();
    
    return () => {
      setHasShownToast(false);
    };
  }, [patientId, fetchRecords]);

  return {
    records,
    loading,
    saveLoading,
    fetchRecords,
    addRecords,
    updateRecord,
    deleteRecord
  };
}

/**
 * Hook for managing form state in medical record forms
 * 
 * @param {object} initialRecord - Initial record data
 * @returns {object} - Form state and handlers
 */
export function useRecordForm(initialRecord = {}) {
  const emptyRecord = {
    condition: "",
    diagnosedAt: "",
    medications: [],
    files: [],
    filesToRemove: [],
    notes: "",
    isChronicCondition: false,
    ...initialRecord
  };
  
  const [record, setRecord] = useState(emptyRecord);
  
  // Update a single field in the record
  const updateField = useCallback((field, value) => {
    setRecord(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Add a medication to the record
  const addMedication = useCallback(() => {
    setRecord(prev => ({
      ...prev,
      medications: [...prev.medications, ""]
    }));
  }, []);
  
  // Update a medication at a specific index
  const updateMedication = useCallback((index, value) => {
    setRecord(prev => {
      const updatedMedications = [...prev.medications];
      updatedMedications[index] = value;
      return {
        ...prev,
        medications: updatedMedications
      };
    });
  }, []);
  
  // Remove a medication at a specific index
  const removeMedication = useCallback((index) => {
    setRecord(prev => {
      const updatedMedications = [...prev.medications];
      updatedMedications.splice(index, 1);
      return {
        ...prev,
        medications: updatedMedications
      };
    });
  }, []);
  
  // Add files to the record
  const addFiles = useCallback((newFiles) => {
    setRecord(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  }, []);
  
  // Remove a file at a specific index
  const removeFile = useCallback((index) => {
    setRecord(prev => {
      const updatedFiles = [...prev.files];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        files: updatedFiles
      };
    });
  }, []);
  
  // Add a file path to the filesToRemove array
  const markFileForRemoval = useCallback((filePath) => {
    setRecord(prev => ({
      ...prev,
      filesToRemove: [...prev.filesToRemove, filePath]
    }));
  }, []);
  
  // Reset the form to its initial state
  const resetForm = useCallback(() => {
    setRecord(emptyRecord);
  }, [emptyRecord]);
  
  // Check if the form is valid
  const isValid = useCallback(() => {
    return !!record.condition;
  }, [record.condition]);
  
  return {
    record,
    setRecord,
    updateField,
    addMedication,
    updateMedication,
    removeMedication,
    addFiles,
    removeFile,
    markFileForRemoval,
    resetForm,
    isValid
  };
}

/**
 * Hook for managing multiple record forms
 * 
 * @param {array} initialRecords - Initial records data
 * @returns {object} - Forms state and handlers
 */
export function useMultipleRecordForms(initialRecords = [{}]) {
  const emptyRecord = {
    condition: "",
    diagnosedAt: "",
    medications: [],
    files: [],
    notes: "",
    isChronicCondition: false
  };
  
  const [records, setRecords] = useState(
    initialRecords.length ? initialRecords : [{ ...emptyRecord }]
  );
  
  // Add a new empty record form
  const addRecordForm = useCallback(() => {
    setRecords(prev => [...prev, { ...emptyRecord }]);
  }, []);
  
  // Remove a record form at a specific index
  const removeRecordForm = useCallback((index) => {
    setRecords(prev => {
      if (prev.length <= 1) return prev; // Don't remove if it's the last one
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);
  
  // Update a specific record
  const updateRecord = useCallback((index, updatedRecord) => {
    setRecords(prev => {
      const updated = [...prev];
      updated[index] = updatedRecord;
      return updated;
    });
  }, []);
  
  // Update a specific field in a specific record
  const updateRecordField = useCallback((index, field, value) => {
    setRecords(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  }, []);
  
  // Check if all record forms are valid
  const areFormsValid = useCallback(() => {
    return records.every(record => !!record.condition);
  }, [records]);
  
  // Reset all forms
  const resetForms = useCallback(() => {
    setRecords([{ ...emptyRecord }]);
  }, []);
  
  return {
    records,
    setRecords,
    addRecordForm,
    removeRecordForm,
    updateRecord,
    updateRecordField,
    areFormsValid,
    resetForms
  };
}