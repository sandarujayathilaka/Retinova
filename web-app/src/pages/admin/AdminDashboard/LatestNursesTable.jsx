import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { LiaUserNurseSolid } from "react-icons/lia";

const LatestNursesTable = ({ nurses, onSeeAll }) => {
  const latestNurses = [...nurses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Function to determine status badge color
  const getStatusBadge = (status) => {
    return status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  // Function to format date
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
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LiaUserNurseSolid className="h-5 w-5" /> Latest Nurses
        </div>
        <Button
          onClick={onSeeAll}
          className="bg-white hover:bg-gray-100 text-indigo-900 hover:text-indigo-800 rounded-lg px-4 py-1 text-sm flex items-center gap-1 transition-all duration-200"
        >
          See All <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-hidden flex flex-col">
        <div className="overflow-auto flex-grow">
          {latestNurses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex items-center justify-center h-full">
              <LiaUserNurseSolid className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No nurses available</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-3 text-indigo-900 font-semibold">Name</TableHead>
                  <TableHead className="py-3 text-indigo-900 font-semibold">Specialization</TableHead>
                  <TableHead className="py-3 text-indigo-900 font-semibold">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestNurses.map((nurse, index) => (
                  <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <TableCell className="py-3 font-medium text-indigo-900 capitalize">
                      {nurse.name || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 capitalize">
                      {nurse.specialty?.toLowerCase() || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 capitalize">
                      {nurse.type?.toLowerCase() || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Footer with consistent positioning */}
        {latestNurses.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> 
              <span>Last joined: {formatDate(latestNurses[0]?.createdAt)}</span>
            </div>
            <div>{latestNurses.length} of {nurses.length} nurses</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestNursesTable;