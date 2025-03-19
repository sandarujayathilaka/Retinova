// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ErrorAlert } from "@/components/error/ErrorAlert";
// import { api } from "@/services/api.service";

// const PatientsPage = () => {
//   const [patients, setPatients] = useState([]);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalPatients: 0,
//     patientsPerPage: 10,
//   });
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     category: "",
//     gender: "",
//     ageMin: "",
//     ageMax: "",
//     search: "",
//     sortBy: "createdAt",
//     sortOrder: "desc",
//   });
//   const [loading, setLoading] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const fetchPatients = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get("patients/getallpatients", {
//         params: filters,
//       });
//       setPatients(response.data.data);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       console.error("Error fetching patients:", error);
//       setError(error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (isInitialLoad) {
//       fetchPatients();
//       setIsInitialLoad(false);
//     }
//   }, [isInitialLoad]);

//   const handleFilterChange = e => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
//   };

//   const handleSearch = () => {
//     fetchPatients();
//   };

//   const handlePageChange = newPage => {
//     setFilters(prev => ({ ...prev, page: newPage }));
//     fetchPatients();
//   };

//   const handleViewPatient = patientId => {
//     navigate(`/patients/${patientId}`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Records</h1>

//       {error && <ErrorAlert message={error} />}

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Search</label>
//             <input
//               type="text"
//               name="search"
//               value={filters.search}
//               onChange={handleFilterChange}
//               placeholder="Search by name or ID"
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Category</label>
//             <select
//               name="category"
//               value={filters.category}
//               onChange={handleFilterChange}
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All</option>
//               <option value="DR">DR</option>
//               <option value="AMD">AMD</option>
//               <option value="Glaucoma">Glaucoma</option>
//               <option value="RVO">RVO</option>
//               <option value="Others">Others</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Gender</label>
//             <select
//               name="gender"
//               value={filters.gender}
//               onChange={handleFilterChange}
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Age Min</label>
//             <input
//               type="number"
//               name="ageMin"
//               value={filters.ageMin}
//               onChange={handleFilterChange}
//               placeholder="Min Age"
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Age Max</label>
//             <input
//               type="number"
//               name="ageMax"
//               value={filters.ageMax}
//               onChange={handleFilterChange}
//               placeholder="Max Age"
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Sort By</label>
//             <select
//               name="sortBy"
//               value={filters.sortBy}
//               onChange={handleFilterChange}
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="createdAt">Created Date</option>
//               <option value="age">Age</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Sort Order</label>
//             <select
//               name="sortOrder"
//               value={filters.sortOrder}
//               onChange={handleFilterChange}
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="desc">Descending</option>
//               <option value="asc">Ascending</option>
//             </select>
//           </div>
//         </div>
//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSearch}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Search
//           </button>
//         </div>
//       </div>

//       {/* Patients Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         {loading ? (
//           <div className="p-4 text-center text-gray-500">Loading...</div>
//         ) : (
//           <>
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Patient ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Category
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Age
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Gender
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {patients.map(patient => (
//                   <tr key={patient.patientId} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {patient.patientId}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {patient.fullName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {patient.category.join(", ")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {patient.age}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {patient.gender}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <button
//                         onClick={() => handleViewPatient(patient.patientId)}
//                         className="text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
//               <p className="text-sm text-gray-700">
//                 Showing {pagination.patientsPerPage * (pagination.currentPage - 1) + 1} to{" "}
//                 {Math.min(
//                   pagination.patientsPerPage * pagination.currentPage,
//                   pagination.totalPatients,
//                 )}{" "}
//                 of {pagination.totalPatients} patients
//               </p>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handlePageChange(pagination.currentPage - 1)}
//                   disabled={pagination.currentPage === 1}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(pagination.currentPage + 1)}
//                   disabled={pagination.currentPage === pagination.totalPages}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PatientsPage;
