import React, { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ZoomIn, Clock, Calendar, Tag, FileText, Info } from "lucide-react";
import EditRecordForm from "./EditRecordForm";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils"; 


const MedicationsList = memo(({ medications }) => {
  if (!medications?.length) return null;

  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4 text-indigo-600" />
        Medications:
      </p>
      <div className="flex flex-wrap gap-2">
        {medications.map((med, index) => (
          <Badge
            key={index}
            className="bg-white text-blue-700 border-blue-200 px-3 py-1 rounded-full hover:bg-white hover:text-blue-700"
          >
            {med}
          </Badge>
        ))}
      </div>
    </div>
  );
});

const Attachments = memo(({ filePaths, setEnlargedImage, saveLoading, localSaveLoading }) => {
  if (!filePaths?.length) return null;

  const getCleanFileName = (path) => {
    const fileName = path.split("/").pop();
    return decodeURIComponent(fileName.replace(/^\d+_/, ""));
  };

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-indigo-600" />
        Attachments:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
        {filePaths.map((path, index) => (
          <div key={index} className="flex flex-col items-center">
            {path.match(/\.(jpg|png|jpeg)$/i) ? (
              <div className="text-center bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                <div className="mb-1 relative">
                  <img
                    src={path}
                    alt="Medical record attachment"
                    className="w-24 h-24 object-cover rounded-md"
                    loading="lazy"
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
  );
});

const Notes = memo(({ notes }) => {
  if (!notes || notes === "No additional notes") return null;

  return (
    <div className="bg-blue-50 p-3 rounded-lg mt-3">
      <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
        <FileText className="h-4 w-4 text-indigo-600" />
        Notes:
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
    </div>
  );
});


MedicationsList.displayName = "MedicationsList";
Attachments.displayName = "Attachments";
Notes.displayName = "Notes";

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

  // Memoize the save handler to prevent unnecessary re-creation
  const handleSaveEditedRecord = useCallback(async () => {
    if (!editingRecord || !editingRecord.condition || !editingRecord._id) {
      showErrorToast("Condition is required or record ID is missing");
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
        success: (response) => {
          console.log(response.data.message=== "No changes have been made")
          if (response.data.message === "No changes have been made") {
              showNoChangesToast("No changes have been made");
              return null;
          }else{
            showSuccessToast("Record updated successfully");
            return null;
          }
        },
        error: (error) => {
          const errorData = error.response?.data || {};
          const errorMessage = errorData.message ||
            (errorData.errorCode === "PATIENT_NOT_FOUND"
              ? "Patient not found"
              : errorData.errorCode === "RECORD_NOT_FOUND"
              ? "Record not found"
              : "Error updating record");
              showErrorToast(errorMessage);
              return null;
        },
      });

      await fetchRecords();
      setEditingRecord(null);
    } catch (error) {
  
    } finally {
      setLocalSaveLoading(false);
    }
  }, [editingRecord, patientId, fetchRecords, setEditingRecord]);

  // Memoize the delete handler
  const handleDeleteClick = useCallback(() => {
    if (record && record._id) {
      onDelete(record._id);
      setShowDeleteModal(true);
    }
  }, [record, onDelete, setShowDeleteModal]);

  // If this record is being edited, show the edit form
  if (editingRecord && editingRecord._id === record._id) {
    return (
      <Card className="bg-white rounded-xl overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-200">
        <EditRecordForm
          record={editingRecord}
          setRecord={setEditingRecord}
          onSave={handleSaveEditedRecord}
          onCancel={() => setEditingRecord(null)}
          setEnlargedImage={setEnlargedImage}
          saveLoading={localSaveLoading}
          disabled={localSaveLoading || saveLoading}
        />
      </Card>
    );
  }

  // Otherwise show the record details
  return (
    <Card className="bg-white rounded-xl overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-1">
            {/* Condition and Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-blue-800">{record.condition || "Unnamed Condition"}</h3>
              <Badge
                className={`${record.isChronicCondition
                  ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                  : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700"} px-3 py-1 rounded-full`}
              >
                {record.isChronicCondition ? "Chronic" : "Acute"}
              </Badge>
            </div>

            {/* Diagnosis Date */}
            {record.diagnosedAt && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>
                    Diagnosed: <span className="font-medium">{new Date(record.diagnosedAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Medications */}
            <MedicationsList medications={record.medications} />

            {/* Files/Attachments */}
            <Attachments
              filePaths={record.filePaths}
              setEnlargedImage={setEnlargedImage}
              saveLoading={saveLoading}
              localSaveLoading={localSaveLoading}
            />

            {/* Notes */}
            <Notes notes={record.notes} />
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Last Updated */}
            {record.updatedAt && (
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-indigo-400" />
                Last Modified: {new Date(record.updatedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            )}

            {/* Action Buttons */}
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
                onClick={handleDeleteClick}
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
    </Card>
  );
};

export default memo(RecordItem);