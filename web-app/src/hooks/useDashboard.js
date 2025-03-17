// hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api.service';

/**
 * Custom hook for handling dashboard data and operations
 * @param {string} type - Dashboard type (doctor or admin)
 * @param {string} id - Entity ID if applicable
 * @returns {Object} Dashboard data and operations
 */
export function useDashboard(type = 'admin', id = null) {
  // Data states
  const [doctor, setDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // UI states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patientFilter, setPatientFilter] = useState('total');
  const [doctorFilter, setDoctorFilter] = useState('total');
  const [nurseFilter, setNurseFilter] = useState('total');
  const [doctorChartView, setDoctorChartView] = useState('specialties');
  const [nurseChartView, setNurseChartView] = useState('specialties');
  const [reviewPatientCounts, setReviewPatientCounts] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard data based on type
   * @param {boolean} showRefreshing - Whether to show refresh indicator
   */
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Different API calls based on dashboard type
      if (type === 'doctor' && id) {
        // Doctor dashboard
        const [doctorRes, patientsRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/doctors/${id}/patients?type=summary`),
        ]);

        setDoctor(doctorRes.data);
        const patientData = patientsRes.data.data?.patients || [];
        setPatients(patientData);

        // Calculate review patient counts
        const reviewCounts = patientData.reduce((acc, patient) => {
          if (patient.patientStatus?.toLowerCase() === "review" && patient.nextVisit) {
            const visitDate = new Date(patient.nextVisit).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            acc[visitDate] = (acc[visitDate] || 0) + 1;
          }
          return acc;
        }, {});
        setReviewPatientCounts(reviewCounts);

        if (patientData.length === 0) {
          toast("No patients found for this doctor.");
        }
      } else {
        // Admin dashboard
        const [doctorsRes, nursesRes, patientsRes] = await Promise.all([
          api.get("/dashboard/doctors?type=summary"),
          api.get("/dashboard/nurses?type=summary"), // This would be nurses endpoint in production
          api.get("/dashboard/patients?type=summary"),
        ]);
        
        setDoctors(doctorsRes.data.doctors);
        setNurses(nursesRes.data.nurses); // Using doctors data for nurses temporarily
        setPatients(patientsRes.data.patients);
      }
      
      if (showRefreshing) {
        toast.success("Dashboard data refreshed successfully");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [type, id]);

  /**
   * Handle API errors
   * @param {Error} error - The error object
   */
  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || error.response.data.error || "An error occurred";
      
      if (status === 404) {
        if (message === "Doctor not found") {
          setError("Doctor not found. Please check the doctor ID and try again.");
          toast.error("Doctor not found. Please check the doctor ID and try again.");
        } else {
          toast.error(message);
        }
      } else if (status === 400) {
        toast.error(message || "Invalid request. Please check the parameters and try again.");
      } else if (status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(message || "An error occurred while fetching data.");
      }
    } else if (error.request) {
      setError("No response from the server. Please check your network connection and try again.");
      toast.error("No response from the server. Please check your network connection and try again.");
    } else {
      setError("An error occurred while setting up the request. Please try again.");
      toast.error("An error occurred while setting up the request. Please try again.");
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate derived data
  const calculateDoctorStatusData = useCallback(() => {
    if (!doctors.length) return [];
    
    const onlineDoctors = doctors.filter((doc) => doc.status).length;
    const offlineDoctors = doctors.length - onlineDoctors;
    
    return [
      { name: "Online", value: onlineDoctors, fill: "#34D399" },
      { name: "Offline", value: offlineDoctors, fill: "#F87171" },
    ];
  }, [doctors]);

  const calculateNurseStatusData = useCallback(() => {
    if (!nurses.length) return [];
    
    const onlineNurses = nurses.filter((nurse) => nurse.status).length;
    const offlineNurses = nurses.length - onlineNurses;
    
    return [
      { name: "Online", value: onlineNurses, fill: "#34D399" },
      { name: "Offline", value: offlineNurses, fill: "#F87171" },
    ];
  }, [nurses]);

  const calculatePatientStatusData = useCallback(() => {
    if (!patients.length) return [];
    
    const patientsStatus = patients.reduce(
      (acc, p) => {
        let isNew = false;
        
        if (type === 'admin') {
          const diagnoseCount = p.diagnoseHistory ? p.diagnoseHistory.length : 0;
          const hasNextVisit = p.nextVisit && !isNaN(new Date(p.nextVisit).getTime());
          isNew = diagnoseCount <= 2 && !hasNextVisit;
        } else {
          // Doctor dashboard logic
          isNew = p.isNew;
        }
        
        const key = isNew ? "New Patients" : "Existing Patients";
        const latestDate = p.diagnoseHistory?.length
          ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
          : new Date(p.createdAt).getTime();
          
        acc[key].count += 1;
        acc[key].dates.push(latestDate);
        return acc;
      },
      {
        "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
        "Existing Patients": { count: 0, dates: [], fill: "#4338CA" },
      }
    );
    
    return Object.entries(patientsStatus).map(([name, { count, dates, fill }]) => ({
      name,
      value: count,
      dates,
      fill,
    }));
  }, [patients, type]);

  const calculateDiagnosesData = useCallback(() => {
    if (!patients.length) return [];
    
    const diagnosesByDate = patients.reduce((acc, p) => {
      p.diagnoseHistory?.forEach((diag) => {
        const date = new Date(diag.uploadedAt).toLocaleDateString();
        if (!acc[date]) acc[date] = {};
        acc[date][diag.diagnosis] = (acc[date][diag.diagnosis] || 0) + 1;
      });
      return acc;
    }, {});
    
    return Object.entries(diagnosesByDate).flatMap(([date, diagnoses], index) =>
      Object.entries(diagnoses).map(([diagnosis, value]) => ({
        date,
        disease: diagnosis,
        value,
        fill: ["#1E3A8A", "#312E81", "#4338CA", "#3730A3"][index % 4],
      }))
    );
  }, [patients]);

  const calculateConditionsData = useCallback(() => {
    if (!patients.length) return [];
    
    const conditionsByDate = patients.reduce((acc, p) => {
      p.diagnoseHistory?.forEach((record) => {
        const date = new Date(record.uploadedAt).toLocaleDateString();
        if (!acc[date]) acc[date] = {};
        acc[date][record.diagnosis] = (acc[date][record.diagnosis] || 0) + 1;
      });
      return acc;
    }, {});
    
    return Object.entries(conditionsByDate).flatMap(([date, diagnoses], index) =>
      Object.entries(diagnoses).map(([diagnose, value]) => ({
        date,
        stage: diagnose,
        value,
        fill: ["#1E40AF", "#4338CA", "#312E81", "#1E3A8A"][index % 4],
      }))
    );
  }, [patients]);

  return {
    // Data
    doctor,
    doctors,
    nurses,
    patients,
    
    // UI state
    selectedDate,
    setSelectedDate,
    patientFilter,
    setPatientFilter,
    doctorFilter,
    setDoctorFilter,
    nurseFilter,
    setNurseFilter,
    doctorChartView,
    setDoctorChartView,
    nurseChartView,
    setNurseChartView,
    reviewPatientCounts,
    
    // Loading state
    loading,
    isRefreshing,
    error,
    
    // Operations
    fetchData,
    
    // Derived data
    doctorsStatusData: calculateDoctorStatusData(),
    nursesStatusData: calculateNurseStatusData(),
    patientsStatusData: calculatePatientStatusData(),
    diagnosesBarData: calculateDiagnosesData(),
    conditionsBarData: calculateConditionsData(),
    
    // Constants
    doctorsStatusConfig: {
      Online: { label: "Online", color: "#34D399" },
      Offline: { label: "Offline", color: "#F87171" },
    },
    nursesStatusConfig: {
      Online: { label: "Online", color: "#34D399" },
      Offline: { label: "Offline", color: "#F87171" },
    }
  };
}