// import React from "react";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { UsersIcon } from "lucide-react";

// const LatestPatientsTable = ({ patients, onSeeAll, className }) => {
//   const latestPatients = [...patients]
//     .sort((a, b) => {
//       const aLatest = a.diagnoseHistory.length
//         ? new Date(Math.max(...a.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
//         : new Date(a.createdAt);
//       const bLatest = b.diagnoseHistory.length
//         ? new Date(Math.max(...b.diagnoseHistory.map((d) => new Date(d.uploadedAt))))
//         : new Date(b.createdAt);
//       return bLatest - aLatest;
//     })
//     .slice(0, 5);

//   return (
//     <Card className={`shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl ${className}`}>
//       <CardHeader className="bg-teal-500 text-white py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <UsersIcon className="h-5 w-5" /> Latest Patients
//         </div>
//         <Button
//           onClick={onSeeAll}
//           className="bg-white text-teal-500 hover:bg-teal-100 rounded-full px-4 py-1 text-sm shadow-md"
//         >
//           See All
//         </Button>
//       </CardHeader>
//       <CardContent className="p-6 flex flex-col flex-grow">
//         <div className="flex-grow">
//           <Table className="w-full">
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[20%]">name</TableHead>
//                 <TableHead className="w-[15%]">eye</TableHead>
//                 <TableHead className="w-[20%]">patient status</TableHead>
//                 <TableHead className="w-[25%]">latest diagnosis</TableHead>
//                 <TableHead className="w-[20%]">status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {latestPatients.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-4 text-gray-500">
//                     <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
//                       no records to show.
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 latestPatients.map((patient, index) => {
//                   const latestDiagnosis = patient.diagnoseHistory.length
//                     ? patient.diagnoseHistory.reduce((latest, current) =>
//                         new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest
//                       )
//                     : { diagnosis: "None", status: "N/A" };
//                   return (
//                     <TableRow key={index} className="sm:table-row">
//                       <TableCell className="p-2 break-words">
//                         {patient.fullName?.toLowerCase() || ""}
//                       </TableCell>
//                       <TableCell className="p-2 break-words">
//                         {latestDiagnosis.eye?.toLowerCase() || "n/a"}
//                       </TableCell>
//                       <TableCell className="p-2 break-words">
//                         {patient.patientStatus?.toLowerCase() || "n/a"}
//                       </TableCell>
//                       <TableCell className="p-2 break-words">
//                         {latestDiagnosis.diagnosis?.toLowerCase() || "none"}
//                       </TableCell>
//                       <TableCell className="p-2 break-words">
//                         {latestDiagnosis.status?.toLowerCase() || "n/a"}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default LatestPatientsTable;

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight, Clock } from "lucide-react";

const getStatusBadge = (status) => {
  const statusMap = {
    unchecked: "bg-gray-100 text-gray-800",
    "test completed": "bg-blue-100 text-blue-800",
    checked: "bg-green-100 text-green-800",
  };

  return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

const LatestPatientsTable = ({ patients, onSeeAll, className }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <Card className={`rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full flex flex-col ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Latest Patients
        </div>
        <Button
          onClick={onSeeAll}
          className="bg-white hover:bg-gray-100 text-indigo-800 hover:text-indigo-900 rounded-lg px-4 py-1 text-sm flex items-center gap-1 transition-colors"
        >
          See All <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-hidden flex flex-col">
        <div className="overflow-auto flex-grow">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="py-3 text-indigo-900 font-semibold">Name</TableHead>
                <TableHead className="py-3 text-indigo-900 font-semibold">Eye</TableHead>
                <TableHead className="py-3 text-indigo-900 font-semibold">Patient Status</TableHead>
                <TableHead className="py-3 text-indigo-900 font-semibold">Latest Diagnosis</TableHead>
                <TableHead className="py-3 text-indigo-900 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500 text-lg">No patients to display</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                latestPatients.map((patient, index) => {
                  const latestDiagnosis = patient.diagnoseHistory.length
                    ? patient.diagnoseHistory.reduce((latest, current) =>
                        new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest
                      )
                    : { diagnosis: "None", status: "N/A" };
                  
                  const status = latestDiagnosis.status?.toLowerCase() || "n/a";
                  const statusClass = getStatusBadge(status);
                  
                  return (
                    <TableRow 
                      key={index} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="py-3 font-medium text-indigo-900 capitalize">
                        {patient.fullName?.toLowerCase() || ""}
                      </TableCell>
                      <TableCell className="py-3 capitalize">
                        {latestDiagnosis.eye?.toLowerCase() || "n/a"}
                      </TableCell>
                      <TableCell className="py-3 capitalize">
                        {patient.patientStatus?.toLowerCase() || "n/a"}
                      </TableCell>
                      <TableCell className="py-3 capitalize">
                        {latestDiagnosis.diagnosis?.toLowerCase() || "none"}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass} capitalize`}>
                          {status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {latestPatients.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> 
              <span>Last checked: {formatDate(latestPatients[0]?.createdAt)}</span>
            </div>
            <div>{latestPatients.length} of {patients.length} patients</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestPatientsTable;