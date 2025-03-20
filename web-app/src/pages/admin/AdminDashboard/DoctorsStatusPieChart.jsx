
import React from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { PieChartComponent } from "@/components/shared/pieChart";
import { Stethoscope, Activity } from "lucide-react";
import { FaUserDoctor } from "react-icons/fa6";

const DoctorsStatusPieChart = ({ data, config, doctors }) => {
  // Calculate percentages for display
  const totalDoctors = data.reduce((sum, item) => sum + item.value, 0);
  const onlinePercentage = totalDoctors > 0 ? Math.round((data[0]?.value || 0) / totalDoctors * 100) : 0;
  const offlinePercentage = 100 - onlinePercentage;

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <FaUserDoctor className="h-5 w-5" /> Doctors Status
        </div>
        <CardDescription className="text-blue-100">Online vs Offline</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex flex-row items-center justify-between gap-4 h-full w-full">

          <div className="w-full h-full">
            <PieChartComponent
              data={data}
              config={config}
              title=""
              description=""
              showDatePicker={false}
              doctorsData={doctors}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorsStatusPieChart;