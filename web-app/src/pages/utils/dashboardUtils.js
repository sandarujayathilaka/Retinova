export const calculateStatusData = (staff = [], colors = { online: "#34D399", offline: "#F87171" }) => {
    if (!Array.isArray(staff) || staff.length === 0) {
      return [];
    }
    
    const onlineCount = staff.filter(member => member.status).length;
    const offlineCount = staff.length - onlineCount;
    
    return [
      { name: "Online", value: onlineCount, fill: colors.online },
      { name: "Offline", value: offlineCount, fill: colors.offline },
    ];
  };
  
  /**
   * Calculate patient type data (new vs existing)
   * 
   * @param {Array} patients - Array of patients
   * @param {boolean} isDoctor - Whether calculating for doctor dashboard
   * @returns {Array} Data formatted for pie chart
   */
  export const calculatePatientTypeData = (patients = [], isDoctor = false) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return [];
    }
    
    const patientsStatus = patients.reduce(
      (acc, p) => {
        let isNew = false;
        
        if (!isDoctor) {
          // Admin dashboard logic
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
  };
  
  /**
   * Calculate disease data for charts
   * 
   * @param {Array} patients - Array of patients
   * @returns {Array} Data formatted for bar charts
   */
  export const calculateDiseaseData = (patients = []) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return [];
    }
    
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
  };
  
  /**
   * Calculate condition data for charts
   * 
   * @param {Array} patients - Array of patients
   * @returns {Array} Data formatted for bar charts
   */
  export const calculateConditionData = (patients = []) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return [];
    }
    
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
  };
  
  /**
   * Calculate review patient counts by date
   * 
   * @param {Array} patients - Array of patients
   * @returns {Object} Counts indexed by date
   */
  export const calculateReviewCounts = (patients = []) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return {};
    }
    
    return patients.reduce((acc, patient) => {
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
  };
  
  /**
   * Group doctors/nurses by specialty for charts
   * 
   * @param {Array} staff - Array of staff members (doctors/nurses)
   * @returns {Object} Grouped data by specialty
   */
  export const groupBySpecialty = (staff = []) => {
    if (!Array.isArray(staff) || staff.length === 0) {
      return {};
    }
    
    return staff.reduce((acc, member) => {
      const specialty = member.specialty || "Unknown";
      if (!acc[specialty]) {
        acc[specialty] = [];
      }
      acc[specialty].push(member);
      return acc;
    }, {});
  };
  
  /**
   * Format date for consistent display
   * 
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  export const formatDate = (date) => {
    if (!date) return "";
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  /**
   * Convert local date to ISO string for API calls
   * 
   * @param {Date} date - Date object
   * @returns {string} ISO date string
   */
  export const toISODateString = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    
    // Create UTC date to ensure consistency
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
    
    return utcDate.toISOString().split('T')[0];
  };