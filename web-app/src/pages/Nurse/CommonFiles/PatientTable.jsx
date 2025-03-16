// import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// const PatientTable = ({ patients, loading, error, onViewPatient }) => {
//   return (
//     <div className="p-6 bg-white">
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-6 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
//       ) : (
//         <>
//           <Table className="w-full">
//             <TableHeader className="bg-gray-50 sticky top-0 z-10">
//               <TableRow>
//                 <TableHead className="py-4 font-semibold text-gray-700">Patient ID</TableHead>
//                 <TableHead className="py-4 font-semibold text-gray-700">Name</TableHead>
//                 <TableHead className="py-4 font-semibold text-gray-700">NIC</TableHead>
//                 <TableHead className="py-4 font-semibold text-gray-700">Age</TableHead>
//                 <TableHead className="py-4 font-semibold text-gray-700">Gender</TableHead>
//                 <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {patients.map((patient) => (
//                 <TableRow
//                   key={patient.patientId}
//                   className="hover:bg-teal-50 transition-all duration-200 border-b border-gray-200 animate-fadeIn"
//                 >
//                   <TableCell className="py-4 font-medium text-teal-700">{patient.patientId}</TableCell>
//                   <TableCell className="py-4 font-medium text-gray-800">{patient.fullName || "N/A"}</TableCell>
//                   <TableCell className="py-4 text-gray-600">{patient.nic || "N/A"}</TableCell>
//                   <TableCell className="py-4">
//                     <Badge
//                       variant="outline"
//                       className={`${patient.age >= 50 ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100 text-green-700 border-green-300"} rounded-full px-2`}
//                     >
//                       {patient.age || "0"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="py-4">
//                     <Badge
//                       variant="outline"
//                       className={`rounded-full px-2 ${patient.gender === "Male" ? "bg-blue-100 text-blue-700 border-blue-300" : patient.gender === "Female" ? "bg-pink-100 text-pink-700 border-pink-300" : "bg-purple-100 text-purple-700 border-purple-300"}`}
//                     >
//                       {patient.gender || "N/A"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="py-4 text-right">
//                     <Button
//                       variant="outline"
//                       className="rounded-full bg-teal-500 text-white hover:bg-teal-600 border-none shadow-md"
//                       onClick={() => onViewPatient(patient)}
//                     >
//                       View
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           {!patients.length && (
//             <div className="p-10 text-center text-gray-600 bg-gray-50 rounded-lg">
//               <p className="text-lg">No published patients found matching your criteria.</p>
//               <p className="text-sm mt-2">Try adjusting your search or filters.</p>
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

const PatientTable = ({ patients, loading, error, onViewPatient }) => {
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
                <TableHead className="py-4 font-bold text-blue-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
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
              ))}
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