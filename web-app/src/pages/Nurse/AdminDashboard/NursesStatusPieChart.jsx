// import React from "react";
// import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// import { PieChartComponent } from "@/components/ui/pieChart";
// import { Stethoscope } from "lucide-react";
// import { LiaUserNurseSolid } from "react-icons/lia";
// const NursesStatusPieChart = ({ data, config, nurses }) => {
//   return (
//     <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
//       <CardHeader className="bg-teal-500 text-white py-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <LiaUserNurseSolid className="h-5 w-5" /> Nurses Status
//         </div>
//         <CardDescription className="text-teal-100">Online vs Offline</CardDescription>
//       </CardHeader>
//       <CardContent className="p-6">
//         <PieChartComponent
//           data={data}
//           config={config}
//           title=""
//           description=""
//           showDatePicker={false}
//           nursesData={nurses}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default NursesStatusPieChart;

import React from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { PieChartComponent } from "@/components/shared/pieChart";
import { Activity } from "lucide-react";
import { LiaUserNurseSolid } from "react-icons/lia";

const NursesStatusPieChart = ({ data, config, nurses }) => {
  // Calculate percentages for display
  const totalNurses = data.reduce((sum, item) => sum + item.value, 0);
  const onlinePercentage = totalNurses > 0 ? Math.round((data[0]?.value || 0) / totalNurses * 100) : 0;
  const offlinePercentage = 100 - onlinePercentage;

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LiaUserNurseSolid className="h-5 w-5" /> Nurses Status
        </div>
        <CardDescription className="text-blue-100">Online vs Offline</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex flex-row items-center justify-between gap-4 h-full w-full">
          {/* Ensure full width for the pie chart container */}
          <div className="w-full h-full">
            <PieChartComponent
              data={data}
              config={config}
              title=""
              description=""
              showDatePicker={false}
              nursesData={nurses}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NursesStatusPieChart;