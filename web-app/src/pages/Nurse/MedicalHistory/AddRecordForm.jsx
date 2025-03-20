
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Loader2, Plus, FileText, PlusCircle, AlertCircle,CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AddRecordForm = ({ newRecords, setNewRecords, onSave, onCancel, saveLoading, disabled }) => {
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddNewRecord = () => {
    if (!localLoading) {
      setNewRecords([...newRecords, { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false }]);
    }
  };

  const handleRemoveRecord = (index) => {
    if (!localLoading) {
      setNewRecords(newRecords.filter((_, i) => i !== index));
    }
  };

  const handleAddMedication = (recordIndex) => {
    if (!localLoading) {
      const updatedRecords = [...newRecords];
      updatedRecords[recordIndex].medications.push("");
      setNewRecords(updatedRecords);
    }
  };

  const handleRemoveMedication = (recordIndex, medIndex) => {
    if (!localLoading) {
      const updatedRecords = [...newRecords];
      updatedRecords[recordIndex].medications = updatedRecords[recordIndex].medications.filter((_, i) => i !== medIndex);
      setNewRecords(updatedRecords);
    }
  };

  const handleMedicationChange = (recordIndex, medIndex, value) => {
    if (!localLoading) {
      const updatedRecords = [...newRecords];
      updatedRecords[recordIndex].medications[medIndex] = value;
      setNewRecords(updatedRecords);
    }
  };

  const handleAddFiles = (recordIndex, e) => {
    if (!localLoading) {
      const files = Array.from(e.target.files);
      const updatedRecords = [...newRecords];
      updatedRecords[recordIndex].files = [...updatedRecords[recordIndex].files, ...files];
      setNewRecords(updatedRecords);
    }
  };

  const handleRemoveFile = (recordIndex, fileIndex) => {
    if (!localLoading) {
      const updatedRecords = [...newRecords];
      updatedRecords[recordIndex].files = updatedRecords[recordIndex].files.filter((_, i) => i !== fileIndex);
      setNewRecords(updatedRecords);
    }
  };

  const handleSave = () => {
    if (!localLoading && !disabled) {
      setLocalLoading(true);
      onSave().finally(() => setLocalLoading(false));
    }
  };

  return (
    <Card className="bg-white rounded-xl overflow-hidden border border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
        <CardTitle className="text-xl font-semibold text-blue-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-indigo-600" /> 
          Add New Medical Record
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {newRecords.map((record, recordIndex) => (
          <div 
            key={recordIndex} 
            className="space-y-5 p-5 bg-blue-50 rounded-xl border border-blue-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  Condition <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Hypertension"
                  value={record.condition}
                  onChange={(e) => {
                    if (!localLoading) {
                      const updatedRecords = [...newRecords];
                      updatedRecords[recordIndex].condition = e.target.value;
                      setNewRecords(updatedRecords);
                    }
                  }}
                  required
                  disabled={localLoading || disabled}
                  className="mt-1 h-10 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <CalendarIcon className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  Diagnosed Date
                </label>
                <Input
                  type="date"
                  value={record.diagnosedAt}
                  onChange={(e) => {
                    if (!localLoading) {
                      const updatedRecords = [...newRecords];
                      updatedRecords[recordIndex].diagnosedAt = e.target.value;
                      setNewRecords(updatedRecords);
                    }
                  }}
                  disabled={localLoading || disabled}
                  className="mt-1 h-10 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <PlusCircle className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  Condition Type
                </label>
                <select
                  value={record.isChronicCondition ? "Chronic" : "Acute"}
                  onChange={(e) => {
                    if (!localLoading) {
                      const updatedRecords = [...newRecords];
                      updatedRecords[recordIndex].isChronicCondition = e.target.value === "Chronic";
                      setNewRecords(updatedRecords);
                    }
                  }}
                  disabled={localLoading || disabled}
                  className="mt-1 block w-full h-10 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                >
                  <option value="Acute">Acute</option>
                  <option value="Chronic">Chronic</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <FileText className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Medications
              </label>
              {record.medications.map((med, medIndex) => (
                <div key={medIndex} className="flex items-center gap-2">
                  <Input
                    value={med}
                    onChange={(e) => handleMedicationChange(recordIndex, medIndex, e.target.value)}
                    placeholder={`Medication ${medIndex + 1}`}
                    disabled={localLoading || disabled}
                    className="h-10 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md"
                  />
                  <Button
                    onClick={() => handleRemoveMedication(recordIndex, medIndex)}
                    variant="ghost"
                    size="icon"
                    disabled={localLoading || disabled}
                    className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => handleAddMedication(recordIndex)}
                variant="outline"
                size="sm"
                disabled={localLoading || disabled}
                className="mt-2 h-9 px-4 text-sm rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Medication
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Upload className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Attachments
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById(`file-input-${recordIndex}`).click()}
                  disabled={localLoading || disabled}
                  className="h-9 px-4 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload Files
                </Button>
                <input
                  id={`file-input-${recordIndex}`}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleAddFiles(recordIndex, e)}
                  disabled={localLoading || disabled}
                  className="hidden"
                />
              </div>
              {record.files.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {record.files.map((file, fileIndex) => (
                    <li key={fileIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 max-w-md">
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(recordIndex, fileIndex)}
                        disabled={localLoading || disabled}
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <FileText className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Notes
              </label>
              <textarea
                placeholder="Additional notes"
                value={record.notes}
                onChange={(e) => {
                  if (!localLoading) {
                    const updatedRecords = [...newRecords];
                    updatedRecords[recordIndex].notes = e.target.value;
                    setNewRecords(updatedRecords);
                  }
                }}
                disabled={localLoading || disabled}
                className="mt-1 block w-full min-w-[300px] max-w-full rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 resize-y min-h-[100px]"
              />
            </div>

            {newRecords.length > 1 && (
              <Button
                onClick={() => handleRemoveRecord(recordIndex)}
                variant="outline"
                disabled={localLoading || disabled}
                className="w-full h-10 rounded-lg text-red-600 hover:bg-red-50 border-red-200"
              >
                <X className="h-4 w-4 mr-2" /> Remove This Record
              </Button>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={handleAddNewRecord}
            variant="outline"
            disabled={localLoading || disabled}
            className="h-10 px-5 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Record
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="ghost"
              disabled={localLoading || disabled}
              className="h-10 px-5 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={localLoading || disabled}
              className="h-10 px-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {localLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Records
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddRecordForm;