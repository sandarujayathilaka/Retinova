import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersIcon, SearchIcon, Loader2 } from "lucide-react";
import { api } from "../../../services/api.service";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
// import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PublishedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10,
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [revisitDate, setRevisitDate] = useState(null);
  const [patientCounts, setPatientCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedPatientsAndDoctors = async (page = 1) => {
      setLoading(true);
      try {
        const patientResponse = await api.get("/patients", {
          params: {
            status: "Published",
            page,
            limit: pagination.limit,
            search: searchTerm || undefined,
            gender: selectedGender === "all" ? undefined : selectedGender,
          },
        });
        console.log("Patient API Response:", patientResponse.data);
        if (!patientResponse.data || !Array.isArray(patientResponse.data.data.patients)) {
          throw new Error("Invalid patient API response format");
        }

        setPatients(patientResponse.data.data.patients);
        setPagination(patientResponse.data.data.pagination);

        const doctorIds = [
          ...new Set(
            patientResponse.data.data.patients
              .flatMap((p) => p.diagnoseHistory?.map((d) => d.doctorId) || [])
              .filter((id) => id)
          ),
        ];

        if (doctorIds.length > 0) {
          const doctorResponse = await api.post("/doctors/bulk", { doctorIds });
          console.log("Doctor API Response:", doctorResponse.data);
          setDoctors(doctorResponse.data.doctors || []);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to fetch data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedPatientsAndDoctors(pagination.currentPage);
  }, [pagination.currentPage, searchTerm, selectedGender]);

  const fetchPatientCountForDate = async (date, doctorId) => {
    if (!doctorId) return 0;
    try {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStr = utcDate.toISOString().split("T")[0];
      console.log("Fetching count for:", { patientStatus: "Review", nextVisit: dateStr, doctorId });

      const response = await api.get("/patients/count", {
        params: {
          patientStatus: "Review",
          nextVisit: dateStr,
          doctorId,
        },
        headers: { "Cache-Control": "no-cache" },
      });
      console.log("Count Response:", response.data.data);
      return response.data.data.count || 0;
    } catch (error) {
      console.error("Error fetching patient count:", error);
      return 0;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleGenderFilter = (gender) => {
    setSelectedGender(gender);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    const doctorIds = [
      ...new Set(
        patient.diagnoseHistory?.map((d) => d.doctorId).filter((id) => id) || []
      ),
    ];
    console.log("Selected patient diagnoseHistory:", patient.diagnoseHistory);
    console.log("Unique doctorIds from diagnoseHistory:", doctorIds);

    const latestDiagnosis = patient.diagnoseHistory
      ?.slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const latestDoctorId = latestDiagnosis?.doctorId || doctorIds[0] || "";
    setSelectedDoctorId(latestDoctorId);
    setRevisitDate(null);
    setPatientCounts({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleAssignRevisit = async () => {
    if (!selectedPatient || !selectedDoctorId || !revisitDate) {
      toast.error("Please select a doctor and revisit date.", { position: "top-right" });
      return;
    }

    try {
      const utcRevisitDate = new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate()));
      console.log("Updating revisit for:", selectedPatient.patientId, selectedDoctorId, utcRevisitDate.toISOString());

      const response = await api.put(`/patients/${selectedPatient.patientId}/revisit`, {
        doctorId: selectedDoctorId,
        revisitDate: utcRevisitDate.toISOString(),
      });
      toast.success("Revisit date assigned successfully!", { position: "top-right" });

      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.patientId !== selectedPatient.patientId)
      );

      setPagination((prev) => ({
        ...prev,
        totalPatients: prev.totalPatients - 1,
        totalPages: Math.ceil((prev.totalPatients - 1) / prev.limit),
      }));

      setSelectedPatient(null);
      setSelectedDoctorId("");
      setRevisitDate(null);
      setPatientCounts({});
    } catch (error) {
      toast.error("Failed to assign revisit date.", { position: "top-right" });
    }
  };

  const isDateDisabled = (date) => {
    if (!selectedDoctorId) return false;
    const doctor = doctors.find((d) => d._id?.toString() === selectedDoctorId);
    if (!doctor) return false;

    const day = date.toLocaleString("en-US", { weekday: "long" });
    const isWorkingDay = !!doctor.workingHours[day];

    const isDayOff = doctor.daysOff?.some((dayOff) => {
      const start = new Date(dayOff.startDate);
      const end = new Date(dayOff.endDate);
      return date >= start && date <= end;
    }) || false;

    return !isWorkingDay || isDayOff;
  };

  const handleDateChange = async (date) => {
    if (date && isDateDisabled(date)) {
      toast.error("Selected date is not available for this doctor.", { position: "top-right" });
      setRevisitDate(null);
      setPatientCounts({});
    } else {
      setRevisitDate(date);
      if (date && selectedDoctorId) {
        const count = await fetchPatientCountForDate(date, selectedDoctorId);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dateStr = utcDate.toISOString().split("T")[0];
        setPatientCounts({ [dateStr]: count });
        console.log("Updated patientCounts:", { [dateStr]: count });
      }
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    if (revisitDate && isDateDisabled(revisitDate)) {
      toast.error("Selected date is not available for this doctor.", { position: "top-right" });
      setRevisitDate(null);
      setPatientCounts({});
    } else if (revisitDate && doctorId) {
      fetchPatientCountForDate(revisitDate, doctorId).then((count) => {
        const utcDate = new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate()));
        const dateStr = utcDate.toISOString().split("T")[0];
        setPatientCounts({ [dateStr]: count });
        console.log("Updated patientCounts:", { [dateStr]: count });
      });
    }
  };

  const getDoctorLabel = (doctor) => {
    if (!doctor || !selectedPatient) return "Unknown Doctor";
    const latestDiagnosis = selectedPatient.diagnoseHistory
      ?.slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const isLatest = latestDiagnosis?.doctorId === doctor._id?.toString();
    return `${doctor.name || "N/A"} (${doctor.specialty || "N/A"}${isLatest ? " - Latest" : ""})`;
  };

  const renderDayContents = (day, date) => {
    const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split("T")[0];
    const count = patientCounts[dateStr] || 0;
    return (
      <div className="relative flex flex-col items-center">
        <span>{day}</span>
        {count > 0 && (
          <span className="text-xs text-teal-600 font-semibold absolute -bottom-2">{count}</span>
        )}
      </div>
    );
  };

  const displayedCount = patients.length;

  return (
    <div className="bg-gray-100">
      <Card className="max-w-7xl mx-auto rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-8 w-8" /> Published Patients
              </span>
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                <Input
                  placeholder="Search by id, name, NIC, or email..."
                  className="pl-10 py-2 rounded-full bg-white/10 border-none text-white placeholder-gray-200 focus:ring-2 focus:ring-teal-300 transition-all duration-200"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Select value={selectedGender} onValueChange={handleGenderFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/10 border-none text-white rounded-full focus:ring-2 focus:ring-teal-300">
                  <SelectValue placeholder="Gender Filter" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg shadow-lg">
                  <SelectItem value="all" className="hover:bg-teal-50">All Genders</SelectItem>
                  <SelectItem value="male" className="hover:bg-teal-50">Male</SelectItem>
                  <SelectItem value="female" className="hover:bg-teal-50">Female</SelectItem>
                  <SelectItem value="other" className="hover:bg-teal-50">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
          ) : (
            <>
              <Table className="w-full">
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="py-4 font-semibold text-gray-700">Patient ID</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">NIC</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Age</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Gender</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow
                      key={patient.patientId}
                      className="hover:bg-teal-50 transition-all duration-200 border-b border-gray-200 animate-fadeIn"
                    >
                      <TableCell className="py-4 font-medium text-teal-700">{patient.patientId}</TableCell>
                      <TableCell className="py-4 font-medium text-gray-800">{patient.fullName || "N/A"}</TableCell>
                      <TableCell className="py-4 text-gray-600">{patient.nic || "N/A"}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`${
                            patient.age >= 50
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-green-100 text-green-700 border-green-300"
                          } rounded-full px-2`}
                        >
                          {patient.age || "0"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2 ${
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
                          variant="outline"
                          className="rounded-full bg-teal-500 text-white hover:bg-teal-600 border-none shadow-md transition-all duration-200"
                          onClick={() => handleViewPatient(patient)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPatients > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {displayedCount > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} to{" "}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalPatients)} of{" "}
                    {pagination.totalPatients} patients
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="rounded-full"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="rounded-full"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && patients.length === 0 && (
            <div className="p-10 text-center text-gray-600 bg-gray-50 rounded-lg">
              <p className="text-lg">No published patients found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] rounded-xl shadow-2xl bg-white p-0 overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 p-6 sticky top-0 z-10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <UsersIcon className="h-6 w-6" />
                Patient Details - {selectedPatient.patientId}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-teal-700 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">Name</span>
                    <span className="text-gray-900">{selectedPatient.fullName || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">Gender</span>
                    <span className="text-gray-900">{selectedPatient.gender || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">NIC</span>
                    <span className="text-gray-900">{selectedPatient.nic || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">Contact</span>
                    <span className="text-gray-900">{selectedPatient.contactNumber || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">Email</span>
                    <span className="text-gray-900">{selectedPatient.email || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">Address</span>
                    <span className="text-gray-900">{selectedPatient.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assign Doctor</label>
                <Select value={selectedDoctorId} onValueChange={handleDoctorChange}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200">
                    {selectedPatient && selectedPatient.diagnoseHistory?.length > 0 ? (
                      doctors.length > 0 ? (
                        doctors
                          .filter((doctor) =>
                            selectedPatient.diagnoseHistory.some((d) => d.doctorId === doctor._id?.toString())
                          )
                          .map((doctor) => (
                            <SelectItem
                              key={doctor._id?.toString() || Math.random()} // Fallback key if _id is undefined
                              value={doctor._id?.toString() || ""} // Fallback value
                              className="hover:bg-teal-50 transition-all duration-150"
                            >
                              {getDoctorLabel(doctor)}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="" disabled className="text-gray-500">
                          Loading doctors...
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="" disabled className="text-gray-500">
                        No doctors available for this patient
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctorId && (
                <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-teal-700 mb-3">Doctor Information</h3>
                  {(() => {
                    const doctor = doctors.find((d) => d._id?.toString() === selectedDoctorId);
                    return doctor ? (
                      <div className="space-y-4 text-sm">
                        <p>
                          <span className="font-medium text-gray-700">Name:</span>{" "}
                          <span className="text-gray-900">{doctor.name || "N/A"}</span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Type:</span>{" "}
                          <span className="text-gray-900">{doctor.type || "N/A"}</span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Specialty:</span>{" "}
                          <span className="text-gray-900">{doctor.specialty || "N/A"}</span>
                        </p>
                        <div>
                          <span className="font-medium text-gray-700">Working Days:</span>
                          <ul className="list-disc pl-5 text-gray-900">
                            {Object.entries(doctor.workingHours || {})
                              .filter(([, hours]) => hours)
                              .map(([day, { startTime, endTime }]) => (
                                <li key={day}>
                                  {day}: {startTime} - {endTime}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Days Off:</span>
                          <ul className="list-disc pl-5 text-gray-900">
                            {doctor.daysOff?.length > 0 ? (
                              doctor.daysOff.map((dayOff, index) => (
                                <li key={index}>
                                  {new Date(dayOff.startDate).toLocaleDateString()} -{" "}
                                  {new Date(dayOff.endDate).toLocaleDateString()}
                                </li>
                              ))
                            ) : (
                              <li>None</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No doctor details available.</p>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Schedule Revisit Date</label>
                <DatePicker
                  selected={revisitDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  filterDate={(date) => !isDateDisabled(date)}
                  className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700"
                  placeholderText="Select a date"
                  dateFormat="yyyy-MM-dd"
                  popperPlacement="top-start"
                  calendarClassName="custom-datepicker"
                  renderDayContents={renderDayContents}
                />
                {revisitDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Patient Count for {revisitDate.toLocaleDateString()}:{" "}
                    <span className="font-semibold text-teal-600">
                      {patientCounts[new Date(Date.UTC(revisitDate.getFullYear(), revisitDate.getMonth(), revisitDate.getDate())).toISOString().split("T")[0]] || 0}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="bg-gray-100 p-4 flex justify-end gap-3 sticky bottom-0 z-10">
              <Button
                variant="outline"
                className="rounded-lg bg-white text-gray-700 border-gray-300 hover:bg-gray-200 transition-all duration-200"
                onClick={() => setSelectedPatient(null)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200"
                onClick={handleAssignRevisit}
              >
                Assign Revisit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <style>{`
        .custom-datepicker {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: #ffffff;
          font-family: inherit;
        }
        .react-datepicker__header {
          background: linear-gradient(to right, #14b8a6, #06b6d4, #3b82f6);
          border-bottom: none;
          padding: 0.5rem;
          color: #ffffff;
          font-weight: 600;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: #ffffff;
        }
        .react-datepicker__day {
          color: #374151;
          position: relative;
        }
        .react-datepicker__day:hover {
          background-color: #ccfbf1;
          color: #0f766e;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #14b8a6;
          color: #ffffff;
          border-radius: 9999px;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #ffffff;
        }
        .react-datepicker__triangle {
          border-bottom-color: #14b8a6;
        }
      `}</style>
    </div>
  );
};

export default PublishedPatients;