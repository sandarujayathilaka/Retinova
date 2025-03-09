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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PieChartComponent } from "@/components/ui/pieChart";
import { DiseaseStageChart, PatientCategoryChart,PatientsStatusBarChart} from "@/components/ui/barChart";
import { User2, Stethoscope, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
// import { DatePickerWithRange } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          api.get("/dashboard/doctors?type=summary"),
          api.get("/dashboard/patients?type=summary"),
        ]);
        setDoctors(doctorsRes.data.doctors);
        setPatients(patientsRes.data.patients);
        console.log("doc",doctorsRes.data.doctors)
        console.log("pat",patientsRes.data.patients)
      } catch (err) {
        toast.error("Error fetching data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchData();
  }, []);

  // Doctors Status Pie Chart (No Date Picker, with Table)
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

  // New vs Existing Patients Bar Chart (Aggregated with Date Picker)
  const patientsStatus = patients.reduce(
    (acc, p) => {
      const diagnoseCount = p.diagnoseHistoryLength;
      const isNew = diagnoseCount <= 1; // New if 0 or 1 diagnoseHistory object
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

  // Doctor Types Pie Chart (With Date Picker)
  const doctorTypes = doctors.reduce((acc, doc) => {
    acc[doc.type] = acc[doc.type] || { count: 0, dates: [] };
    acc[doc.type].count += 1;
    acc[doc.type].dates.push(doc.createdAt);
    return acc;
  }, {});
  const doctorTypesData = Object.keys(doctorTypes).map((type, index) => ({
    name: type,
    value: doctorTypes[type].count,
    dates: doctorTypes[type].dates,
    fill: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 4],
  }));
  const doctorTypesConfig = Object.keys(doctorTypes).reduce((acc, type, index) => {
    acc[type] = { label: type, color: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 4] };
    return acc;
  }, {});

  // Diagnoses by Date Bar Chart (Using diagnoseHistory.uploadedAt)
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

  // Medical Conditions by Date Bar Chart (Using medicalHistory.date)
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

  // Latest Doctors and Patients
  const latestDoctors = [...doctors]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
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

  console.log("Doctors Status Data:", doctorsStatusData);
  console.log("Patients Status Data:", patientsStatusData);
  console.log("Doctor Types Data:", doctorTypesData);
  console.log("Diagnoses Bar Data:", diagnosesBarData);
  console.log("Conditions Bar Data:", conditionsBarData);

  return (
    <div className=" bg-gray-100 ">
      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* First Row: Pie Charts */}
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
                <Stethoscope className="h-5 w-5" /> Doctor Types
              </CardTitle>
              <CardDescription className="text-teal-100">Specializations</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PieChartComponent
                data={doctorTypesData}
                config={doctorTypesConfig}
                title=""
                description=""
                showDatePicker={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Patients Status and Medical Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Visit by Date
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by visit</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
            <PatientsStatusBarChart data={patientsStatusData} />
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Medical Conditions by Date
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Condition</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PatientCategoryChart data={conditionsBarData} />
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Diagnoses by Date */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
            <CardHeader className="bg-teal-500 text-white py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Diagnoses by Date
              </CardTitle>
              <CardDescription className="text-teal-100">Patients Count by Diagnosis</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DiseaseStageChart data={diagnosesBarData} />
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row: Latest Doctors and Patients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <TableCell>{doctor.specialty}</TableCell>
              <TableCell>{doctor.type}</TableCell>
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
    </div>
  );
};

export default Dashboard;