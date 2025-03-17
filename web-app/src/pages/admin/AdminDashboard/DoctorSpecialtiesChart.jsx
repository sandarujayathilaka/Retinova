import React from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorTypeAndSpecialtyBarChart } from "@/components/shared/barChart";
import { BarChart3, PieChart } from "lucide-react";
import { FaUserDoctor } from "react-icons/fa6";

const DoctorSpecialtiesChart = ({ doctors, doctorChartView, setDoctorChartView }) => {
  const title = doctorChartView === "specialties" ? "Doctor Specialties" : "Doctor Types";
  const description = doctorChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";
console.log(doctors)
  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <FaUserDoctor className="h-5 w-5" /> {title}
        </div>
        <CardDescription className="text-blue-100">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            {doctorChartView === "specialties" ? 
              <BarChart3 className="h-4 w-4" /> : 
              <PieChart className="h-4 w-4" />} 
            View:
          </div>
          <Select value={doctorChartView} onValueChange={setDoctorChartView}>
            <SelectTrigger className="w-[180px] bg-white text-indigo-800 border-indigo-100">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specialties">Specialties</SelectItem>
              <SelectItem value="types">Types</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-full mt-2">
          {doctorChartView === "specialties" ? (
            <DoctorTypeAndSpecialtyBarChart data={doctors} view="specialties" />
          ) : (
            <DoctorTypeAndSpecialtyBarChart data={doctors} view="types" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorSpecialtiesChart;