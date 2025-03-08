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
import { Users2,Users,Users2Icon,UsersIcon,UsersRound,UsersRoundIcon,SearchIcon, Loader2, User } from "lucide-react";
import { api } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to calculate age from birthDate
// const calculateAge = (birthDate) => {
//   const birth = new Date(birthDate);
//   const today = new Date();
//   let age = today.getFullYear() - birth.getFullYear();
//   const monthDifference = today.getMonth() - birth.getMonth();

//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }
//   return age;
// };

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const patientsRes = await api.get("/patients");
        setPatients(patientsRes.data.patients);
        setFilteredPatients(patientsRes.data.patients);
      } catch (error) {
        toast.error("Failed to fetch patients. Please try again.", {
          position: "top-right",
          autoClose: 3000, 
        })
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyFilters = (term, gender) => {
    const filtered = patients.filter((patient) => {
      const matchesSearch =
        patient.fullName.toLowerCase().includes(term.toLowerCase()) ||
        patient.nic.toLowerCase().includes(term.toLowerCase()) ||
        patient.email?.toLowerCase().includes(term.toLowerCase());
      const matchesGender =
        gender === "all" || patient.gender.toLowerCase() === gender.toLowerCase();
      return matchesSearch && matchesGender;
    });
    setFilteredPatients(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, selectedGender);
  };

  const handleGenderFilter = (gender) => {
    setSelectedGender(gender);
    applyFilters(searchTerm, gender);
  };

  const handleViewPatient = (patientId) => {
    navigate(`/allPatients/view/${patientId}`);
  };

  return (
    <div className=" bg-gray-100">
      <Card className="max-w-7xl mx-auto rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-8 w-8" /> Patients Record
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
                {filteredPatients.map((patient) => {
                  return (
                    <TableRow
                      key={patient.id}
                      className="hover:bg-teal-50 transition-all duration-200 border-b border-gray-200 animate-fadeIn"
                    >
                      <TableCell className="py-4 font-medium text-teal-700">{patient.patientId}</TableCell>
                      <TableCell className="py-4 font-medium text-gray-800">{patient.fullName}</TableCell>
                      <TableCell className="py-4 text-gray-600">{patient.nic}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`${
                            patient.age >= 50
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-green-100 text-green-700 border-green-300"
                          } rounded-full px-2`}
                        >
                          {patient.age}
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
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="outline"
                          className="rounded-full bg-teal-500 text-white hover:bg-teal-600 border-none shadow-md transition-all duration-200"
                          onClick={() => handleViewPatient(patient.patientId)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!loading && filteredPatients.length === 0 && (
            <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-lg">No patients found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};

export default AllPatients;