import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { LiaUserNurseSolid } from "react-icons/lia";

const NurseSummary = ({ nurses, nurseFilter, setNurseFilter, className }) => {
  const totalNurses = nurses.length;
  const nurseTypes = [...new Set(nurses.map((nurse) => nurse.type?.toLowerCase() || ""))].filter(Boolean);
  const nurseSpecialties = [...new Set(nurses.map((nurse) => nurse.specialty?.toLowerCase() || ""))].filter(Boolean);
  
  // Calculate different types of nurses
  const fullTimeNurses = nurses.filter(nurse => nurse.type?.toLowerCase() === "full time").length;
  const partTimeNurses = nurses.filter(nurse => nurse.type?.toLowerCase() === "part time").length;
  const activeNurses = nurses.filter(nurse => nurse.status === true).length;
  const inactiveNurses = nurses.filter(nurse => nurse.status === false).length;
  
  // Calculate online/offline status
  const onlineNurses = nurses.filter(nurse => nurse.status).length;

  return (
    <Card className={`rounded-xl overflow-hidden bg-white transition-all duration-300 border-none ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LiaUserNurseSolid className="h-5 w-5" /> Nurse Summary
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        {totalNurses === 0 ? (
          <div className="flex justify-center items-center h-full py-8">
            <div className="text-center">
              <LiaUserNurseSolid className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xl font-medium text-gray-500">No nurses found</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full flex-grow">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-blue-800">{totalNurses}</div>
                <div className="text-sm text-blue-600 font-medium">Total Nurses</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-indigo-800">{onlineNurses}</div>
                <div className="text-sm text-indigo-600 font-medium">Online</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-green-700">{activeNurses}</div>
                <div className="text-sm text-green-600 font-medium">Active Nurses</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-red-700">{inactiveNurses}</div>
                <div className="text-sm text-red-600 font-medium">Inactive Nurses</div>
              </div>
            </div>
            
            {/* Filter Section */}
            <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Filter className="h-4 w-4" /> Filter By:
              </div>
              <Select value={nurseFilter} onValueChange={setNurseFilter}>
                <SelectTrigger className="w-[180px] bg-white text-indigo-800 border-indigo-100">
                  <SelectValue placeholder="Filter Nurses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Nurses</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                  <SelectItem value="specialty">By Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtered Content */}
            <div className="w-full text-indigo-900 flex flex-col flex-grow bg-indigo-50 rounded-lg p-4">
              {nurseFilter === "total" && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-indigo-800 mb-2">{totalNurses}</p>
                    <p className="text-indigo-600">Total Nurses</p>
                  </div>
                </div>
              )}

              {nurseFilter === "type" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Nurse Types
                  </p>
                  {nurseTypes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No type information available</div>
                  ) : (
                    <div className="space-y-3">
                      {nurseTypes.map((type) => {
                        const count = nurses.filter((nurse) => nurse.type?.toLowerCase() === type).length;
                        const percentage = Math.round((count / totalNurses) * 100);
                        
                        const isFullTime = type === "full time";
                        
                        return (
                          <div key={type} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{type}</span>
                              <span className="font-bold text-indigo-800">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${isFullTime ? 'bg-green-500' : 'bg-purple-500'}`}
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

              {nurseFilter === "specialty" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Specialties
                  </p>
                  {nurseSpecialties.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No specialty information available</div>
                  ) : (
                    <div className="space-y-3">
                      {nurseSpecialties.map((specialty, index) => {
                        const count = nurses.filter((nurse) => nurse.specialty?.toLowerCase() === specialty).length;
                        const percentage = Math.round((count / totalNurses) * 100);
                        
                      
                        const colors = [
                          'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 
                          'bg-purple-500', 'bg-cyan-500', 'bg-sky-500'
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <div key={specialty} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{specialty}</span>
                              <span className="font-bold text-indigo-800">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${colorClass}`}
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

export default NurseSummary;