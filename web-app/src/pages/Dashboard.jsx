import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.service";
import { toast } from "react-hot-toast";
// import "react-toastify/dist/ReactToastify.css";
import { PieChartComponent } from "@/components/ui/pieChart";
import { DiseaseStageChart, PatientCategoryChart, PatientsStatusBarChart, DoctorTypeAndSpecialtyBarChart, NurseTypeAndSpecialtyBarChart } from "@/components/ui/barChart";
import { User2, Stethoscope, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorChartView, setDoctorChartView] = useState("specialties");
  const [nurseChartView, setNurseChartView] = useState("specialties");
  const [doctorFilter, setDoctorFilter] = useState("total");
  const [nurseFilter, setNurseFilter] = useState("total");
  const [patientFilter, setPatientFilter] = useState("total");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, nursesRes, patientsRes] = await Promise.all([
          api.get("/dashboard/doctors?type=summary"),
          api.get("/dashboard/doctors?type=summary"), // Corrected to fetch nurses
          api.get("/dashboard/patients?type=summary"),
        ]);
        setDoctors(doctorsRes.data.doctors);
        setNurses(nursesRes.data.doctors);
        setPatients(patientsRes.data.patients);
        console.log("doc", doctorsRes.data.doctors);
        console.log("nurse", nursesRes.data.doctors);
        console.log("pat", patientsRes.data.patients);
      } catch (err) {
        toast.error("Error fetching data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchData();
  }, []);


  
  // Doctors Status Pie Chart
  const onlineDoctors = doctors.filter((doc) => doc.status).length;
  const offlineDoctors = doctors.length - onlineDoctors;
  const doctorsStatusData = [
    { name: "Online", value: onlineDoctors, fill: "#34D399" },
    { name: "Offline", value: offlineDoctors, fill: "#F87171" },
  ];
  const doctorsStatusConfig = {
    Online: { label: "Online", color: "#34D399" },
    Offline: { label: "Offline", color: "#F87171" },
  };

  // Doctor Specialties Pie Chart Data
  const doctorSpecialties = doctors.reduce((acc, doc) => {
    const specialty = doc.specialty.toLowerCase();
    acc[specialty] = (acc[specialty] || 0) + 1;
    return acc;
  }, {});
  const doctorSpecialtiesData = Object.keys(doctorSpecialties).map((specialty, index) => ({
    name: specialty,
    value: doctorSpecialties[specialty],
    fill: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8],
  }));
  const doctorSpecialtiesConfig = Object.keys(doctorSpecialties).reduce((acc, specialty, index) => {
    acc[specialty] = {
      label: specialty,
      color: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8],
    };
    return acc;
  }, {});

  // Nurses Status Pie Chart
  const onlineNurses = nurses.filter((nurse) => nurse.status).length;
  const offlineNurses = nurses.length - onlineNurses;
  const nursesStatusData = [
    { name: "Online", value: onlineNurses, fill: "#34D399" },
    { name: "Offline", value: offlineNurses, fill: "#F87171" },
  ];
  const nursesStatusConfig = {
    Online: { label: "Online", color: "#34D399" },
    Offline: { label: "Offline", color: "#F87171" },
  };

  // Nurse Specialties Pie Chart Data
  const nurseSpecialties = nurses.reduce((acc, nurse) => {
    const specialty = nurse.specialty.toLowerCase();
    acc[specialty] = (acc[specialty] || 0) + 1;
    return acc;
  }, {});
  const nurseSpecialtiesData = Object.keys(nurseSpecialties).map((specialty, index) => ({
    name: specialty,
    value: nurseSpecialties[specialty],
    fill: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8],
  }));
  const nurseSpecialtiesConfig = Object.keys(nurseSpecialties).reduce((acc, specialty, index) => {
    acc[specialty] = {
      label: specialty,
      color: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8],
    };
    return acc;
  }, {});

  // Nurse Types Pie Chart Data
  const nurseTypes = nurses.reduce((acc, nurse) => {
    const type = nurse.type.toLowerCase();
    acc[type] = acc[type] || { count: 0, dates: [] };
    acc[type].count += 1;
    acc[type].dates.push(nurse.createdAt);
    return acc;
  }, {});
  const nurseTypesData = Object.keys(nurseTypes).map((type, index) => ({
    name: type,
    value: nurseTypes[type].count,
    dates: nurseTypes[type].dates,
    fill: ["#3B82F6", "#FBBF24"][index % 2],
  }));
  const nurseTypesConfig = {
    "full time": { label: "full time", color: "#3B82F6" },
    "part time": { label: "part time", color: "#FBBF24" },
  };

  // Dynamic Pie Chart Data
  const doctorPieChartData = doctorChartView === "specialties" ? doctorSpecialtiesData : [];
  const doctorPieChartConfig = doctorChartView === "specialties" ? doctorSpecialtiesConfig : {};
  const doctorPieChartTitle = doctorChartView === "specialties" ? "Doctor Specialties" : "Doctor Types";
  const doctorPieChartDescription = doctorChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";

  const nursePieChartData = nurseChartView === "specialties" ? nurseSpecialtiesData : nurseTypesData;
  const nursePieChartConfig = nurseChartView === "specialties" ? nurseSpecialtiesConfig : nurseTypesConfig;
  const nursePieChartTitle = nurseChartView === "specialties" ? "Nurse Specialties" : "Nurse Types";
  const nursePieChartDescription = nurseChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";

  // Patients Data (unchanged)
  const patientsStatus = patients.reduce(
    (acc, p) => {
      const diagnoseCount = p.diagnoseHistoryLength;
      const isNew = diagnoseCount <= 1;
      const key = isNew ? "New Patients" : "Existing Patients";
      const latestDate = diagnoseCount
        ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
        : new Date(p.createdAt).getTime();
      acc[key].count += 1;
      acc[key].dates.push(latestDate);
      return acc;
    },
    {
      "New Patients": { count: 0, dates: [], fill: "#3B82F6" },
      "Existing Patients": { count: 0, dates: [], fill: "#FBBF24" },
    }
  );
  const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, dates, fill }]) => ({
    name,
    value: count,
    dates,
    fill,
  }));

  const diagnosesByDate = patients.reduce((acc, p) => {
    p.diagnoseHistory.forEach((diag) => {
      const date = new Date(diag.uploadedAt).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      acc[date][diag.diagnosis] = (acc[date][diag.diagnosis] || 0) + 1;
    });
    return acc;
  }, {});
  const diagnosesBarData = Object.entries(diagnosesByDate).flatMap(([date, diagnoses], index) =>
    Object.entries(diagnoses).map(([diagnosis, value]) => ({
      date,
      disease: diagnosis,
      value,
      fill: ["#6366F1", "#EC4899", "#14B8A6", "#F97316"][index % 4],
    }))
  );

  const conditionsByDate = patients.reduce((acc, p) => {
    p.diagnoseHistory.forEach((record) => {
      const date = new Date(record.uploadedAt).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      acc[date][record.diagnosis] = (acc[date][record.diagnosis] || 0) + 1;
    });
    return acc;
  }, {});
  const conditionsBarData = Object.entries(conditionsByDate).flatMap(([date, diagnoses], index) =>
    Object.entries(diagnoses).map(([diagnose, value]) => ({
      date,
      stage: diagnose,
      value,
      fill: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 4],
    }))
  );

  const latestDoctors = [...doctors].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const latestNurses = [...nurses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const latestPatients = [...patients].sort((a, b) => {
    const aLatest = a.diagnoseHistory.length
      ? new Date(Math.max(...a.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
      : new Date(a.createdAt);
    const bLatest = b.diagnoseHistory.length
      ? new Date(Math.max(...b.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
      : new Date(b.createdAt);
    return bLatest - aLatest;
  }).slice(0, 5);

  const totalDoctors = doctors.length;
  const doctorTypes = [...new Set(doctors.map(doc => doc.type.toLowerCase()))];
  const doctorSpecialtiess = [...new Set(doctors.map(doc => doc.specialty.toLowerCase()))];
  
  const getDoctorCount = () => {
    const filter = doctorFilter.toLowerCase(); // Convert to lowercase for consistency
  
    if (filter === "total") return totalDoctors;
    if (doctorTypes.includes(filter)) {
      const count = doctors.filter(doc => doc.type.toLowerCase() === filter).length;
      console.log(`Count for type '${filter}':`, count);
      return count;
    }
    if (doctorSpecialtiess.includes(filter)) {
      const count = doctors.filter(doc => doc.specialty.toLowerCase() === filter).length;
      console.log(`Count for specialty '${filter}':`, count);
      return count;
    }
  
    return totalDoctors;
  };
  

  
  // Nurses Calculations
  const totalNurses = nurses.length;
  const nurseTypess = [...new Set(nurses.map(nurse => nurse.type.toLowerCase()))];
  const nurseSpecialtiess = [...new Set(nurses.map(nurse => nurse.specialty.toLowerCase()))];
  
  const getNurseCount = () => {
    if (nurseFilter === "total") return totalNurses;
    if (nurseTypess.includes(nurseFilter)) 
      return nurses.filter(nurse => nurse.type.toLowerCase() === nurseFilter).length;
    if (nurseSpecialtiess.includes(nurseFilter)) 
      return nurses.filter(nurse => nurse.specialty.toLowerCase() === nurseFilter).length;
    return totalNurses;
  };

  // Patients Calculations
  const totalPatients = patients.length;
  const diseaseCategories = [...new Set(patients.flatMap(p => p.category))];
  const diseaseStages = [...new Set(patients.flatMap(p => p.diagnoseHistory.map(d => d.diagnosis)))];
  const patientStatus = [...new Set(
    patients.map(p => p.patientStatus ? p.patientStatus.toLowerCase() : "Unknown")
  )];
console.log("patientsStatusData",patientsStatusData)

  const getPatientCount = () => {
    if (patientFilter === "total") return totalPatients;
    if (diseaseCategories.includes(patientFilter))
      return patients.filter(p => p.diagnoseHistory.some(d => d.diagnosis === patientFilter)).length;
    if (diseaseStages.includes(patientFilter))
      return patients.filter(p => p.diagnoseHistory.some(d => d.stage === patientFilter)).length;
    return totalPatients;
  };


  const isDateInRange = (date, startDate, endDate, repeatYearly) => {
    const checkDate = date.getTime();
    let start = new Date(startDate);
    let end = new Date(endDate);

    if (repeatYearly) {
      // Adjust dates to current year
      start.setFullYear(date.getFullYear());
      end.setFullYear(date.getFullYear());
      
      // If end date is before start date after year adjustment, move end to next year
      if (end < start) {
        end.setFullYear(date.getFullYear() + 1);
      }
    }

    return checkDate >= start.getTime() && checkDate <= end.getTime();
  };

  // Check if date is a working day
  const isWorkingDay = (date) => {
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    const allStaff = [...doctors, ...nurses];

    return allStaff.some(staff => {
      // Check working hours
      const daySchedule = staff.workingHours?.[dayName];
      const isEnabled = daySchedule?.enabled === true;
      
      // Check if it's not a day off
      const isDayOff = staff.daysOff?.some(dayOff => 
        isDateInRange(
          date,
          dayOff.startDate,
          dayOff.endDate,
          dayOff.repeatYearly
        )
      );

      return isEnabled && !isDayOff;
    });
  };

  // Check if date is a day off
  const isDayOff = (date) => {
    const allStaff = [...doctors, ...nurses];
    
    return allStaff.some(staff => 
      staff.daysOff?.some(dayOff => 
        isDateInRange(
          date,
          dayOff.startDate,
          dayOff.endDate,
          dayOff.repeatYearly
        )
      )
    );
  };

  const renderDayContents = (day, date) => {
    const isWorking = isWorkingDay(date);
    const isOff = isDayOff(date);
    
    return (
      <div 
        className={`relative flex items-center justify-center w-full h-full
          ${isWorking && !isOff ? 'bg-green-100' : ''} 
          ${isOff ? 'bg-red-100' : ''}`}
      >
        <span>{day}</span>
        {(isWorking || isOff) && (
          <span className="absolute bottom-0 right-0 text-xs">
            {isWorking && !isOff && ''}
            {isOff && ''}
          </span>
        )}
      </div>
    );
  };

return (
  <div className="bg-gray-100">
    <div className="mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-teal-700 flex items-center gap-2">
          <Activity className="h-8 w-8" /> Hospital Dashboard
        </h1>
        <Button
          onClick={() => navigate("/dashboard")}
          className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md"
        >
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* Doctors Card */}
  <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl min-h-[300px]">
    <CardHeader className="bg-teal-500 text-white py-4">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <Stethoscope className="h-5 w-5" /> Doctors 
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center w-full h-full">
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-[220px] bg-white text-teal-700 mt-2">
            <SelectValue placeholder="Filter Doctors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Doctors</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
            <SelectItem value="specialty">By Specialty</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full text-teal-600 mt-4 flex flex-col justify-center items-center flex-grow">
          {doctorFilter === "total" && (
            <div className="flex justify-center items-center min-h-[100px]">
              <p className="text-2xl font-bold text-teal-600">Total Doctors: {totalDoctors}</p>
            </div>
          )}

          {doctorFilter === "type" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Doctor Types:</p>
              <ul className="list-disc pl-5">
                {doctorTypes.map((type) => {
                  const count = doctors.filter(doc => doc.type.toLowerCase() === type).length;
                  return <li key={type} className="text-lg">{type}: {count}</li>;
                })}
              </ul>
            </div>
          )}

          {doctorFilter === "specialty" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Doctor Specialties:</p>
              <ul className="list-disc pl-5">
                {doctorSpecialtiess.map((specialty) => {
                  const count = doctors.filter(doc => doc.specialty.toLowerCase() === specialty).length;
                  return <li key={specialty} className="text-lg">{specialty}: {count}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Nurses Card */}
  <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl min-h-[300px]">
    <CardHeader className="bg-teal-500 text-white py-4">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <Stethoscope className="h-5 w-5" /> Nurses 
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center w-full h-full">
        <Select value={nurseFilter} onValueChange={setNurseFilter}>
          <SelectTrigger className="w-[220px] bg-white text-teal-700 mt-2">
            <SelectValue placeholder="Filter Nurses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Nurses</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
            <SelectItem value="specialty">By Specialty</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full text-teal-600 mt-4 flex flex-col justify-center items-center flex-grow">
          {nurseFilter === "total" && (
            <div className="flex justify-center items-center min-h-[100px]">
              <p className="text-2xl font-bold text-teal-600">Total Nurses: {totalNurses}</p>
            </div>
          )}

          {nurseFilter === "type" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Nurse Types:</p>
              <ul className="list-disc pl-5">
                {nurseTypess.map((type) => {
                  const count = nurses.filter(nus => nus.type.toLowerCase() === type).length;
                  return <li key={type} className="text-lg">{type}: {count}</li>;
                })}
              </ul>
            </div>
          )}

          {nurseFilter === "specialty" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Nurse Specialties:</p>
              <ul className="list-disc pl-5">
                {nurseSpecialtiess.map((specialty) => {
                  const count = nurses.filter(nus => nus.specialty.toLowerCase() === specialty).length;
                  return <li key={specialty} className="text-lg">{specialty}: {count}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Patients Card */}
  <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl min-h-[300px]">
    <CardHeader className="bg-teal-500 text-white py-4">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <User2 className="h-5 w-5" /> Patients
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center w-full h-full">
        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-[220px] bg-white text-teal-700 mt-2">
            <SelectValue placeholder="Filter Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Patients</SelectItem>
            <SelectItem value="stage">By Stages</SelectItem>
            <SelectItem value="category">By Categories</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full text-teal-600 mt-4 flex flex-col justify-center items-center flex-grow">
          {patientFilter === "total" && (
            <div className="flex justify-center items-center min-h-[100px]">
              <p className="text-2xl font-bold text-teal-600">Total Patients: {totalPatients}</p>
            </div>
          )}

          {patientFilter === "stage" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Patient Stages:</p>
              <ul className="list-disc pl-5">
                {diseaseStages.map((stage) => {
                  const count = patients.filter(p => 
                    p.diagnoseHistory.some(d => d.diagnosis === stage)
                  ).length;
                  return <li key={stage} className="text-lg">{stage}: {count}</li>;
                })}
              </ul>
            </div>
          )}

          {patientFilter === "category" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Disease Categories:</p>
              <ul className="list-disc pl-5">
                {diseaseCategories.map((category) => {
                  const count = patients.filter(p => 
                    p.category.includes(category)
                  ).length;
                  return <li key={category} className="text-lg">{category}: {count}</li>;
                })}
              </ul>
            </div>
          )}

          {patientFilter === "status" && (
            <div className="text-left w-full">
              <p className="text-lg font-semibold mb-2">Patient Status:</p>
              <ul className="list-disc pl-5">
                {patientStatus.map((status) => {
                  if (!status) return null;
                  const count = patients.filter(p => p.patientStatus?.toLowerCase() === status).length;
                  return <li key={status} className="text-lg">{status}: {count}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Staff Schedule Card remains unchanged */}
  <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
    <CardHeader className="bg-teal-500 text-white py-4">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <Activity className="h-5 w-5" /> Staff Schedule
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        inline
        renderDayContents={renderDayContents}
        className="w-full"
        calendarClassName="custom-datepicker"
      />
      <div className="mt-2 text-sm flex flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-100 inline-block"></span>
          <span>Working Day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-100 inline-block"></span>
          <span>Day Off</span>
        </div>
      </div>

      <div className="mt-2 text-sm">
        <h3 className="font-semibold text-teal-700">Staff Details for {selectedDate.toLocaleDateString()}</h3>
        <div className="mt-2 max-h-20 overflow-y-auto overflow-x-auto space-y-2 custom-scrollbar">
          {[...doctors, ...nurses]
            .filter(staff => {
              const dayName = selectedDate.toLocaleString('en-US', { weekday: 'long' });
              const daySchedule = staff.workingHours?.[dayName];
              const isEnabled = daySchedule?.enabled === true;
              const isDayOff = staff.daysOff?.some(dayOff =>
                isDateInRange(
                  selectedDate,
                  dayOff.startDate,
                  dayOff.endDate,
                  dayOff.repeatYearly
                )
              );
              return isEnabled && !isDayOff;
            })
            .map(staff => (
              <div key={staff.id} className="flex items-center gap-2 min-w-max">
                <span className="text-green-600">✓</span>
                <span className="truncate">
                  {staff.name} ({doctors.includes(staff) ? 'Doctor' : 'Nurse'}) - Working: {staff.workingHours[selectedDate.toLocaleString('en-US', { weekday: 'long' })]?.startTime} to {staff.workingHours[selectedDate.toLocaleString('en-US', { weekday: 'long' })]?.endTime}
                </span>
              </div>
            ))}

          {(() => {
            const allStaff = [...doctors, ...nurses];
            const staffOnLeave = allStaff.filter(staff =>
              staff.daysOff?.some(dayOff =>
                isDateInRange(
                  selectedDate,
                  dayOff.startDate,
                  dayOff.endDate,
                  dayOff.repeatYearly
                )
              )
            );
            if (staffOnLeave.length === allStaff.length && staffOnLeave.length > 0) {
              return (
                <div className="flex items-center gap-2 min-w-max">
                  <span className="text-red-600">✗</span>
                  <span className="truncate">
                    Hospital Holiday - All staff on leave
                  </span>
                </div>
              );
            }

            return staffOnLeave.map(staff => {
              const dayOffInfo = staff.daysOff.find(dayOff =>
                isDateInRange(
                  selectedDate,
                  dayOff.startDate,
                  dayOff.endDate,
                  dayOff.repeatYearly
                )
              );
              return (
                <div key={staff.id} className="flex items-center gap-2 min-w-max">
                  <span className="text-red-600">✗</span>
                  <span className="truncate">
                    {staff.name} ({doctors.includes(staff) ? 'Doctor' : 'Nurse'}) - 
                    Day Off {dayOffInfo?.dayOffName ? `(${dayOffInfo.dayOffName})` : ''}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </CardContent>
  </Card>
</div>


        {/* second Row: Status Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Doctors Status
              </CardTitle>
              <CardDescription className="text-teal-100">Online vs Offline</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PieChartComponent
                data={doctorsStatusData}
                config={doctorsStatusConfig}
                title=""
                description=""
                showDatePicker={false}
                doctorsData={doctors}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Nurses Status
              </CardTitle>
              <CardDescription className="text-teal-100">Online vs Offline</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PieChartComponent
                data={nursesStatusData}
                config={nursesStatusConfig}
                title=""
                description=""
                showDatePicker={false}
                nursesData={nurses}
              />
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Specialties Pie Chart and Doctor Type/Specialty Bar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" /> {doctorPieChartTitle}
                </CardTitle>
                <CardDescription className="text-teal-100">{doctorPieChartDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Select value={doctorChartView} onValueChange={setDoctorChartView}>
                <SelectTrigger className="w-[180px] bg-white text-teal-700 mb-2">
                  <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specialties">Specialties</SelectItem>
                  <SelectItem value="types">Types</SelectItem>
                </SelectContent>
              </Select>
              {doctorChartView === "specialties" ? (
  <DoctorTypeAndSpecialtyBarChart data={doctors} view="specialties" />
) : (
  <DoctorTypeAndSpecialtyBarChart data={doctors} view="types" />
)}

            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" /> {nursePieChartTitle}
                </CardTitle>
                <CardDescription className="text-teal-100">{nursePieChartDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Select value={nurseChartView} onValueChange={setNurseChartView}>
                <SelectTrigger className="w-[180px] bg-white text-teal-700 mb-2">
                  <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specialties">Specialties</SelectItem>
                  <SelectItem value="types">Types</SelectItem>
                </SelectContent>
              </Select>
              {nurseChartView === "specialties" ? (
  <NurseTypeAndSpecialtyBarChart data={nurses} view="specialties" />
) : (
  <NurseTypeAndSpecialtyBarChart data={nurses} view="types" />
)}

            </CardContent>
          </Card>
          {/* <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" /> {nursePieChartTitle}
                </CardTitle>
                <CardDescription className="text-teal-100">{nursePieChartDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Select value={nurseChartView} onValueChange={setNurseChartView}>
                <SelectTrigger className="w-[180px] bg-white text-teal-700">
                  <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specialties">Specialties</SelectItem>
                  <SelectItem value="types">Types</SelectItem>
                </SelectContent>
              </Select>
              <PieChartComponent
                data={nursePieChartData}
                config={nursePieChartConfig}
                title=""
                description=""
              />
            </CardContent>
          </Card> */}
        </div>

        {/* Third Row: Patients Status and Medical Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Patients Type
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Visit</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PatientsStatusBarChart data={patientsStatusData} />
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Disease Categories
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Category</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PatientCategoryChart data={conditionsBarData} />
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row: Diagnoses by Date */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Disease Stages
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Stage</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DiseaseStageChart data={diagnosesBarData} />
            </CardContent>
          </Card>
        </div>

        {/* Fifth Row: Latest Doctors, Nurses, and Patients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Latest Doctors
              </CardTitle>
              <Button
                onClick={() => navigate("/doctors")}
                className="bg-white text-teal-500 hover:bg-teal-100 rounded-full px-4 py-1 text-sm shadow-md"
              >
                See All
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestDoctors.map((doctor, index) => (
                    <TableRow key={index}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty.toLowerCase()}</TableCell>
                      <TableCell>{doctor.type.toLowerCase()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User2 className="h-5 w-5" /> Latest Nurses
              </CardTitle>
              <Button
                onClick={() => navigate("/nurses")}
                className="bg-white text-teal-500 hover:bg-teal-100 rounded-full px-4 py-1 text-sm shadow-md"
              >
                See All
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestNurses.map((nurse, index) => (
                    <TableRow key={index}>
                      <TableCell>{nurse.name}</TableCell>
                      <TableCell>{nurse.specialty.toLowerCase()}</TableCell>
                      <TableCell>{nurse.type.toLowerCase()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User2 className="h-5 w-5" /> Latest Patients
              </CardTitle>
              <Button
                onClick={() => navigate("/patients")}
                className="bg-white text-teal-500 hover:bg-teal-100 rounded-full px-4 py-1 text-sm shadow-md"
              >
                See All
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Latest Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestPatients.map((patient, index) => {
                    const latestDiagnosis = patient.diagnoseHistory.length
                      ? patient.diagnoseHistory.reduce((latest, current) =>
                          new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest
                        )
                      : { diagnosis: "None", status: "N/A" };
                    return (
                      <TableRow key={index}>
                        <TableCell>{patient.fullName}</TableCell>
                        <TableCell>{latestDiagnosis.diagnosis}</TableCell>
                        <TableCell>{latestDiagnosis.status}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <style>{`
      
        .custom-datepicker {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: #ffffff;
          font-family: inherit;
        }
        .react-datepicker__header {
          background: linear-gradient(to right, #14b8a6, #06b6d4, #3b82f6);
          border-bottom: none;
          padding: 0.5rem;
          color: #ffffff;
          font-weight: 600;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: #ffffff;
        }
        .react-datepicker__day {
          color: #374151;
          position: relative;
        }
        .react-datepicker__day:hover {
          background-color: #ccfbf1;
          color: #0f766e;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #14b8a6;
          color: #ffffff;
          border-radius: 9999px;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #ffffff;
        }
        .react-datepicker__triangle {
          border-bottom-color: #14b8a6;
        }
          .custom-scrollbar {
  /* Ensure the container allows for custom scrollbar styling */
           position: relative;
          overflow: auto;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px; /* Width of the vertical scrollbar */
  height: 8px; /* Height of the horizontal scrollbar (if needed) */
  background: transparent; /* Background behind the scrollbar */
}

/* Track (the area behind the scrollbar thumb) */
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; /* Light gray background */
  border-radius: 4px;
  margin-right: 4px; /* Adds space between the scrollbar and the right edge */
  margin-bottom: 4px; /* Adds space between the scrollbar and the bottom edge */
}

/* Thumb (the draggable part of the scrollbar) */
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888; /* Gray thumb */
  border-radius: 4px;
}

/* Thumb on hover */
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555; /* Darker gray on hover */
}

/* Add padding to the container to push content away from the scrollbar */
.custom-scrollbar {
  padding-right: 12px; /* Increases space on the right side */
  padding-bottom: 12px; /* Increases space on the bottom side */
}
      `}</style>
    </div>
  );
};

export default Dashboard;