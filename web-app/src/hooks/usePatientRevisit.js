import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/api.service";
import { getErrorMessage } from "../pages/utils/errorMessages";
import { showSuccessToast, showErrorToast } from "../pages/utils/toastUtils";

const usePatientRevisit = ({
  patient = null, // Default to null for safety
  initialDoctorId = "",
  initialRevisitDate = null,
  doctors = [],
  fetchPatientCountForDate,
  onAssignRevisit,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || patient?.doctorId || "");
  const [revisitDate, setRevisitDate] = useState(
    initialRevisitDate || (patient?.nextVisit ? new Date(patient.nextVisit) : null)
  );
  const [patientCounts, setPatientCounts] = useState({});
  const [patientIncluded, setPatientIncluded] = useState({});
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const lastFetchedRef = useRef(null);

  const debouncedFetchPatientCount = useCallback(
    async (date, doctorId) => {
      if (!date || !doctorId) return;
      const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        .toISOString()
        .split("T")[0];
      if (lastFetchedRef.current === `${dateStr}-${doctorId}`) return;

      lastFetchedRef.current = `${dateStr}-${doctorId}`;
      try {
        const { totalCount, isPatientIncluded } = await fetchPatientCountForDate(date, doctorId);
        setPatientCounts((prev) => ({ ...prev, [dateStr]: totalCount }));
        setPatientIncluded((prev) => ({ ...prev, [dateStr]: isPatientIncluded }));
      } catch (error) {
        showErrorToast("Failed to fetch patient count.");
      }
    },
    [fetchPatientCountForDate]
  );

  useEffect(() => {
    if (selectedDoctorId && revisitDate && patient) {
      debouncedFetchPatientCount(revisitDate, selectedDoctorId);
    }
  }, [selectedDoctorId, revisitDate, patient, debouncedFetchPatientCount]);

  const handleUpdateRevisit = async () => {
    if (!patient || !selectedDoctorId || !revisitDate || isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    try {
      const normalizedRevisitDate = new Date(
        Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())
      );
      const response = await api.put(`/patients/${patient.patientId}/revisit`, {
        doctorId: selectedDoctorId,
        revisitDate: normalizedRevisitDate.toISOString(),
      });
      showSuccessToast("Revisit updated successfully");
      onAssignRevisit({ success: true, message: "Revisit updated successfully", data: response.data });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showErrorToast(errorMessage);
      onAssignRevisit({ error: errorMessage });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const isDateDisabled = (date) => {
    if (!selectedDoctorId) return false;
    const doctor = doctors.find((d) => d._id?.toString() === selectedDoctorId);
    if (!doctor) return false;

    const day = date.toLocaleString("en-US", { weekday: "long" });
    const isWorkingDay = !!doctor.workingHours?.[day];
    const isDayOff = doctor.daysOff?.some((dayOff) => {
      const start = new Date(dayOff.startDate);
      const end = new Date(dayOff.endDate);
      return date >= start && date <= end;
    }) || false;

    return !isWorkingDay || isDayOff;
  };

  return {
    selectedDoctorId,
    setSelectedDoctorId,
    revisitDate,
    setRevisitDate,
    patientCounts,
    patientIncluded,
    loading,
    handleUpdateRevisit,
    isDateDisabled,
    debouncedFetchPatientCount,
  };
};

export default usePatientRevisit;