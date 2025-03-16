// import React from "react";
// import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { NurseTypeAndSpecialtyBarChart } from "@/components/ui/barChart";
// import { Stethoscope } from "lucide-react";

// const NurseSpecialtiesChart = ({ nurses, nurseChartView, setNurseChartView }) => {
//   const title = nurseChartView === "specialties" ? "Nurse Specialties" : "Nurse Types";
//   const description = nurseChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";

//   return (
//     <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
//       <CardHeader className="bg-teal-500 text-white py-4 flex justify-between items-center">
//         <div>
//           <div className="text-lg font-semibold flex items-center gap-2">
//             <Stethoscope className="h-5 w-5" /> {title}
//           </div>
//           <CardDescription className="text-teal-100">{description}</CardDescription>
//         </div>
//       </CardHeader>
//       <CardContent className="p-6">
//         <Select value={nurseChartView} onValueChange={setNurseChartView}>
//           <SelectTrigger className="w-[180px] bg-white text-teal-700 mb-2">
//             <SelectValue placeholder="Select View" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="specialties">Specialties</SelectItem>
//             <SelectItem value="types">Types</SelectItem>
//           </SelectContent>
//         </Select>
//         {nurseChartView === "specialties" ? (
//           <NurseTypeAndSpecialtyBarChart data={nurses} view="specialties" />
//         ) : (
//           <NurseTypeAndSpecialtyBarChart data={nurses} view="types" />
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default NurseSpecialtiesChart;

// import React from "react";
// import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { NurseTypeAndSpecialtyBarChart } from "@/components/ui/barChart";
// import { NurseTypeAndSpecialtyLineChart } from "@/components/ui/lineChart"; // Corrected import
// import { Stethoscope } from "lucide-react";
// import { LiaUserNurseSolid } from "react-icons/lia";

// const NurseSpecialtiesChart = ({ nurses, nurseChartView, setNurseChartView }) => {
//   const title = nurseChartView === "specialties" ? "Nurse Specialties" : "Nurse Types";
//   const description = nurseChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";

//   return (
//     <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
//       <CardHeader className="bg-teal-500 text-white py-4 flex justify-between ">
//         <div>
//           <div className="text-lg font-semibold flex items-center gap-2">
//             <LiaUserNurseSolid className="h-5 w-5" /> {title}
//           </div>
//           <CardDescription className="text-teal-100">{description}</CardDescription>
//         </div>
//       </CardHeader>
//       <CardContent className="p-6">
//         <Select value={nurseChartView} onValueChange={setNurseChartView}>
//           <SelectTrigger className="w-[180px] bg-white text-teal-700 mb-2">
//             <SelectValue placeholder="Select View" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="specialties">Specialties</SelectItem>
//             <SelectItem value="types">Types</SelectItem>
//           </SelectContent>
//         </Select>
//         {nurseChartView === "specialties" ? (
//           <NurseTypeAndSpecialtyBarChart data={nurses} view="specialties" />
//         ) : (
//           <NurseTypeAndSpecialtyBarChart data={nurses} view="types" />
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default NurseSpecialtiesChart;

import React from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NurseTypeAndSpecialtyBarChart } from "@/components/shared/barChart";
import { BarChart3, PieChart } from "lucide-react";
import { LiaUserNurseSolid } from "react-icons/lia";

const NurseSpecialtiesChart = ({ nurses, nurseChartView, setNurseChartView }) => {
  const title = nurseChartView === "specialties" ? "Nurse Specialties" : "Nurse Types";
  const description = nurseChartView === "specialties" ? "Distribution of Expertise" : "Full-time vs Part-time";

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LiaUserNurseSolid className="h-5 w-5" /> {title}
        </div>
        <CardDescription className="text-blue-100">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            {nurseChartView === "specialties" ? 
              <BarChart3 className="h-4 w-4" /> : 
              <PieChart className="h-4 w-4" />} 
            View:
          </div>
          <Select value={nurseChartView} onValueChange={setNurseChartView}>
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
          {nurseChartView === "specialties" ? (
            <NurseTypeAndSpecialtyBarChart data={nurses} view="specialties" />
          ) : (
            <NurseTypeAndSpecialtyBarChart data={nurses} view="types" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NurseSpecialtiesChart;