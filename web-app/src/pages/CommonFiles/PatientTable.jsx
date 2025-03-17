
// import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Loader2, Eye, AlertCircle } from "lucide-react";

// const PatientTable = ({ patients, loading, error, onViewPatient }) => {
//   return (
//     <div className="rounded-xl overflow-hidden">
//       {loading ? (
//         <div className="flex justify-center items-center h-64 bg-white">
//           <div className="flex flex-col items-center">
//             <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
//             <p className="mt-4 text-blue-900 font-medium">Loading patient data...</p>
//           </div>
//         </div>
//       ) : error ? (
//         <div className="p-8 bg-red-50 rounded-xl border border-red-200 text-center">
//           <div className="flex flex-col items-center">
//             <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
//             <p className="text-red-600 font-medium">{error}</p>
//           </div>
//         </div>
//       ) : (
//         <>
//           <Table className="w-full">
//             <TableHeader className="bg-blue-50 sticky top-0 z-10">
//               <TableRow>
//                 <TableHead className="py-4 font-bold text-blue-900">Patient ID</TableHead>
//                 <TableHead className="py-4 font-bold text-blue-900">Name</TableHead>
//                 <TableHead className="py-4 font-bold text-blue-900">NIC</TableHead>
//                 <TableHead className="py-4 font-bold text-blue-900">Age</TableHead>
//                 <TableHead className="py-4 font-bold text-blue-900">Gender</TableHead>
//                 <TableHead className="py-4 font-bold text-blue-900 text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {patients.map((patient) => (
//                 <TableRow
//                   key={patient.patientId}
//                   className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 animate-fadeIn"
//                 >
//                   <TableCell className="py-4 font-medium text-indigo-700">{patient.patientId}</TableCell>
//                   <TableCell className="py-4 font-medium text-gray-800">{patient.fullName || "N/A"}</TableCell>
//                   <TableCell className="py-4 text-gray-600">{patient.nic || "N/A"}</TableCell>
//                   <TableCell className="py-4">
//                     <Badge
//                       variant="outline"
//                       className={`${
//                         patient.age >= 50 
//                           ? "bg-amber-100 text-amber-700 border-amber-300" 
//                           : "bg-green-100 text-green-700 border-green-300"
//                       } rounded-full px-3 py-1 font-medium`}
//                     >
//                       {patient.age || "0"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="py-4">
//                     <Badge
//                       variant="outline"
//                       className={`rounded-full px-3 py-1 font-medium ${
//                         patient.gender === "Male" 
//                           ? "bg-blue-100 text-blue-700 border-blue-300" 
//                           : patient.gender === "Female" 
//                           ? "bg-pink-100 text-pink-700 border-pink-300" 
//                           : "bg-purple-100 text-purple-700 border-purple-300"
//                       }`}
//                     >
//                       {patient.gender || "N/A"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="py-4 text-right">
//                     <Button
//                       variant="default"
//                       className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 border-none"
//                       onClick={() => onViewPatient(patient)}
//                     >
//                       <Eye className="h-4 w-4 mr-2" /> View
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           {!patients.length && (
//             <div className="p-12 text-center bg-blue-50 rounded-b-xl">
//               <div className="flex flex-col items-center">
//                 <AlertCircle className="h-8 w-8 text-blue-400 mb-2" />
//                 <p className="text-lg font-medium text-blue-900">No patients found matching your criteria.</p>
//                 <p className="text-sm mt-2 text-blue-600">Try adjusting your search or filters.</p>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PatientTable;

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const PatientTable = ({ 
  patients, 
  loading, 
  error, 
  onViewPatient, 
  showStatus = false, // Controls Diagnosis Date, Time Frame, and extra columns
  showStatusColumn = false, // Controls Status column only
  tableType = "all" 
}) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
  };


  return (
    <div className="rounded-xl overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="mt-4 text-blue-900 font-medium">Loading patient data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-xl border border-red-200 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <Table className="w-full">
            <TableHeader className="bg-blue-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="py-4 font-bold text-blue-900">Patient ID</TableHead>
                <TableHead className="py-4 font-bold text-blue-900">Name</TableHead>
                <TableHead className="py-4 font-bold text-blue-900">NIC</TableHead>
                <TableHead className="py-4 font-bold text-blue-900">Age</TableHead>
                <TableHead className="py-4 font-bold text-blue-900">Gender</TableHead>
                {showStatusColumn && (
                  <TableHead className="py-4 font-bold text-blue-900">Status</TableHead>
                )}
                {showStatus && (
                  <>
                    <TableHead className="py-4 font-bold text-blue-900">Diagnosis Date</TableHead>
                    <TableHead className="py-4 font-bold text-blue-900">Time Frame</TableHead>
                    {tableType === "review" && (
                      <TableHead className="py-4 font-bold text-blue-900">Next Visit</TableHead>
                    )}
                  </>
                )}
                <TableHead className="py-4 font-bold text-blue-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
           
                return (
                  <TableRow
                    key={patient.patientId}
                    className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 animate-fadeIn"
                  >
                    <TableCell className="py-4 font-medium text-indigo-700">{patient.patientId}</TableCell>
                    <TableCell className="py-4 font-medium text-gray-800">{patient.fullName || "N/A"}</TableCell>
                    <TableCell className="py-4 text-gray-600">{patient.nic || "N/A"}</TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          patient.age >= 50
                            ? "bg-amber-100 text-amber-700 border-amber-300"
                            : "bg-green-100 text-green-700 border-green-300"
                        } rounded-full px-3 py-1 font-medium`}
                      >
                        {patient.age || "0"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 font-medium ${
                          patient.gender === "Male"
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : patient.gender === "Female"
                            ? "bg-pink-100 text-pink-700 border-pink-300"
                            : "bg-purple-100 text-purple-700 border-purple-300"
                        }`}
                      >
                        {patient.gender || "N/A"}
                      </Badge>
                    </TableCell>
                    {showStatusColumn && (
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 py-1 font-medium ${
                            patient.patientStatus === "Monitoring"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : patient.patientStatus === "Published"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : patient.patientStatus === "Review"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : patient.patientStatus === "Completed"
                              ? "bg-gray-100 text-gray-700 border-gray-300"
                              : patient.patientStatus === "Pre-Monitoring"
                              ? "bg-purple-100 text-purple-700 border-purple-300"
                              : "bg-indigo-100 text-indigo-700 border-indigo-300"
                          }`}
                        >
                          {patient.patientStatus || "N/A"}
                        </Badge>
                      </TableCell>
                    )}
                    {showStatus && (
                      <>
                        <TableCell className="py-4 text-gray-600">{patient.diagnosisDate}</TableCell>
                        <TableCell className="py-4 text-gray-600">{patient.revisitTimeFrame}</TableCell>
                        {tableType === "review" && (
                          <TableCell className="py-4 text-gray-600">{patient.nextVisit}</TableCell>
                        )}
                      </>
                    )}
                    <TableCell className="py-4 text-right">
                      <Button
                        variant="default"
                        className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 border-none"
                        onClick={() => onViewPatient(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!patients.length && (
            <div className="p-12 text-center bg-blue-50 rounded-b-xl">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-blue-400 mb-2" />
                <p className="text-lg font-medium text-blue-900">No patients found matching your criteria.</p>
                <p className="text-sm mt-2 text-blue-600">Try adjusting your search or filters.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientTable;