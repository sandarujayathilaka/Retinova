// import React from "react";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { User2 } from "lucide-react";

// const PatientSummary = ({ patients, patientFilter, setPatientFilter, className }) => {
//   const totalPatients = patients.length;
//   const diseaseCategories = [...new Set(patients.flatMap((p) => p.category))];
//   const diseaseStages = [...new Set(patients.flatMap((p) => p.diagnoseHistory.map((d) => d.diagnosis)))];
//   const patientStatus = [
//     ...new Set(patients.map((p) => (p.patientStatus ? p.patientStatus.toLowerCase() : "Unknown"))),
//   ];

//   return (
//     <Card className={`shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl ${className}`}>
//       <CardHeader className="bg-teal-500 text-white py-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <User2 className="h-5 w-5" /> Patients
//         </div>
//       </CardHeader>
//       <CardContent className="p-6 flex flex-col flex-grow">
//         {totalPatients === 0 ? (
//           <div className="flex justify-center items-center h-full">
//             <p className="text-2xl font-bold text-teal-600">Total Patients: 0</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center w-full flex-grow">
//             <Select value={patientFilter} onValueChange={setPatientFilter}>
//               <SelectTrigger className="w-[220px] bg-white text-teal-700 mt-2">
//                 <SelectValue placeholder="Filter Patients" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="total">Total Patients</SelectItem>
//                 <SelectItem value="stage">By Stages</SelectItem>
//                 <SelectItem value="category">By Categories</SelectItem>
//                 <SelectItem value="status">By Status</SelectItem>
//               </SelectContent>
//             </Select>

//             <div className="w-full text-teal-600 mt-4 flex flex-col justify-center items-center flex-grow">
//               {patientFilter === "total" && (
//                 <div className="flex justify-center items-center h-full">
//                   <p className="text-2xl font-bold text-teal-600">Total Patients: {totalPatients}</p>
//                 </div>
//               )}

//               {patientFilter === "stage" && (
//                 <div className="text-left w-full mb-4">
//                   <p className="text-lg font-semibold mb-2">Patient Stages:</p>
//                   <ul className="list-disc pl-5">
//                     {diseaseStages.length === 0 ? (
//                       <li className="text-lg text-gray-500">No stages available</li>
//                     ) : (
//                       diseaseStages.map((stage) => {
//                         const count = patients.filter((p) =>
//                           p.diagnoseHistory.some((d) => d.diagnosis === stage)
//                         ).length;
//                         return (
//                           <li key={stage} className="text-lg">
//                             {stage.charAt(0).toUpperCase() + stage.slice(1)}: {count}
//                           </li>
//                         );
//                       })
//                     )}
//                   </ul>
//                 </div>
//               )}

//               {patientFilter === "category" && (
//                 <div className="text-left w-full mb-4">
//                   <p className="text-lg font-semibold mb-2">Disease Categories:</p>
//                   <ul className="list-disc pl-5">
//                     {diseaseCategories.length === 0 ? (
//                       <li className="text-lg text-gray-500">No categories available</li>
//                     ) : (
//                       diseaseCategories.map((category) => {
//                         const count = patients.filter((p) => p.category.includes(category)).length;
//                         return (
//                           <li key={category} className="text-lg">
//                             {category.charAt(0).toUpperCase() + category.slice(1)}: {count}
//                           </li>
//                         );
//                       })
//                     )}
//                   </ul>
//                 </div>
//               )}

//               {patientFilter === "status" && (
//                 <div className="text-left w-full mb-4">
//                   <p className="text-lg font-semibold mb-2">Patient Status:</p>
//                   <ul className="list-disc pl-5">
//                     {patientStatus.length === 0 || (patientStatus.length === 1 && patientStatus[0] === "Unknown") ? (
//                       <li className="text-lg text-gray-500">No status available</li>
//                     ) : (
//                       patientStatus.map((status) => {
//                         if (!status || status === "Unknown") return null;
//                         const count = patients.filter(
//                           (p) => p.patientStatus?.toLowerCase() === status
//                         ).length;
//                         return (
//                           <li key={status} className="text-lg">
//                             {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
//                           </li>
//                         );
//                       })
//                     )}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default PatientSummary;

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  ClipboardCheck, 
  ClipboardList, 
  Clock, 
  Filter, 
  Activity,
  LoaderCircleIcon,
  // MessageSquareAlert,
  ChevronRight
} from "lucide-react";

const PatientSummary = ({ patients, patientFilter, setPatientFilter, className,doctorId }) => {
  const totalPatients = patients.length;
  const diseaseCategories = [...new Set(patients.flatMap((p) => p.category))];
  const diseaseStages = [...new Set(patients.flatMap((p) => p.diagnoseHistory.map((d) => d.diagnosis)))];
  const patientStatus = [
    ...new Set(patients.map((p) => (p.patientStatus ? p.patientStatus : "Unknown"))),
  ].filter(Boolean);

  // Calculate counts for each status
  // const statusCounts = {
  //   "Pre-Monitoring": patients.filter(p => p.patientStatus === "Pre-Monitoring").length,
  //   "Published": patients.filter(p => p.patientStatus === "Published").length,
  //   "Review": patients.filter(p => p.patientStatus === "Review").length,
  //   "Completed": patients.filter(p => p.patientStatus === "Completed").length,
  //   "Monitoring": patients.filter(p => p.patientStatus === "Monitoring").length
  // };
  const statusCounts = {
    "Pre-Monitoring": patients.filter(p => 
      p.patientStatus === "Pre-Monitoring" && (!doctorId || p.doctorId === doctorId)
    ).length,
    "Published": patients.filter(p => 
      p.patientStatus === "Published" && (!doctorId || p.doctorId === doctorId)
    ).length,
    "Review": patients.filter(p => 
      p.patientStatus === "Review" && (!doctorId || p.doctorId === doctorId)
    ).length,
    "Completed": patients.filter(p => 
      p.patientStatus === "Completed" && (!doctorId || p.doctorId === doctorId)
    ).length,
    "Monitoring": patients.filter(p => 
      p.patientStatus === "Monitoring" && (!doctorId || p.doctorId === doctorId)
    ).length
  };
  // Calculate new patients in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatientsCount = patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  // Calculate patients with upcoming appointments
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  // const upcomingAppointments = patients.filter(p => 
  //   p.nextVisit && new Date(p.nextVisit) >= today && new Date(p.nextVisit) <= nextWeek
  // ).length;


// Calculate upcoming appointments with doctorId and patientStatus conditions
const upcomingAppointments = patients.filter(p => {
  const hasNextVisit = p.nextVisit && 
    new Date(p.nextVisit) >= today && 
    new Date(p.nextVisit) <= nextWeek;
  
  const isReviewStatus = p.patientStatus === "Review";
  
  const doctorIdCondition = !doctorId || p.doctorId === doctorId;
  

  return hasNextVisit && isReviewStatus && doctorIdCondition;
}).length;


  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pre-Monitoring':
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'Published':
        return <LoaderCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Review':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Completed':
        return <ClipboardCheck className="h-4 w-4 text-indigo-500" />;
      case 'Monitoring':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pre-Monitoring': return 'bg-blue-50 text-blue-800';
      case 'Published': return 'bg-green-50 text-green-800';
      case 'Review': return 'bg-amber-50 text-amber-800';
      case 'Completed': return 'bg-indigo-50 text-indigo-800';
      case 'Monitoring': return 'bg-purple-50 text-purple-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

console.log(statusCounts["Review"])
  return (
    <Card className={`rounded-xl overflow-hidden bg-white transition-all duration-300 border-none ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Patient Summary
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        {totalPatients === 0 ? (
          <div className="flex justify-center items-center h-full py-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xl font-medium text-gray-500">No patients found</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full flex-grow">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-blue-800">{totalPatients}</div>
                <div className="text-sm text-blue-600 font-medium">Total Patients</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-indigo-800">{newPatientsCount}</div>
                <div className="text-sm text-indigo-600 font-medium">New (30d)</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-amber-700">{statusCounts["Review"]}</div>
                <div className="text-sm text-amber-600 font-medium">For Review</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-purple-700">{upcomingAppointments}</div>
                <div className="text-sm text-purple-600 font-medium">Upcoming (7d)</div>
              </div>
            </div>
            
            {/* Filter Section */}
            <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Filter className="h-4 w-4" /> Filter By:
              </div>
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger className="w-[180px] bg-white text-indigo-800 border-indigo-100">
                  <SelectValue placeholder="Filter Patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Patients</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                  <SelectItem value="category">By Categories</SelectItem>
                  <SelectItem value="stage">By Stages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtered Content */}
            <div className="w-full text-indigo-900 flex flex-col flex-grow bg-indigo-50 rounded-lg p-4">
              {patientFilter === "total" && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-indigo-800 mb-2">{totalPatients}</p>
                    <p className="text-indigo-600">Total Patients</p>

                    <div className="flex justify-center gap-2 flex-wrap mt-6">
                      {patientStatus.map(status => (
                        <div key={status} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span>{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {patientFilter === "status" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Patient Status
                  </p>
                  {patientStatus.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No status information available</div>
                  ) : (
                    <div className="space-y-3">
                      {["Review", "Monitoring", "Pre-Monitoring", "Published", "Completed"].map((status) => {
                        if (!patientStatus.includes(status)) return null;
                        
                        const count = statusCounts[status];
                        const percentage = Math.round((count / totalPatients) * 100);
                        return (
                          <div key={status} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                <span className="font-medium">{status}</span>
                              </div>
                              <div className="font-bold text-indigo-800">{count}</div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${status === 'Review' ? 'bg-amber-500' : 
                                           status === 'Monitoring' ? 'bg-purple-500' : 
                                           status === 'Pre-Monitoring' ? 'bg-blue-500' : 
                                           status === 'Published' ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-1">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {patientFilter === "category" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Disease Categories
                  </p>
                  {diseaseCategories.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No categories available</div>
                  ) : (
                    <div className="space-y-3">
                      {diseaseCategories.map((category) => {
                        const count = patients.filter((p) => p.category.includes(category)).length;
                        const percentage = Math.round((count / totalPatients) * 100);
                        
                        // Determine color based on category
                        let categoryColor;
                        switch(category) {
                          case 'DR': categoryColor = 'bg-blue-500'; break;
                          case 'AMD': categoryColor = 'bg-indigo-500'; break;
                          case 'Glaucoma': categoryColor = 'bg-purple-500'; break;
                          case 'RVO': categoryColor = 'bg-amber-500'; break;
                          default: categoryColor = 'bg-gray-500';
                        }
                        
                        return (
                          <div key={category} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{category}</span>
                              <span className="font-bold text-indigo-800">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${categoryColor}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-1">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {patientFilter === "stage" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Disease Stages
                  </p>
                  {diseaseStages.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No stages available</div>
                  ) : (
                    <div className="space-y-3">
                      {diseaseStages.map((stage) => {
                        const count = patients.filter((p) =>
                          p.diagnoseHistory.some((d) => d.diagnosis === stage)
                        ).length;
                        const percentage = Math.round((count / totalPatients) * 100);
                        return (
                          <div key={stage} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{stage}</span>
                              <span className="font-bold text-indigo-800">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-indigo-500 rounded-full h-2"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-1">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSummary;