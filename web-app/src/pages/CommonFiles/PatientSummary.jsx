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
  IdCard,
  ChevronRight
} from "lucide-react";

const PatientSummary = ({ patients, patientFilter, setPatientFilter, className, doctorId }) => {
  const totalPatients = patients.length;
  const diseaseCategories = [...new Set(patients.flatMap((p) => p.category))];
  const diseaseStages = [...new Set(patients.flatMap((p) => p.diagnoseHistory.map((d) => d.diagnosis)))];
  const patientStatus = [
    ...new Set(patients.map((p) => (p.patientStatus ? p.patientStatus : "Unknown"))),
  ].filter(Boolean);

  // Debug: Log the raw patients data and doctorId
  console.log("Raw patients data:", patients);
  console.log("doctorId passed to PatientSummary:", doctorId);


  const normalizedDoctorId = doctorId ? doctorId.toString() : null;

  // Calculate status counts with conditional doctorId filtering
  const statusCounts = {
    "Pre-Monitoring": patients.filter(p => {
      const matchesStatus = p.patientStatus === "Pre-Monitoring";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const patientDiagnosisDoctor = p.diagnosisDoctor ? p.diagnosisDoctor.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId) || 
                           (patientDiagnosisDoctor && patientDiagnosisDoctor === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
    
      return result;
    }).length,
    "Published": patients.filter(p => {
      const matchesStatus = p.patientStatus === "Published";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const patientDiagnosisDoctor = p.diagnosisDoctor ? p.diagnosisDoctor.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId) || 
                           (patientDiagnosisDoctor && patientDiagnosisDoctor === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
    
      return result;
    }).length,
    "Review": patients.filter(p => {
      const matchesStatus = p.patientStatus === "Review";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
    
      return result;
    }).length,
    "Completed": patients.filter(p => {
      const matchesStatus = p.patientStatus === "Completed";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
      
      return result;
    }).length,
    "Monitoring": patients.filter(p => {
      const matchesStatus = p.patientStatus === "Monitoring";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const patientDiagnosisDoctor = p.diagnosisDoctor ? p.diagnosisDoctor.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId) || 
                           (patientDiagnosisDoctor && patientDiagnosisDoctor === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
   
      return result;
    }).length,
    "New": patients.filter(p => {
      const matchesStatus = p.patientStatus === "New";
      const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
      const patientDiagnosisDoctor = p.diagnosisDoctor ? p.diagnosisDoctor.toString() : null;
      const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId) || 
                           (patientDiagnosisDoctor && patientDiagnosisDoctor === normalizedDoctorId);
      const result = matchesStatus && matchesDoctor;
    
      return result;
    }).length
  };

  // Debug: Log the calculated status counts
  console.log("Calculated statusCounts:", statusCounts);

  // Calculate new patients in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatientsCount = patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  // Calculate patients with upcoming appointments
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingAppointments = patients.filter(p => {
    const hasNextVisit = p.nextVisit && 
      new Date(p.nextVisit) >= today && 
      new Date(p.nextVisit) <= nextWeek;
    const isReviewStatus = p.patientStatus === "Review";
    const patientDoctorId = p.doctorId ? p.doctorId.toString() : null;
    const matchesDoctor = !normalizedDoctorId || (patientDoctorId && patientDoctorId === normalizedDoctorId);
    const result = hasNextVisit && isReviewStatus && matchesDoctor;
    console.log(`Upcoming check for patient ${p.fullName}: nextVisit=${hasNextVisit}, review=${isReviewStatus}, doctorId=${patientDoctorId}, matchesDoctor=${matchesDoctor}, result=${result}`);
    return result;
  }).length;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pre-Monitoring': return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'Published': return <LoaderCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Review': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Completed': return <ClipboardCheck className="h-4 w-4 text-indigo-500" />;
      case 'Monitoring': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'New': return <IdCard className="h-4 w-4 text-gray-500" />;  
      default: return null;
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

                    {/* <div className="flex justify-center gap-2 flex-wrap mt-6">
                      {patientStatus.map(status => (
                        <div key={status} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span>{status}</span>
                        </div>
                      ))}
                    </div> */}
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
                      {["Review", "Monitoring", "Pre-Monitoring", "Published", "Completed", "New"].map((status) => {
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