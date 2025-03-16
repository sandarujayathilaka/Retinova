// import { CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { UsersIcon, SearchIcon } from "lucide-react";

// const PatientFilters = ({ searchTerm, setSearchTerm, selectedGender, setSelectedGender, setPagination, title }) => {
//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//   };

//   const handleGenderFilter = (gender) => {
//     setSelectedGender(gender);
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//   };

//   return (
//     <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
//       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//         <CardTitle className="text-3xl font-extrabold tracking-tight">
//           <span className="flex items-center gap-2">
//             <UsersIcon className="h-8 w-8" /> {title || "Published Patients"}
//           </span>
//         </CardTitle>
//         <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
//           <div className="relative flex-1">
//             <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
//             <Input
//               placeholder="Search by id, name, NIC, or email..."
//               className="pl-10 py-2 rounded-full bg-white/10 border-none text-white placeholder-gray-200 focus:ring-2 focus:ring-teal-300"
//               value={searchTerm}
//               onChange={handleSearch}
//             />
//           </div>
//           <Select value={selectedGender} onValueChange={handleGenderFilter}>
//             <SelectTrigger className="w-full md:w-40 bg-white/10 border-none text-white rounded-full focus:ring-2 focus:ring-teal-300">
//               <SelectValue placeholder="Gender Filter" />
//             </SelectTrigger>
//             <SelectContent className="bg-white rounded-lg shadow-lg">
//               <SelectItem value="all" className="hover:bg-teal-50">All Genders</SelectItem>
//               <SelectItem value="male" className="hover:bg-teal-50">Male</SelectItem>
//               <SelectItem value="female" className="hover:bg-teal-50">Female</SelectItem>
//               <SelectItem value="other" className="hover:bg-teal-50">Other</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </CardHeader>
//   );
// };

// export default PatientFilters;

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, User2, Filter } from "lucide-react";

const PatientFilters = ({
  searchTerm,
  setSearchTerm,
  selectedGender,
  setSelectedGender,
  setPagination,
  title,
  customClass = ""
}) => {
  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleGenderChange = (value) => {
    setSelectedGender(value);
    // Reset to first page when changing filters
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className={`${customClass}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        {title && (
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-indigo-600" />
            {title}
          </h1>
        )}
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Label htmlFor="search" className="sr-only">
              Search patients
            </Label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="search"
              type="text"
              placeholder="Search by name, email, or ID"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 h-10 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <User2 className="h-4 w-4 text-blue-700" />
              </div>
              <Select value={selectedGender} onValueChange={handleGenderChange}>
                <SelectTrigger className="w-32 h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-gray-200">
                  <SelectItem value="all" className="py-2 hover:bg-blue-50 rounded-lg">
                    All Genders
                  </SelectItem>
                  <SelectItem value="Male" className="py-2 hover:bg-blue-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-600">♂</span> Male
                    </span>
                  </SelectItem>
                  <SelectItem value="Female" className="py-2 hover:bg-blue-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-pink-500">♀</span> Female
                    </span>
                  </SelectItem>
                  <SelectItem value="Other" className="py-2 hover:bg-blue-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-purple-500">⚧</span> Other
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFilters;