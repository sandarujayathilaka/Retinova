import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { FaUserDoctor } from "react-icons/fa6";

const DoctorSummary = ({ doctors, doctorFilter, setDoctorFilter, className }) => {
  const totalDoctors = doctors.length;
  const doctorTypes = [...new Set(doctors.map((doc) => doc.type?.toLowerCase() || ""))].filter(Boolean);
  const doctorSpecialties = [...new Set(doctors.map((doc) => doc.specialty?.toLowerCase() || ""))].filter(Boolean);
  console.log(doctors)
  // Calculate different types of doctors
  const fullTimeDoctors = doctors.filter(doc => doc.type?.toLowerCase() === "full time").length;
  const partTimeDoctors = doctors.filter(doc => doc.type?.toLowerCase() === "part time").length;
  const activeDoctors = doctors.filter(doc => doc.status === true).length;
const inactiveDoctors = doctors.filter(doc => doc.status === false).length;

  // Calculate doctors by specialty categories
  const specialtyCounts = {};
  doctorSpecialties.forEach(specialty => {
    specialtyCounts[specialty] = doctors.filter(doc => doc.specialty?.toLowerCase() === specialty).length;
  });
  
  // Calculate online/offline status
  const onlineDoctors = doctors.filter(doc => doc.status).length;

  return (
    <Card className={`rounded-xl overflow-hidden bg-white transition-all duration-300 border-none ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <FaUserDoctor className="h-5 w-5" /> Doctor Summary
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        {totalDoctors === 0 ? (
          <div className="flex justify-center items-center h-full py-8">
            <div className="text-center">
              <FaUserDoctor className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xl font-medium text-gray-500">No doctors found</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full flex-grow">
      
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-blue-800">{totalDoctors}</div>
                <div className="text-sm text-blue-600 font-medium">Total Doctors</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-indigo-800">{onlineDoctors}</div>
                <div className="text-sm text-indigo-600 font-medium">Online</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-green-700">{activeDoctors}</div>
                <div className="text-sm text-green-600 font-medium">Active Doctor</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-red-700">{inactiveDoctors}</div>
                <div className="text-sm text-red-600 font-medium">Inactive Doctor</div>
              </div>
            </div>
            
        
            <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Filter className="h-4 w-4" /> Filter By:
              </div>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="w-[180px] bg-white text-indigo-800 border-indigo-100">
                  <SelectValue placeholder="Filter Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Doctors</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                  <SelectItem value="specialty">By Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>

     
            <div className="w-full text-indigo-900 flex flex-col flex-grow bg-indigo-50 rounded-lg p-4">
              {doctorFilter === "total" && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-indigo-800 mb-2">{totalDoctors}</p>
                    <p className="text-indigo-600">Total Doctors</p>
                  </div>
                </div>
              )}

              {doctorFilter === "type" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Doctor Types
                  </p>
                  {doctorTypes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No type information available</div>
                  ) : (
                    <div className="space-y-3">
                      {doctorTypes.map((type) => {
                        const count = doctors.filter((doc) => doc.type?.toLowerCase() === type).length;
                        const percentage = Math.round((count / totalDoctors) * 100);
                        
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

              {doctorFilter === "specialty" && (
                <div className="w-full">
                  <p className="text-lg font-semibold mb-3 text-indigo-800 border-b border-indigo-200 pb-2">
                    Specialties
                  </p>
                  {doctorSpecialties.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No specialty information available</div>
                  ) : (
                    <div className="space-y-3">
                      {doctorSpecialties.map((specialty, index) => {
                        const count = doctors.filter((doc) => doc.specialty?.toLowerCase() === specialty).length;
                        const percentage = Math.round((count / totalDoctors) * 100);
                        
                       
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

export default DoctorSummary;