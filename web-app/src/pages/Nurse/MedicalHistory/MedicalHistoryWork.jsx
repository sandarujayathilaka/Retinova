
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../../services/api.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  CalendarIcon,
  Trash2,
  X,
  Loader2,
  Pencil,
  ZoomIn,
  ZoomOut,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

const MedicalHistory = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [newRecords, setNewRecords] = useState([
    { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageContainerRef = useRef(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patients/${patientId}/medical-records`);
      const medicalHistory = Array.isArray(response.data.medicalHistory)
        ? response.data.medicalHistory.filter((record) => record && typeof record === "object")
        : [];
      setRecords(medicalHistory);
    } catch (error) {
      handleApiError(error, "Error fetching medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const handleAddMultipleRecords = async () => {
 
    const invalidRecords = newRecords.filter((record) => !record.condition);
    if (invalidRecords.length > 0) {
      return toast.error("Condition is required for all records");
    }


    try {
      const formData = new FormData();
      newRecords.forEach((record, index) => {
        console.log(`Appending record[${index}]:`, record);
        formData.append(`records[${index}][condition]`, record.condition);
        if (record.diagnosedAt) formData.append(`records[${index}][diagnosedAt]`, record.diagnosedAt);
        record.medications.forEach((med, medIndex) => {
          if (med) formData.append(`records[${index}][medications][${medIndex}]`, med);
        });
        record.files.forEach((file, fileIndex) => {
          formData.append(`records[${index}][files][${fileIndex}]`, file);
        });
        formData.append(`records[${index}][notes]`, record.notes || "");
        formData.append(
          `records[${index}][isChronicCondition]`,
          (record.isChronicCondition ?? false).toString()
        );
      });

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      await api.post(`/patients/${patientId}/medical-records`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Medical records added successfully");
      await fetchRecords();
      setNewRecords([
        { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false },
      ]);
      setShowAddForm(false);
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error, "Error adding medical records");
    }
  };

  const handleEditRecord = (record) => {
    if (!record || !record._id) {
      toast.error("Cannot edit this record: Invalid data");
      return;
    }

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
  };

  const handleSaveEditedRecord = async () => {
    if (!editingRecord || !editingRecord.condition || !editingRecord._id) {
      return toast.error("Condition is required or record ID is missing");
    }

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

    try {
      await api.put(`/patients/${patientId}/medical-records/${editingRecord._id}`, formData);
      toast.success("Record updated successfully");
      await fetchRecords();
      setEditingRecord(null);
    } catch (error) {
      handleApiError(error, "Error updating record");
    }
  };

  const handleAddNewRecord = () => {
    setNewRecords([...newRecords, { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false }]);
  };

  const handleRemoveRecord = (index) => {
    const updatedRecords = newRecords.filter((_, i) => i !== index);
    setNewRecords(updatedRecords);
  };

  const handleAddMedication = (recordIndex) => {
    const updatedRecords = [...newRecords];
    updatedRecords[recordIndex].medications.push("");
    setNewRecords(updatedRecords);
  };

  const handleRemoveMedication = (recordIndex, medIndex) => {
    const updatedRecords = [...newRecords];
    updatedRecords[recordIndex].medications = updatedRecords[recordIndex].medications.filter(
      (_, i) => i !== medIndex
    );
    setNewRecords(updatedRecords);
  };

  const handleMedicationChange = (recordIndex, medIndex, value) => {
    const updatedRecords = [...newRecords];
    updatedRecords[recordIndex].medications[medIndex] = value;
    setNewRecords(updatedRecords);
  };

  const handleAddEditMedication = () => {
    setEditingRecord((prev) => ({
      ...prev,
      medications: [...prev.medications, ""],
    }));
  };

  const handleRemoveEditMedication = (medIndex) => {
    setEditingRecord((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== medIndex),
    }));
  };

  const confirmDeleteRecord = (recordId) => {
    if (!recordId) {
      toast.error("Cannot delete: Record ID is missing");
      return;
    }
    setRecordToDelete(recordId);
    setShowDeleteModal(true);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) {
      toast.error("No record selected for deletion");
      setShowDeleteModal(false);
      return;
    }
    try {
      await api.delete(`/patients/${patientId}/medical-records/${recordToDelete}`);
      toast.success("Medical record deleted successfully");
      await fetchRecords();
      setShowDeleteModal(false);
      setRecordToDelete(null);
    } catch (error) {
      handleApiError(error, "Error deleting record");
    }
  };

  const handleApiError = (error, defaultMessage) => {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
  };

  const handleEditMedicationChange = (medIndex, value) => {
    setEditingRecord((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) => (i === medIndex ? value : med)),
    }));
  };

  const handleAddFiles = (recordIndex, e) => {
    const files = Array.from(e.target.files);
    const updatedRecords = [...newRecords];
    updatedRecords[recordIndex].files = [...updatedRecords[recordIndex].files, ...files];
    setNewRecords(updatedRecords);
  };

  const handleRemoveFile = (recordIndex, fileIndex) => {
    const updatedRecords = [...newRecords];
    updatedRecords[recordIndex].files = updatedRecords[recordIndex].files.filter(
      (_, i) => i !== fileIndex
    );
    setNewRecords(updatedRecords);
  };

  const handleAddEditFiles = (e) => {
    const files = Array.from(e.target.files);
    setEditingRecord((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleRemoveEditFile = (fileIndex) => {
    setEditingRecord((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== fileIndex),
    }));
  };

  const handleRemoveExistingFile = (path) => {
    setEditingRecord((prev) => ({
      ...prev,
      filesToRemove: [...(prev.filesToRemove || []), path],
      filePaths: prev.filePaths.filter((p) => p !== path),
    }));
  };

  const getCleanFileName = (path) => {
    const fileName = path.split("/").pop();
    const cleanName = fileName.replace(/^\d+_/, "");
    return decodeURIComponent(cleanName);
  };

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev * 1.2 : prev / 1.2;
      const clampedZoom = Math.min(Math.max(0.5, newZoom), 3);
      setPosition({ x: 0, y: 0 });
      return clampedZoom;
    });
  };

  const handleImageLoad = (e) => {
    setImageSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scaledWidth = imageSize.width * zoomLevel;
    const scaledHeight = imageSize.height * zoomLevel;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    const minY = -maxY;

    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    newX = Math.min(Math.max(newX, minX), maxX);
    newY = Math.min(Math.max(newY, minY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!enlargedImage) {
      setPosition({ x: 0, y: 0 });
      setImageSize({ width: 0, height: 0 });
      setZoomLevel(1);
    }
  }, [enlargedImage]);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-teal-800 flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-teal-600" /> Patient Medical History
        </h2>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingRecord(null); // Close edit form if open
            setNewRecords([
              { condition: "", diagnosedAt: "", medications: [], files: [], notes: "", isChronicCondition: false },
            ]);
          }}
          className="bg-teal-600 hover:bg-teal-700 rounded-full px-6 py-2 text-white font-medium shadow-md transition-all duration-200"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Record
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {showAddForm && (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6 border border-teal-100">
              <h3 className="text-xl font-semibold text-teal-800">Add New Medical Record</h3>
              {newRecords.map((record, recordIndex) => (
                <div key={recordIndex} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="e.g., Hypertension"
                        value={record.condition}
                        onChange={(e) => {
                          const updatedRecords = [...newRecords];
                          updatedRecords[recordIndex].condition = e.target.value;
                          setNewRecords(updatedRecords);
                        }}
                        required
                        className="mt-1 border-teal-200 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Diagnosed Date</label>
                      <Input
                        type="date"
                        value={record.diagnosedAt}
                        onChange={(e) => {
                          const updatedRecords = [...newRecords];
                          updatedRecords[recordIndex].diagnosedAt = e.target.value;
                          setNewRecords(updatedRecords);
                        }}
                        className="mt-1 border-teal-200 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Condition Type</label>
                      <select
                        value={record.isChronicCondition ? "Chronic" : "Acute"}
                        onChange={(e) => {
                          const updatedRecords = [...newRecords];
                          updatedRecords[recordIndex].isChronicCondition = e.target.value === "Chronic";
                          setNewRecords(updatedRecords);
                        }}
                        className="mt-1 block w-full border border-teal-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2"
                      >
                        <option value="Acute">Acute</option>
                        <option value="Chronic">Chronic</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Medications</label>
                    {record.medications.length > 0 && (
                      record.medications.map((med, medIndex) => (
                        <div key={medIndex} className="flex items-center gap-2">
                          <Input
                            value={med}
                            onChange={(e) => handleMedicationChange(recordIndex, medIndex, e.target.value)}
                            placeholder={`Medication ${medIndex + 1}`}
                            className="border-teal-200 focus:ring-teal-500 max-w-md"
                          />
                          <Button
                            onClick={() => handleRemoveMedication(recordIndex, medIndex)}
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                    <Button
                      onClick={() => handleAddMedication(recordIndex)}
                      variant="outline"
                      size="sm"
                      className="text-teal-600 hover:bg-teal-100"
                    >
                      + Add Medication
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Attachments</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById(`file-input-${recordIndex}`).click()}
                        className="text-teal-600 hover:bg-teal-100"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload Files
                      </Button>
                      <input
                        id={`file-input-${recordIndex}`}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleAddFiles(recordIndex, e)}
                        className="hidden"
                      />
                    </div>
                    {record.files.length > 0 && (
                      <ul className="space-y-2 mt-2">
                        {record.files.map((file, fileIndex) => (
                          <li key={fileIndex} className="flex items-center justify-between bg-gray-100 p-2 rounded-md max-w-md">
                            <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveFile(recordIndex, fileIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      placeholder="Additional notes"
                      value={record.notes}
                      onChange={(e) => {
                        const updatedRecords = [...newRecords];
                        updatedRecords[recordIndex].notes = e.target.value;
                        setNewRecords(updatedRecords);
                      }}
                      className="mt-1 block w-full min-w-[300px] max-w-full border border-teal-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2 resize-y min-h-[100px]"
                    />
                  </div>

                  {newRecords.length > 1 && (
                    <Button
                      onClick={() => handleRemoveRecord(recordIndex)}
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      Remove This Record
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center">
                <Button onClick={handleAddNewRecord} variant="outline" className="text-teal-600 hover:bg-teal-100">
                  + Add Another Record
                </Button>
                <div className="flex gap-3">
                  <Button onClick={() => setShowAddForm(false)} variant="ghost" className="text-gray-600">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMultipleRecords}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Save Records
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
         
            {records.length > 0 ? (
              records.map((record) =>
                record && record._id ? (
                  <div key={record._id} className="bg-white p-6 rounded-lg shadow-md border border-teal-100 hover:shadow-lg transition-shadow duration-200">
                     <h3 className="text-xl font-semibold text-teal-800 mb-4">Edit Medical Record</h3>
                    {editingRecord && editingRecord._id === record._id ? (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                   
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                            <Input
                              value={editingRecord.condition}
                              onChange={(e) => setEditingRecord({ ...editingRecord, condition: e.target.value })}
                              placeholder="e.g., Diabetes"
                              required
                              className="mt-1 border-teal-200 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Diagnosed Date</label>
                            <Input
                              type="date"
                              value={editingRecord.diagnosedAt}
                              onChange={(e) => setEditingRecord({ ...editingRecord, diagnosedAt: e.target.value })}
                              className="mt-1 border-teal-200 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Condition Type</label>
                            <select
                              value={editingRecord.isChronicCondition ? "Chronic" : "Acute"}
                              onChange={(e) =>
                                setEditingRecord({ ...editingRecord, isChronicCondition: e.target.value === "Chronic" })
                              }
                              className="mt-1 block w-full border border-teal-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2"
                            >
                              <option value="Acute">Acute</option>
                              <option value="Chronic">Chronic</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Medications</label>
                          {editingRecord.medications.length > 0 && (
                            editingRecord.medications.map((med, medIndex) => (
                              <div key={medIndex} className="flex items-center gap-2">
                                <Input
                                  value={med}
                                  onChange={(e) => handleEditMedicationChange(medIndex, e.target.value)}
                                  placeholder={`Medication ${medIndex + 1}`}
                                  className="border-teal-200 focus:ring-teal-500 max-w-md"
                                />
                                <Button
                                  onClick={() => handleRemoveEditMedication(medIndex)}
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                          <Button
                            onClick={handleAddEditMedication}
                            variant="outline"
                            size="sm"
                            className="text-teal-600 hover:bg-teal-100"
                          >
                            + Add Medication
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Attachments</label>
                          {editingRecord.filePaths?.length > 0 && (
                            <ul className="space-y-2">
                              {editingRecord.filePaths.map((path, index) => (
                                <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md max-w-md">
                                  {path.match(/\.(jpg|png|jpeg)$/i) ? (
                                    <div className="flex items-center gap-2">
                                      <div className="text-center">
                                        <img
                                          src={path}
                                          alt={`Attachment ${index}`}
                                          className="w-20 h-20 object-cover rounded-md"
                                          onError={() => console.log(`Failed to load image: ${path}`)}
                                        />
                                        <span className="text-xs text-gray-600 block mt-1 truncate max-w-xs">{getCleanFileName(path)}</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setEnlargedImage(path);
                                          setZoomLevel(1);
                                          setPosition({ x: 0, y: 0 });
                                        }}
                                        className="text-teal-600 hover:bg-teal-100"
                                      >
                                        <ZoomIn className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <a
                                      href={path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-teal-600 hover:underline text-sm truncate max-w-xs"
                                    >
                                      {getCleanFileName(path)}
                                    </a>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveExistingFile(path)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById("edit-file-input").click()}
                              className="text-teal-600 hover:bg-teal-100"
                            >
                              <Upload className="h-4 w-4 mr-2" /> Upload Files
                            </Button>
                            <input
                              id="edit-file-input"
                              type="file"
                              multiple
                              accept="image/*,.pdf"
                              onChange={handleAddEditFiles}
                              className="hidden"
                            />
                          </div>
                          {editingRecord.files.length > 0 && (
                            <ul className="space-y-2 mt-2">
                              {editingRecord.files.map((file, fileIndex) => (
                                <li key={fileIndex} className="flex items-center justify-between bg-gray-100 p-2 rounded-md max-w-md">
                                  <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveEditFile(fileIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Notes</label>
                          <textarea
                            value={editingRecord.notes}
                            onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                            placeholder="Additional notes"
                            className="mt-1 block w-full min-w-[300px] max-w-full border border-teal-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2 resize-y min-h-[100px]"
                          />
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button onClick={() => setEditingRecord(null)} variant="ghost" className="text-gray-600">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEditedRecord}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-3 flex-1">
                          <h3 className="text-xl font-semibold text-teal-700">{record.condition || "Unnamed Condition"}</h3>
                          <div className="text-sm text-gray-600">
                            {record.diagnosedAt && (
                              <span>
                                Diagnosed: <span className="font-medium">{new Date(record.diagnosedAt).toLocaleDateString()}</span>
                              </span>
                            )}
                            {record.diagnosedAt && record.hasOwnProperty('isChronicCondition') && (
                              <span className="ml-2">|</span>
                            )}
                            {record.hasOwnProperty('isChronicCondition') && (
                              <span className="ml-2">
                                Type: <span className="font-medium">{record.isChronicCondition ? "Chronic" : "Acute"}</span>
                              </span>
                            )}
                          </div>
                          {record.medications?.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">Medications:</p>
                              <ul className="list-disc pl-4">
                                {record.medications.map((med, index) => (
                                  <li key={index} className="text-sm text-gray-600">{med}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {record.filePaths?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Attachments:</p>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {record.filePaths.map((path, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    {path.match(/\.(jpg|png|jpeg)$/i) ? (
                                      <div className="text-center">
                                        <img
                                          src={path}
                                          alt={record.condition}
                                          className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                          onError={() => console.log(`Failed to load image: ${path}`)}
                                        />
                                        <span className="text-xs text-gray-600 block mt-1 truncate max-w-xs">{getCleanFileName(path)}</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEnlargedImage(path);
                                            setZoomLevel(1);
                                            setPosition({ x: 0, y: 0 });
                                          }}
                                          className="mt-1 text-teal-600 hover:bg-teal-100"
                                        >
                                          <ZoomIn className="h-4 w-4 mr-1" /> View
                                        </Button>
                                      </div>
                                    ) : (
                                      <a
                                        href={path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-teal-600 hover:underline text-sm truncate max-w-xs"
                                      >
                                        {getCleanFileName(path)}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {record.notes && record.notes !== "No additional notes" && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Notes:</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xs text-gray-500">
                            {record.updatedAt &&
                              `Last Modified: ${new Date(record.updatedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                              })}`}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditRecord(record)}
                              variant="outline"
                              size="sm"
                              className="text-teal-600 hover:bg-teal-100"
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button
                              onClick={() => confirmDeleteRecord(record._id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              )
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-md border border-teal-100">
                <p className="text-gray-600 text-lg">No medical records available yet.</p>
              </div>
            )}
          </div>

          <Dialog
            open={showDeleteModal}
            onOpenChange={(isOpen) => {
              setShowDeleteModal(isOpen);
            }}
          >
            <DialogContent
              className="rounded-lg shadow-lg"
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="text-teal-800">Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600">Are you sure you want to delete this medical record? This action cannot be undone.</p>
              <DialogFooter>
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="ghost"
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRecord}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!enlargedImage}
            onOpenChange={(isOpen) => {
              setEnlargedImage(isOpen ? enlargedImage : null);
            }}
          >
            <DialogContent
              className="max-w-5xl p-6 bg-white rounded-lg shadow-xl border border-teal-200"
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <div className="relative" ref={imageContainerRef}>
                <div
                  className="flex justify-center items-center overflow-auto max-h-[80vh] cursor-grab"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: "none" }}
                >
                  <img
                    src={enlargedImage}
                    alt="Enlarged view"
                    className="w-auto h-auto object-contain rounded-md"
                    onLoad={handleImageLoad}
                    style={{
                      transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                      transition: isDragging ? "none" : "transform 0.2s ease-in-out",
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    onClick={() => handleZoom("in")}
                    variant="outline"
                    size="icon"
                    className="bg-white text-teal-600 hover:bg-teal-100"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => handleZoom("out")}
                    variant="outline"
                    size="icon"
                    className="bg-white text-teal-600 hover:bg-teal-100"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 bg-white px-2 py-1 rounded-md shadow text-sm text-gray-700">
                  {enlargedImage && getCleanFileName(enlargedImage)}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;