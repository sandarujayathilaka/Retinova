// import React from "react";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import CustomDatePicker from "../CommonFiles/CustomDatePicker"; // Adjust the import path
// import { Activity } from "lucide-react";

// const DoctorSchedule = ({ doctor, selectedDate, setSelectedDate, reviewPatientCounts, className }) => {
//   const isDateInRange = (date, startDate, endDate, repeatYearly) => {
//     const checkDate = date.getTime();
//     let start = new Date(startDate);
//     let end = new Date(endDate);
//     if (repeatYearly) {
//       start.setFullYear(date.getFullYear());
//       end.setFullYear(date.getFullYear());
//       if (end < start) end.setFullYear(date.getFullYear() + 1);
//     }
//     return checkDate >= start.getTime() && checkDate <= end.getTime();
//   };

//   const isWorkingDay = (date) => {
//     const dayName = date.toLocaleString("en-US", { weekday: "long" });
//     const daySchedule = doctor.workingHours?.[dayName];
//     const isEnabled = daySchedule?.enabled === true;
//     const isDayOff = doctor.daysOff?.some((dayOff) =>
//       isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
//     );
//     return isEnabled && !isDayOff;
//   };

//   const isDayOff = (date) =>
//     doctor.daysOff?.some((dayOff) =>
//       isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
//     );

//   const renderDayContents = (day, date) => {
//     const isWorking = isWorkingDay(date);
//     const isOff = isDayOff(date);
//     const dateKey = date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//     const reviewCount = reviewPatientCounts[dateKey] || 0;

//     return (
//       <div
//         className={`relative flex items-center justify-center w-full h-full
//           ${isWorking && !isOff ? "bg-green-100" : ""} 
//           ${isOff ? "bg-red-100" : ""}`}
//       >
//         <span>{day}</span>
//         <div className="absolute bottom-0 right-0 text-xs flex flex-col items-end">
//           {(isWorking || isOff) && (
//             <span>
//               {isWorking && !isOff && ""}
//               {isOff && ""}
//             </span>
//           )}
//           {reviewCount > 0 && (
//             <span className="text-teal-600 font-semibold">{reviewCount}</span>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Card className={`shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl ${className}`}>
//       <CardHeader className="bg-teal-500 text-white py-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <Activity className="h-5 w-5" /> My Schedule
//         </div>
//       </CardHeader>
//       <CardContent className="p-6 flex flex-col items-center justify-center h-full">
//         <div className="flex flex-col items-center justify-center w-full">
//           {/* Centered Calendar with Responsive Width */}
//           <div className="mb-4 w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px]">
//             <CustomDatePicker
//               selected={selectedDate}
//               onChange={(date) => setSelectedDate(date)}
//               renderDayContents={renderDayContents}
//               inline
//               className="w-full"
//             />
//           </div>

//           {/* Centered Legend and Details */}
//           <div className="flex flex-col items-center gap-2 text-sm">
//             <div className="flex flex-row items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-green-100 inline-block"></span>
//                 <span>Working Day</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-red-100 inline-block"></span>
//                 <span>Day Off</span>
//               </div>
//             </div>
//             <div className="text-center">
//               <h3 className="font-semibold text-teal-700">
//                 Details for {selectedDate.toLocaleDateString()}
//               </h3>
//               {isWorkingDay(selectedDate) ? (
//                 <p className="text-green-600">
//                   Working:{" "}
//                   {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.startTime} to{" "}
//                   {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.endTime}
//                 </p>
//               ) : isDayOff(selectedDate) ? (
//                 <p className="text-red-600">
//                   Day Off:{" "}
//                   {doctor.daysOff.find((d) =>
//                     isDateInRange(selectedDate, d.startDate, d.endDate, d.repeatYearly)
//                   )?.dayOffName || "Unnamed"}
//                 </p>
//               ) : (
//                 <p className="text-gray-600">No Schedule</p>
//               )}
//               {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })] > 0 && (
//                 <p className="text-teal-600">
//                   Review Patients: {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })]}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default DoctorSchedule;


// import React from "react";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import CustomDatePicker from "../CommonFiles/CustomDatePicker"; // Adjust the import path
// import { Activity ,Calendar,CalendarClockIcon} from "lucide-react";

// const DoctorSchedule = ({ doctor, selectedDate, setSelectedDate, reviewPatientCounts, className }) => {
//   const isDateInRange = (date, startDate, endDate, repeatYearly) => {
//     const checkDate = date.getTime();
//     let start = new Date(startDate);
//     let end = new Date(endDate);
//     if (repeatYearly) {
//       start.setFullYear(date.getFullYear());
//       end.setFullYear(date.getFullYear());
//       if (end < start) end.setFullYear(date.getFullYear() + 1);
//     }
//     return checkDate >= start.getTime() && checkDate <= end.getTime();
//   };

//   const isWorkingDay = (date) => {
//     const dayName = date.toLocaleString("en-US", { weekday: "long" });
//     const daySchedule = doctor.workingHours?.[dayName];
//     const isEnabled = daySchedule?.enabled === true;
//     // Return true if the day is enabled in workingHours, regardless of day off status
//     return isEnabled;
//   };

//   const isDayOff = (date) =>
//     doctor.daysOff?.some((dayOff) =>
//       isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
//     );

//   const isWorkingDayAndOff = (date) => {
//     // Check if the day is a working day and also a day off
//     return isWorkingDay(date) && isDayOff(date);
//   };

//   const renderDayContents = (day, date) => {
//     const isWorking = isWorkingDay(date);
//     const isWorkingAndOff = isWorkingDayAndOff(date);
//     const dateKey = date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//     const reviewCount = reviewPatientCounts[dateKey] || 0;

//     return (
//       <div
//         className={`relative flex items-center justify-center w-full h-full
//           ${isWorking ? "bg-green-100" : ""} 
//           ${isWorkingAndOff ? "bg-red-100" : ""}`}
//       >
//         <span>{day}</span>
//         <div className="absolute bottom-0 right-0 text-xs flex flex-col items-end">
//           {reviewCount > 0 && (
//             <span className="text-teal-600 font-semibold">{reviewCount}</span>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Card className={`shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl ${className}`}>
//       <CardHeader className="bg-teal-500 text-white py-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <CalendarClockIcon className="h-5 w-5" /> My Schedule
//         </div>
//       </CardHeader>
//       <CardContent className="p-6 flex flex-col items-center justify-center h-full">
//         <div className="flex flex-col items-center justify-center w-full h-full">
//           {/* Centered Calendar with Responsive Width */}
//           <div className="flex items-center justify-center mb-4 w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px]">
//             <CustomDatePicker
//               selected={selectedDate}
//               onChange={(date) => setSelectedDate(date)}
//               renderDayContents={renderDayContents}
//               inline
//               className="w-full"
//             />
//           </div>

//           {/* Centered Legend and Details */}
//           <div className="flex flex-col items-center gap-2 text-sm">
//             <div className="flex flex-row items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-green-100 inline-block"></span>
//                 <span>Working Day</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-red-100 inline-block"></span>
//                 <span>Working Day (Off)</span>
//               </div>
//             </div>
//             <div className="text-center">
//               <h3 className="font-semibold text-teal-700">
//                 Details for {selectedDate.toLocaleDateString()}
//               </h3>
//               {isWorkingDay(selectedDate) && !isDayOff(selectedDate) ? (
//                 <p className="text-green-600">
//                   Working:{" "}
//                   {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.startTime} to{" "}
//                   {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.endTime}
//                 </p>
//               ) : isWorkingDayAndOff(selectedDate) ? (
//                 <p className="text-red-600">
//                   Day Off:{" "}
//                   {doctor.daysOff.find((d) =>
//                     isDateInRange(selectedDate, d.startDate, d.endDate, d.repeatYearly)
//                   )?.dayOffName || "Unnamed"}
//                 </p>
//               ) : isDayOff(selectedDate) ? (
//                 <p className="text-gray-600">Non-Working Day Off</p>
//               ) : (
//                 <p className="text-gray-600">No Schedule</p>
//               )}
//               {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })] > 0 && (
//                 <p className="text-teal-600">
//                   Review Patients: {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })]}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default DoctorSchedule;

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomDatePicker from "../CommonFiles/CustomDatePicker";
import { CalendarClock, Users, Clock } from "lucide-react";

const DoctorSchedule = ({ doctor, selectedDate, setSelectedDate, reviewPatientCounts, className }) => {
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
    return isEnabled;
  };

  const isDayOff = (date) =>
    doctor.daysOff?.some((dayOff) =>
      isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
    );

  const isWorkingDayAndOff = (date) => {
    return isWorkingDay(date) && isDayOff(date);
  };

  const renderDayContents = (day, date) => {
    const isWorking = isWorkingDay(date);
    const isWorkingAndOff = isWorkingDayAndOff(date);
    const dateKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const reviewCount = reviewPatientCounts[dateKey] || 0;

    return (
      <div
        className={`relative flex items-center justify-center w-full h-full rounded p-1
          ${isWorking && !isWorkingAndOff ? "bg-indigo-50 text-indigo-900" : ""} 
          ${isWorkingAndOff ? "bg-gray-100 text-gray-500" : ""}`}
      >
        <span className="font-medium">{day}</span>
        {reviewCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {reviewCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`shadow-lg rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-xl border-none ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <CalendarClock className="h-5 w-5" /> My Schedule
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center h-full">
        <div className="flex flex-col items-center justify-center w-full h-full">
          {/* Calendar */}
          <div className="mb-4 w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[340px] flex justify-center">
            <CustomDatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              renderDayContents={renderDayContents}
              inline
              className="w-full"
            />
          </div>

          {/* Legend and Details */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
            <div className="grid grid-cols-2 gap-3 w-full text-sm">
              <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded">
                <span className="w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-sm"></span>
                <span className="text-indigo-900">Working Day</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm"></span>
                <span className="text-gray-600">Day Off</span>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-gray-50 rounded-lg shadow-sm w-full border border-gray-100">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {selectedDate.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              
              {isWorkingDay(selectedDate) && !isDayOff(selectedDate) ? (
                <p className="text-indigo-700 flex items-center gap-1 text-sm bg-indigo-50 p-2 rounded">
                  <Clock className="w-4 h-4" /> 
                  <span className="font-medium">Hours:</span> {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.startTime} - {" "}
                  {doctor.workingHours[selectedDate.toLocaleString("en-US", { weekday: "long" })]?.endTime}
                </p>
              ) : isWorkingDayAndOff(selectedDate) ? (
                <p className="text-gray-600 flex items-center gap-1 text-sm bg-gray-100 p-2 rounded">
                  <Clock className="w-4 h-4" /> 
                  <span className="font-medium">Off:</span> {" "}
                  {doctor.daysOff.find((d) =>
                    isDateInRange(selectedDate, d.startDate, d.endDate, d.repeatYearly)
                  )?.dayOffName || "Scheduled Day Off"}
                </p>
              ) : isDayOff(selectedDate) ? (
                <p className="text-gray-600 flex items-center gap-1 text-sm bg-gray-100 p-2 rounded">
                  <Clock className="w-4 h-4" /> Non-Working Day
                </p>
              ) : (
                <p className="text-gray-600 flex items-center gap-1 text-sm bg-gray-100 p-2 rounded">
                  <Clock className="w-4 h-4" /> No Schedule
                </p>
              )}
              
              {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })] > 0 && (
                <p className="text-blue-700 flex items-center gap-1 text-sm mt-2 bg-blue-50 p-2 rounded">
                  <Users className="w-4 h-4" /> 
                  <span className="font-medium">Review Patients:</span> {" "}
                  {reviewPatientCounts[selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })]}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorSchedule;