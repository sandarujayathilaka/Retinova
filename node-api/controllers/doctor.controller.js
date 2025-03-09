const Doctor = require("../models/doctor.model");
const mongoose = require("mongoose");

const getDoctorsByIds = async (req, res) => {
    try {
      const { doctorIds } = req.body;
      console.log("called with doctorIds:", doctorIds);
  
      // Validate and convert doctorIds to ObjectIDs
      if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
        return res.status(400).json({ error: "doctorIds must be a non-empty array" });
      }
  
      const objectIds = doctorIds.map((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid ObjectID: ${id}`);
        }
        return new mongoose.Types.ObjectId(id);
      });
  
      const doctors = await Doctor.find({ _id: { $in: objectIds } })
        .lean()
        .select("name type specialty workingHours daysOff"); // Adjusted field name to match schema
  
      // Transform the response data
      const transformedDoctors = doctors.map((doctor) => {
        // Filter workingHours: only include enabled days with startTime and endTime
        const filteredWorkingHours = {};
        for (const day in doctor.workingHours) {
          if (doctor.workingHours[day].enabled) {
            filteredWorkingHours[day] = {
              startTime: doctor.workingHours[day].startTime,
              endTime: doctor.workingHours[day].endTime,
            };
          }
        }
  
        // Filter daysOff: only include startDate and endDate
        const filteredDaysOff = doctor.daysOff.map((dayOff) => ({
          startDate: dayOff.startDate,
          endDate: dayOff.endDate,
        }));
  
        return {
          _id: doctor._id,
          name: doctor.name,
          type: doctor.type,
          specialty: doctor.specialty, // Note: schema uses "specialty", not "speciality"
          workingHours: filteredWorkingHours,
          daysOff: filteredDaysOff,
        };
      });
  
      res.status(200).json({ doctors: transformedDoctors });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: error.message });
    }
  };


module.exports = { getDoctorsByIds };