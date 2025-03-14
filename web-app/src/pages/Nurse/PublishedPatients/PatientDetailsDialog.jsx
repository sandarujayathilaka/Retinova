import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UsersIcon, Loader2, Phone, Mail } from "lucide-react"; // Added Phone and Mail icons
import CustomDatePicker from "../CommonFiles/CustomDatePicker";
import { api } from "../../../services/api.service"; // Assuming this is your API service
import { useState, useEffect, useRef } from "react";

const PatientDetailsDialog = ({
  patient,
  doctors,
  selectedDoctorId,
  setSelectedDoctorId,
  revisitDate,
  setRevisitDate,
  patientCounts,
  setPatientCounts,
  onClose,
  onAssignRevisit,
  fetchPatientCountForDate,
}) => {
  const [loading, setLoading] = useState(false); // Loading state for submission
  const isSubmitting = useRef(false); // Ref to prevent double submissions in Strict Mode

  useEffect(() => {
    console.log("PatientDetailsDialog mounted or updated with patient:", patient?.patientId);
    return () => {
      console.log("PatientDetailsDialog unmounted, resetting isSubmitting");
      isSubmitting.current = false; // Reset submission flag on unmount
    };
  }, []);

  const getDoctorLabel = (doctor) => {
    if (!doctor || !patient) return "Unknown Doctor";
    const latestDiagnosis = patient.diagnoseHistory
      ?.slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const isLatest = latestDiagnosis?.doctorId === doctor._id?.toString();
    return `${doctor.name || "N/A"} (${doctor.specialty || "N/A"}${isLatest ? " - Latest" : ""})`;
  };

  const isDateDisabled = (date) => {
    if (!selectedDoctorId) return false;
    const doctor = doctors.find((d) => d._id?.toString() === selectedDoctorId);
    if (!doctor) return false;

    const day = date.toLocaleString("en-US", { weekday: "long" });
    const isWorkingDay = !!doctor.workingHours[day];
    const isDayOff = doctor.daysOff?.some((dayOff) => {
      const start = new Date(dayOff.startDate);
      const end = new Date(dayOff.endDate);
      return date >= start && date <= end;
    }) || false;

    return !isWorkingDay || isDayOff;
  };

  const handleDateChange = async (date) => {
    if (date && isDateDisabled(date)) {
      console.log("Invalid date selected:", date);
      setRevisitDate(null);
      setPatientCounts({});
    } else {
      setRevisitDate(date);
      if (date && selectedDoctorId) {
        const count = await fetchPatientCountForDate(date, selectedDoctorId);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dateStr = utcDate.toISOString().split("T")[0];
        setPatientCounts({ [dateStr]: count });
      }
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    if (revisitDate && isDateDisabled(revisitDate)) {
      console.log("Invalid date for new doctor:", doctorId, revisitDate);
      setRevisitDate(null);
      setPatientCounts({});
    } else if (revisitDate && doctorId) {
      fetchPatientCountForDate(revisitDate, doctorId).then((count) => {
        const utcDate = new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate()));
        const dateStr = utcDate.toISOString().split("T")[0];
        setPatientCounts({ [dateStr]: count });
      });
    }
  };

  const handleAssignRevisit = async () => {
    if (!selectedDoctorId || !revisitDate) {
      console.log("Validation failed: Missing doctor or revisit date");
      return;
    }

    if (isSubmitting.current) {
      console.log("Duplicate submission prevented. isSubmitting:", isSubmitting.current);
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      console.log("Sending request for patient:", patient.patientId, "with doctor:", selectedDoctorId, "and date:", revisitDate.toISOString());
      const response = await api.put(`/patients/${patient.patientId}/revisit`, {
        doctorId: selectedDoctorId,
        revisitDate: revisitDate.toISOString(),
      });

      console.log("API Response:", response.data);
      onAssignRevisit({ success: true, message: "Revisit date assigned successfully", data: response.data });
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const errorData = error.response?.data || {};
      const errorMessage =
        errorData.message ||
        (errorData.success === false
          ? errorData.message === "Doctor ID and next visit date are required"
            ? "Doctor ID and revisit date are required"
            : errorData.message.includes("Patient with ID")
            ? "Patient not found"
            : "Error assigning revisit date"
          : "Error assigning revisit date");
      onAssignRevisit({ error: errorMessage });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
      console.log("Submission completed. isSubmitting reset to:", isSubmitting.current);
    }
  };

  const renderDayContents = (day, date) => {
    const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split("T")[0];
    const count = patientCounts[dateStr] || 0;
    return (
      <div className="relative flex flex-col items-center">
        <span>{day}</span>
        {count > 0 && (
          <span className="text-xs text-teal-600 font-semibold absolute -bottom-2">{count}</span>
        )}
      </div>
    );
  };

  // Filter out doctors with invalid or missing _id
  const validDoctors = doctors.filter((doctor) => doctor._id && typeof doctor._id === "string");

  // Check if contact number and email are valid for button enabling
  const isContactValid = patient?.contactNumber && /^\+?[\d\s-]{10,}$/.test(patient.contactNumber.replace(/\s|-/g, ""));
  const isEmailValid = patient?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email);

  return (
    <Dialog open={!!patient} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] rounded-xl shadow-2xl bg-white p-0 overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 p-6 sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon className="h-6 w-6" />
            Patient Details - {patient?.patientId}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-teal-700 mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Name</span>
                <span className="text-gray-900">{patient?.fullName || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Gender</span>
                <span className="text-gray-900">{patient?.gender || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">NIC</span>
                <span className="text-gray-900">{patient?.nic || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Contact</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{patient?.contactNumber || "N/A"}</span>
                  {isContactValid && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg bg-white text-teal-600 border-teal-300 hover:bg-teal-50"
                      onClick={() => window.location.href = `tel:${patient.contactNumber.replace(/\s|-/g, "")}`}
                    >
                      <Phone className="h-4 w-4 mr-1" /> Call
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Email</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{patient?.email || "N/A"}</span>
                  {isEmailValid && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg bg-white text-teal-600 border-teal-300 hover:bg-teal-50"
                      onClick={() => window.location.href = `mailto:${patient.email}`}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Email
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Address</span>
                <span className="text-gray-900">{patient?.address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assign Doctor</label>
            <Select value={selectedDoctorId} onValueChange={handleDoctorChange} disabled={loading}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200">
                {patient && patient.diagnoseHistory?.length > 0 ? (
                  validDoctors.length > 0 ? (
                    validDoctors
                      .filter((doctor) => patient.diagnoseHistory.some((d) => d.doctorId === doctor._id))
                      .map((doctor) => (
                        <SelectItem
                          key={doctor._id}
                          value={doctor._id}
                          className="hover:bg-teal-50"
                        >
                          {getDoctorLabel(doctor)}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled className="text-gray-500">
                      Loading doctors...
                    </SelectItem>
                  )
                ) : (
                  <SelectItem value="none" disabled className="text-gray-500">
                    No doctors available for this patient
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedDoctorId && (
            <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-teal-700 mb-3">Doctor Information</h3>
              {(() => {
                const doctor = validDoctors.find((d) => d._id === selectedDoctorId);
                return doctor ? (
                  <div className="space-y-4 text-sm">
                    <p><span className="font-medium text-gray-700">Name:</span> {doctor.name || "N/A"}</p>
                    <p><span className="font-medium text-gray-700">Type:</span> {doctor.type || "N/A"}</p>
                    <p><span className="font-medium text-gray-700">Specialty:</span> {doctor.specialty || "N/A"}</p>
                    <div>
                      <span className="font-medium text-gray-700">Working Days:</span>
                      <ul className="list-disc pl-5 text-gray-900">
                        {Object.entries(doctor.workingHours || {})
                          .filter(([, hours]) => hours)
                          .map(([day, { startTime, endTime }]) => (
                            <li key={day}>{day}: {startTime} - {endTime}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Days Off:</span>
                      <ul className="list-disc pl-5 text-gray-900">
                        {doctor.daysOff?.length > 0 ? (
                          doctor.daysOff.map((dayOff, index) => (
                            <li key={index}>
                              {new Date(dayOff.startDate).toLocaleDateString()} - {new Date(dayOff.endDate).toLocaleDateString()}
                            </li>
                          ))
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No doctor details available.</p>
                );
              })()}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Schedule Revisit Date</label>
            <CustomDatePicker
              selected={revisitDate}
              onChange={handleDateChange}
              minDate={new Date()}
              filterDate={(date) => !isDateDisabled(date)}
              placeholderText="Select a date"
              renderDayContents={renderDayContents}
              disabled={loading}
            />
            {revisitDate && (
              <p className="text-sm text-gray-600 mt-1">
                Patient Count for {revisitDate.toLocaleDateString()}:{" "}
                <span className="font-semibold text-teal-600">
                  {patientCounts[new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())).toISOString().split("T")[0]] || 0}
                </span>
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="bg-gray-100 p-4 flex justify-end gap-3 sticky bottom-0 z-10">
          <Button
            variant="outline"
            className="rounded-lg bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="rounded-lg bg-teal-600 text-white hover:bg-teal-700"
            onClick={handleAssignRevisit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Revisit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailsDialog;