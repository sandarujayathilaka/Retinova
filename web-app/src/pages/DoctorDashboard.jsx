import React, { useEffect, useState, Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PatientsStatusBarChart, DiseaseStageChart, PatientCategoryChart } from "@/components/ui/barChart";
import { Stethoscope, User2, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4">
          <p>Something went wrong: {this.state.error?.message || "Unknown error"}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patientFilter, setPatientFilter] = useState("total");
  const id = "67cc3fd45e6d4c9cd4a602d5";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, patientsRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/doctors/${id}/patients?type=summary`),
        ]);
        setDoctor(doctorRes.data);
        setPatients(patientsRes.data.data.patients || []);
        console.log("Doctor Data:", doctorRes.data);
        console.log("Patients Data:", patientsRes.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchData();
  }, [id]);

  if (!doctor || !patients) {
    return <div>Loading...</div>;
  }

  // Patient Calculations
  const totalPatients = patients.length;
  const diseaseCategories = [...new Set(patients.flatMap((p) => p.category))];
  const diseaseStages = [...new Set(patients.flatMap((p) => p.diagnoseHistory.map((d) => d.diagnosis)))];
  const patientStatus = [
    ...new Set(patients.map((p) => (p.patientStatus ? p.patientStatus.toLowerCase() : "Unknown"))),
  ];

  const getPatientCount = () => {
    if (patientFilter === "total") return totalPatients;
    if (diseaseCategories.includes(patientFilter))
      return patients.filter((p) => p.category.includes(patientFilter)).length;
    if (diseaseStages.includes(patientFilter))
      return patients.filter((p) => p.diagnoseHistory.some((d) => d.diagnosis === patientFilter)).length;
    if (patientStatus.includes(patientFilter))
      return patients.filter((p) => p.patientStatus?.toLowerCase() === patientFilter).length;
    return totalPatients;
  };

  // Patient Type Bar Chart Data (New vs Existing) with Dates
  const patientsStatus = patients.reduce(
    (acc, p) => {
      const diagnoseCount = p.diagnoseHistory.length;
      const isNew = diagnoseCount <= 1;
      const key = isNew ? "New Patients" : "Existing Patients";
      acc[key].count += 1;
      const latestDate = diagnoseCount
        ? Math.max(...p.diagnoseHistory.map((d) => new Date(d.uploadedAt).getTime()))
        : new Date(p.createdAt).getTime();
      acc[key].dates.push(latestDate);
      return acc;
    },
    {
      "New Patients": { count: 0, fill: "#3B82F6", dates: [] },
      "Existing Patients": { count: 0, fill: "#FBBF24", dates: [] },
    }
  );
  const patientsStatusData = Object.entries(patientsStatus).map(([name, { count, fill, dates }]) => ({
    name,
    value: count,
    fill,
    dates,
  }));

  // Disease Categories Bar Chart Data
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

  // Disease Stages Bar Chart Data
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

  // Latest Patients
  const latestPatients = [...patients]
    .sort((a, b) => {
      const aLatest = a.diagnoseHistory.length
        ? new Date(Math.max(...a.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
        : new Date(a.createdAt);
      const bLatest = b.diagnoseHistory.length
        ? new Date(Math.max(...b.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
        : new Date(b.createdAt);
      return bLatest - aLatest;
    })
    .slice(0, 5);

  // Schedule Functions
  const isDateInRange = (date, startDate, endDate, repeatYearly) => {
    const checkDate = date.getTime();
    let start = new Date(startDate);
    let end = new Date(endDate);
    if (repeatYearly) {
      start.setFullYear(date.getFullYear());
      end.setFullYear(date.getFullYear());
      if (end < start) end.setFullYear(date.getFullYear() + 1);
    }
    return checkDate >= start.getTime() && checkDate <= end.getTime();
  };

  const isWorkingDay = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    const daySchedule = doctor.workingHours?.[dayName];
    const isEnabled = daySchedule?.enabled === true;
    const isDayOff = doctor.daysOff?.some((dayOff) =>
      isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
    );
    return isEnabled && !isDayOff;
  };

  const isDayOff = (date) =>
    doctor.daysOff?.some((dayOff) =>
      isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
    );

  const renderDayContents = (day, date) => {
    const isWorking = isWorkingDay(date);
    const isOff = isDayOff(date);
    return (
      <div
        className={`relative flex items-center justify-center w-full h-full
          ${isWorking && !isOff ? "bg-green-100" : ""} 
          ${isOff ? "bg-red-100" : ""}`}
      >
        <span>{day}</span>
        {(isWorking || isOff) && (
          <span className="absolute bottom-0 right-0 text-xs">
            {isWorking && !isOff && "✓"}
            {isOff && "✗"}
          </span>
        )}
      </div>
    );
  };

  console.log("patientsStatusData:", patientsStatusData);

  return (
    <div className="bg-gray-100">
      <div className="mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-teal-700 flex items-center gap-2">
            <Activity className="h-8 w-8" /> Doctor Dashboard
          </h1>
          <Button
            onClick={() => navigate(`/doctors/${id}`)}
            className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md"
          >
            Refresh Data
          </Button>
        </div>

        {/* First Row: Patient Count and Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl min-h-[300px]">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Patients
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
                          const count = patients.filter((p) =>
                            p.diagnoseHistory.some((d) => d.diagnosis === stage)
                          ).length;
                          return (
                            <li key={stage} className="text-lg">
                              {stage}: {count}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {patientFilter === "category" && (
                    <div className="text-left w-full">
                      <p className="text-lg font-semibold mb-2">Disease Categories:</p>
                      <ul className="list-disc pl-5">
                        {diseaseCategories.map((category) => {
                          const count = patients.filter((p) => p.category.includes(category)).length;
                          return (
                            <li key={category} className="text-lg">
                              {category}: {count}
                            </li>
                          );
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
                          const count = patients.filter(
                            (p) => p.patientStatus?.toLowerCase() === status
                          ).length;
                          return (
                            <li key={status} className="text-lg">
                              {status}: {count}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" /> My Schedule
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
                <h3 className="font-semibold text-teal-700">
                  Details for {selectedDate.toLocaleDateString()}
                </h3>
                {isWorkingDay(selectedDate) ? (
                  <p className="text-green-600">
                    Working:{" "}
                    {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.startTime} to{" "}
                    {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.endTime}
                  </p>
                ) : isDayOff(selectedDate) ? (
                  <p className="text-red-600">
                    Day Off:{" "}
                    {doctor.daysOff.find((d) =>
                      isDateInRange(selectedDate, d.startDate, d.endDate, d.repeatYearly)
                    )?.dayOffName || "Unnamed"}
                  </p>
                ) : (
                  <p className="text-gray-600">No Schedule</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Patient Type and Disease Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User2 className="h-5 w-5" /> Patient Type
              </CardTitle>
              <CardDescription className="text-teal-100">New vs Existing Patients</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ErrorBoundary>
                <PatientsStatusBarChart data={patientsStatusData} />
              </ErrorBoundary>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" /> Disease Categories
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Category</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ErrorBoundary>
                <PatientCategoryChart data={conditionsBarData} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Disease Stages */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" /> Disease Stages
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Stage</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ErrorBoundary>
                <DiseaseStageChart data={diagnosesBarData} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row: Latest Patients */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User2 className="h-5 w-5" /> Latest Patients
              </CardTitle>
              <Button
                onClick={() => navigate(`/doctors/${id}/patients`)}
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
        `}</style>
      </div>
    </div>
  );
};

export default DoctorDashboard;