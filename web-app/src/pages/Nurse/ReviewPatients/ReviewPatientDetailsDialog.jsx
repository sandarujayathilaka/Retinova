import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Users, Loader2, Phone, Mail, User2, IdCard, CalendarCheck, Clock, MapPin, Clipboard, X, Check, Circle } from "lucide-react";
import CustomDatePicker from "../CommonFiles/CustomDatePicker";
import { api } from "../../../services/api.service";
import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

function useDebounce(callback, delay) {
  const timerRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

const ReviewPatientDetailsDialog = ({
  patient,
  doctors,
  selectedDoctorId: initialSelectedDoctorId,
  setSelectedDoctorId,
  revisitDate: initialRevisitDate,
  setRevisitDate,
  patientCounts,
  setPatientCounts,
  onClose,
  onAssignRevisit,
  fetchPatientCountForDate,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDoctorId, setLocalSelectedDoctorId] = useState(initialSelectedDoctorId || patient?.doctorId || "");
  const [revisitDate, setLocalRevisitDate] = useState(
    initialRevisitDate || (patient?.nextVisit ? new Date(patient.nextVisit) : null)
  );
  const [patientIncluded, setPatientIncluded] = useState({});
  const isSubmitting = useRef(false);
  const lastFetchedRef = useRef(null);

  useEffect(() => {
    setLocalSelectedDoctorId(initialSelectedDoctorId || patient?.doctorId || "");
    setLocalRevisitDate(initialRevisitDate || (patient?.nextVisit ? new Date(patient.nextVisit) : null));
  }, [initialSelectedDoctorId, initialRevisitDate, patient]);

  useEffect(() => {
    return () => {
      isSubmitting.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedDoctorId(selectedDoctorId);
    setRevisitDate(revisitDate);
  }, [selectedDoctorId, revisitDate, setSelectedDoctorId, setRevisitDate]);

  const debouncedFetchPatientCount = useDebounce(async (date, doctorId) => {
    if (!date || !doctorId) return;

    const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split("T")[0];
    const lastFetchedKey = `${dateStr}-${doctorId}`;

    if (lastFetchedRef.current === lastFetchedKey) return;

    lastFetchedRef.current = lastFetchedKey;

    try {
      const { totalCount, isPatientIncluded } = await fetchPatientCountForDate(date, doctorId);
      setPatientCounts((prev) => {
        const newCounts = { ...prev, [dateStr]: totalCount };
        if (prev[dateStr] !== totalCount) {
          return newCounts;
        }
        return prev;
      });
      setPatientIncluded((prev) => ({
        ...prev,
        [dateStr]: isPatientIncluded,
      }));
    } catch (error) {
      console.error("Error fetching patient count:", error);
    }
  }, 500);

  useEffect(() => {
    if (selectedDoctorId && revisitDate) {
      debouncedFetchPatientCount(revisitDate, selectedDoctorId);
    } else {
      lastFetchedRef.current = null;
    }
  }, [selectedDoctorId, revisitDate, debouncedFetchPatientCount]);

  const getDoctorLabel = (doctor) => {
    if (!doctor || !patient) return `${doctor.name || "N/A"} (${doctor.specialty || "N/A"})`;

    const latestDiagnosis = patient.diagnoseHistory
      ?.slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const isLatest = latestDiagnosis?.doctorId === doctor._id?.toString();
    const isRelated = patient.diagnoseHistory?.some((d) => d.doctorId === doctor._id?.toString());

    let label = `${doctor.name || "N/A"} (${doctor.specialty || "N/A"})`;
    if (isLatest) {
      label += " - Latest";
    } else if (isRelated) {
      label += " - Related";
    }
    return label;
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
      setLocalRevisitDate(null);
      setPatientCounts({});
      setPatientIncluded({});
    } else {
      setLocalRevisitDate(date);
      if (date && selectedDoctorId) {
        debouncedFetchPatientCount(date, selectedDoctorId);
      }
    }
  };

  const handleDoctorChange = (doctorId) => {
    setLocalSelectedDoctorId(doctorId);
    if (revisitDate && isDateDisabled(revisitDate)) {
      setLocalRevisitDate(null);
      setPatientCounts({});
      setPatientIncluded({});
    } else if (revisitDate && doctorId) {
      debouncedFetchPatientCount(revisitDate, doctorId);
    }
  };

  const handleUpdateRevisit = async () => {
    if (!selectedDoctorId || !revisitDate) {
      return;
    }

    if (isSubmitting.current) {
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      const normalizedRevisitDate = new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate()));
      const response = await api.put(`/patients/${patient.patientId}/revisit`, {
        doctorId: selectedDoctorId,
        revisitDate: normalizedRevisitDate.toISOString(),
      });

      onAssignRevisit({ success: true, message: "Revisit updated successfully", data: response.data });
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage =
        errorData.message ||
        (errorData.success === false
          ? errorData.message === "Doctor ID and next visit date are required"
            ? "Doctor ID and revisit date are required"
            : errorData.message.includes("Patient with ID")
            ? "Patient not found"
            : "Error updating revisit"
          : "Error updating revisit");
      onAssignRevisit({ error: errorMessage });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const renderDayContents = (day, date) => {
    const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split("T")[0];
    const count = patientCounts[dateStr] || 0;
    return (
      <div className="relative flex flex-col items-center">
        <span>{day}</span>
        {count > 0 && (
          <span className="text-xs text-indigo-600 font-semibold absolute -bottom-2">{count}</span>
        )}
      </div>
    );
  };

  const validDoctors = doctors.filter((doctor) => doctor._id && typeof doctor._id === "string");

  const isContactValid = patient?.contactNumber && /^\+?[\d\s-]{10,}$/.test(patient.contactNumber.replace(/\s|-/g, ""));
  const isEmailValid = patient?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email);

  return (
    <Dialog open={!!patient} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] rounded-xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              {patient?.nextVisit ? "Edit Revisit Details" : "Assign Revisit Details"}
              {patient?.patientId && (
                <Badge className="ml-2 bg-white/20 text-white border-0 backdrop-blur-sm">
                  ID: {patient.patientId}
                </Badge>
              )}
            </DialogTitle>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <User2 className="h-5 w-5 text-indigo-700" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <User2 className="h-3.5 w-3.5 text-blue-500" /> Name
                  </h4>
                  <p className="text-gray-900 font-medium">{patient?.fullName || "N/A"}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <Circle className="h-3.5 w-3.5 text-blue-500" /> Gender
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {patient?.gender ? (
                      <Badge className={patient.gender === "Male" 
                        ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" 
                        : patient.gender === "Female" 
                        ? "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-100"
                        : "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"}>
                        {patient.gender}
                      </Badge>
                    ) : "N/A"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <IdCard className="h-3.5 w-3.5 text-blue-500" /> NIC
                  </h4>
                  <p className="text-gray-900 font-medium">{patient?.nic || "N/A"}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-blue-500" /> Contact
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">{patient?.contactNumber || "N/A"}</p>
                    {isContactValid && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => window.location.href = `tel:${patient.contactNumber.replace(/\s|-/g, "")}`}
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" /> Call
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-blue-500" /> Email
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium truncate max-w-[150px]">{patient?.email || "N/A"}</p>
                    {isEmailValid && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => window.location.href = `mailto:${patient.email}`}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" /> Email
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> Address
                  </h4>
                  <p className="text-gray-900 font-medium">{patient?.address || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-indigo-700" />
                {patient?.nextVisit ? "Edit Revisit Schedule" : "Schedule Revisit"}
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
                <Select value={selectedDoctorId} onValueChange={handleDoctorChange} disabled={loading}>
                  <SelectTrigger className="w-full bg-white border border-blue-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 h-12">
                    <SelectValue placeholder={patient?.doctorId ? "Select a new doctor" : "Select a doctor"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg border border-blue-100 max-h-60 overflow-y-auto">
                    {validDoctors.length > 0 ? (
                      validDoctors.map((doctor) => (
                        <SelectItem
                          key={doctor._id}
                          value={doctor._id}
                          className="py-3 hover:bg-blue-50 rounded-lg"
                        >
                          {getDoctorLabel(doctor)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled className="text-gray-500">
                        Loading doctors...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctorId && (
                <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100 mt-4">
                  <h3 className="text-md font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Clipboard className="h-4 w-4 text-indigo-700" /> Doctor Information
                  </h3>
                  {(() => {
                    const doctor = validDoctors.find((d) => d._id === selectedDoctorId);
                    return doctor ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-blue-50">
                          <p className="text-sm">
                            <span className="font-medium text-gray-500">Name:</span>{" "}
                            <span className="text-blue-900 font-medium">{doctor.name || "N/A"}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">Type:</span>{" "}
                              <span className="text-blue-900 font-medium">{doctor.type || "N/A"}</span>
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">Specialty:</span>{" "}
                              <span className="text-blue-900 font-medium">{doctor.specialty || "N/A"}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-blue-500" /> Working Days
                            </p>
                            <ul className="space-y-1">
                              {Object.entries(doctor.workingHours || {})
                                .filter(([, hours]) => hours)
                                .map(([day, { startTime, endTime }]) => (
                                  <li key={day} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full inline-block mr-1 mb-1">
                                    {day}: {startTime} - {endTime}
                                  </li>
                                ))}
                            </ul>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <CalendarCheck className="h-3.5 w-3.5 text-blue-500" /> Days Off
                            </p>
                            <ul className="space-y-1">
                              {doctor.daysOff?.length > 0 ? (
                                doctor.daysOff.map((dayOff, index) => (
                                  <li key={index} className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded-full inline-block mr-1 mb-1">
                                    {new Date(dayOff.startDate).toLocaleDateString()} - {new Date(dayOff.endDate).toLocaleDateString()}
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-gray-600">None</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No doctor details available.</p>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-indigo-600" /> 
                  {patient?.nextVisit ? "Edit Revisit Date" : "Schedule Revisit Date"}
                </label>
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                  <CustomDatePicker
                    selected={revisitDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    filterDate={(date) => !isDateDisabled(date)}
                    placeholderText={patient?.nextVisit ? "Select a new date" : "Select a date"}
                    renderDayContents={renderDayContents}
                    disabled={loading}
                    wrapperClassName="w-full"
                    className="w-full h-12 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4"
                  />
                </div>
                
                {revisitDate && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-indigo-600" />
                      Patient Count for {revisitDate.toLocaleDateString()}:{" "}
                      <span className="font-semibold text-indigo-800">
                        {patientCounts[new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())).toISOString().split("T")[0]] || 0}
                      </span>
                    </p>
                    {patientIncluded[new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())).toISOString().split("T")[0]] && (
                      <p className="text-sm text-green-700 flex items-center gap-2 mt-1">
                        <Check className="h-4 w-4 text-green-600" />
                        This patient is included in the count.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-gray-50 p-6 sticky bottom-0 z-10 border-t border-gray-100">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              className="h-11 px-5 rounded-full bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              className="h-11 px-5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleUpdateRevisit}
              disabled={loading || !selectedDoctorId || !revisitDate}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  {patient?.nextVisit ? "Update Revisit" : "Assign Revisit"}
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPatientDetailsDialog;