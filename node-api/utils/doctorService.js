const Doctor = require('../models/doctor.model');

// Helper function to transform doctor data
const transformDoctorData = (doctor) => {
  const filteredWorkingHours = {};
  for (const day in doctor.workingHours) {
    if (doctor.workingHours[day].enabled) {
      filteredWorkingHours[day] = {
        startTime: doctor.workingHours[day].startTime,
        endTime: doctor.workingHours[day].endTime,
      };
    }
  }
  
  const filteredDaysOff = doctor.daysOff.map((dayOff) => ({
    startDate: dayOff.startDate,
    endDate: dayOff.endDate,
  }));
  
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    type: doctor.type,
    specialty: doctor.specialty,
    workingHours: filteredWorkingHours,
    daysOff: filteredDaysOff,
  };
};

// Shared doctor fetching logic
const fetchDoctors = async (query = {}) => {
  const doctors = await Doctor.find(query)
    .lean()
    .select("name type specialty workingHours daysOff");
    
  return doctors.map(transformDoctorData);
};

module.exports = {
  transformDoctorData,
  fetchDoctors
};