
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, ZoomIn, Loader2, Save, Plus, PlusCircle, AlertCircle, FileText, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const EditRecordForm = ({ record, setRecord, onSave, onCancel, setEnlargedImage, saveLoading, disabled }) => {
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddMedication = () => {
    if (!localLoading) {
      setRecord((prev) => ({ ...prev, medications: [...prev.medications, ""] }));
    }
  };

  const handleRemoveMedication = (medIndex) => {
    if (!localLoading) {
      setRecord((prev) => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== medIndex),
      }));
    }
  };

  const handleMedicationChange = (medIndex, value) => {
    if (!localLoading) {
      setRecord((prev) => ({
        ...prev,
        medications: prev.medications.map((med, i) => (i === medIndex ? value : med)),
      }));
    }
  };

  const handleAddFiles = (e) => {
    if (!localLoading) {
      const files = Array.from(e.target.files);
      setRecord((prev) => ({ ...prev, files: [...prev.files, ...files] }));
    }
  };

  const handleRemoveFile = (fileIndex) => {
    if (!localLoading) {
      setRecord((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== fileIndex) }));
    }
  };

  const handleRemoveExistingFile = (path) => {
    if (!localLoading) {
      setRecord((prev) => ({
        ...prev,
        filesToRemove: [...(prev.filesToRemove || []), path],
        filePaths: prev.filePaths.filter((p) => p !== path),
      }));
    }
  };

  const getCleanFileName = (path) => {
    const fileName = path.split("/").pop();
    return decodeURIComponent(fileName.replace(/^\d+_/, ""));
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
          Edit Medical Record
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-5 p-5 bg-blue-50 rounded-xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <AlertCircle className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Condition <span className="text-red-500">*</span>
              </label>
              <Input
                value={record.condition}
                onChange={(e) => setRecord({ ...record, condition: e.target.value })}
                placeholder="e.g., Diabetes"
                required
                disabled={localLoading || disabled}
                className="mt-1 h-10 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Calendar className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Diagnosed Date
              </label>
              <Input
                type="date"
                value={record.diagnosedAt}
                onChange={(e) => setRecord({ ...record, diagnosedAt: e.target.value })}
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
                onChange={(e) => setRecord({ ...record, isChronicCondition: e.target.value === "Chronic" })}
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
                  onChange={(e) => handleMedicationChange(medIndex, e.target.value)}
                  placeholder={`Medication ${medIndex + 1}`}
                  disabled={localLoading || disabled}
                  className="h-10 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md"
                />
                <Button
                  onClick={() => handleRemoveMedication(medIndex)}
                  variant="ghost"
                  size="icon"
                  disabled={localLoading || disabled}
                  className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={handleAddMedication}
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
            
            {record.filePaths?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {record.filePaths.map((path, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                    {path.match(/\.(jpg|png|jpeg)$/i) ? (
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <img
                            src={path}
                            alt={`Attachment ${index}`}
                            className="w-16 h-16 object-cover rounded-md border border-blue-200"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-gray-600 truncate max-w-xs">{getCleanFileName(path)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEnlargedImage(path)}
                            disabled={localLoading || disabled}
                            className="h-7 px-2 text-xs rounded-full border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <ZoomIn className="h-3 w-3 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-xs flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {getCleanFileName(path)}
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExistingFile(path)}
                      disabled={localLoading || disabled}
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById("edit-file-input").click()}
                disabled={localLoading || disabled}
                className="h-9 px-4 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Files
              </Button>
              <input
                id="edit-file-input"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleAddFiles}
                disabled={localLoading || disabled}
                className="hidden"
              />
            </div>
            
            {record.files.length > 0 && (
              <ul className="space-y-2 mt-2">
                {record.files.map((file, fileIndex) => (
                  <li key={fileIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 max-w-md">
                    <span className="text-sm text-gray-700 truncate max-w-xs flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(fileIndex)}
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
              value={record.notes}
              onChange={(e) => setRecord({ ...record, notes: e.target.value })}
              placeholder="Additional notes"
              disabled={localLoading || disabled}
              className="mt-1 block w-full min-w-[300px] max-w-full rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 resize-y min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditRecordForm;