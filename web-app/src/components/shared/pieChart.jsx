// import { useState, useEffect } from "react";
// import { ResponsiveContainer, PieChart, Pie, Label, Tooltip, Cell } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const getMonths = () => {
//   return Array.from({ length: 12 }, (_, i) =>
//     new Date(0, i).toLocaleString("en-US", { month: "long" })
//   );
// };

// const getYears = () => {
//   const currentYear = new Date().getFullYear();
//   return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
// };

// export function PieChartComponent({ 
//   data, 
//   config, 
//   title, 
//   description, 
//   showDatePicker = true, 
//   doctorsData, 
//   nursesData // New prop for nurse data
// }) {
//   const months = getMonths();
//   const years = getYears();
//   const currentYear = new Date().getFullYear().toString();

//   const [selectedMonth, setSelectedMonth] = useState("all"); // Default to "all" for all months
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   useEffect(() => {
//     console.log("Pie Chart Received Data:", data);
//   }, [data]);

//   const filteredData = data.map((item) => {
//     if (!item.dates) {
//       // For cases like "Status" where no dates array exists, return the item as is if no date picker
//       return showDatePicker ? null : item;
//     }

//     const yearStart = new Date(`January 1, ${selectedYear}`).setHours(0, 0, 0, 0);
//     const yearEnd = new Date(`December 31, ${selectedYear}`).setHours(23, 59, 59, 999);

//     const validDates = item.dates.filter((dateStr) => {
//       const itemDate = new Date(dateStr).setHours(0, 0, 0, 0);
//       if (selectedMonth === "all") {
//         return itemDate >= yearStart && itemDate <= yearEnd;
//       }
//       const monthStart = new Date(`${selectedMonth} 1, ${selectedYear}`).setHours(0, 0, 0, 0);
//       const monthEnd = new Date(monthStart).setMonth(new Date(monthStart).getMonth() + 1) - 1;
//       return itemDate >= monthStart && itemDate <= monthEnd;
//     });

//     return validDates.length > 0 ? { ...item, value: validDates.length } : null;
//   }).filter((item) => item !== null);

//   const aggregatedData = filteredData.reduce((acc, item) => {
//     const existing = acc.find((d) => d.name === item.name);
//     if (existing) {
//       existing.value += item.value;
//     } else {
//       acc.push({ name: item.name, value: item.value, fill: item.fill });
//     }
//     return acc;
//   }, []).filter(item => item.value > 0);

//   const totalValue = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);
//   const dataWithPercentage = aggregatedData.map((item) => ({
//     ...item,
//     percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(2) + "%" : "0%",
//   }));

//   console.log("Filtered Data:", filteredData);
//   console.log("Aggregated Data:", aggregatedData);
//   console.log("Data with Percentage:", dataWithPercentage);

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const { name, value } = payload[0];
//       return (
//         <div className="bg-white p-2 border rounded shadow">
//           <p>{`${name}: ${value}`}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <Card>
//       <CardHeader className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-2">
//         <div>
//           <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
//           <CardDescription className="text-sm sm:text-base">{description}</CardDescription>
//         </div>
//         {showDatePicker && (
//           <div className="flex flex-wrap gap-4">
//             <Select onValueChange={setSelectedMonth} value={selectedMonth}>
//               <SelectTrigger className="w-40"><SelectValue placeholder="All Months" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Months</SelectItem>
//                 {months.map((month) => (
//                   <SelectItem key={month} value={month}>{month}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select onValueChange={setSelectedYear} value={selectedYear}>
//               <SelectTrigger className="w-40"><SelectValue placeholder="Select Year" /></SelectTrigger>
//               <SelectContent>
//                 {years.map((year) => (
//                   <SelectItem key={year} value={year}>{year}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         )}
//       </CardHeader>

//       <CardContent className="flex flex-col items-center pb-0 gap-4">
//         <div className="w-full h-[310px]">
//           <ResponsiveContainer width="100%" height="100%">
//             {dataWithPercentage.length === 0 || totalValue === 0 ? (
//               <div className="flex items-center justify-center h-60 w-full text-center text-gray-500 text-lg">
//                 No records to show.
//               </div>
//             ) : (
//               <PieChart>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Pie
//                   data={dataWithPercentage}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius="40%"
//                   outerRadius="70%"
//                   strokeWidth={4}
//                 >
//                   <Label
//                     content={({ viewBox }) => {
//                       if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                         return (
//                           <text
//                             x={viewBox.cx}
//                             y={viewBox.cy}
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                           >
//                             <tspan
//                               x={viewBox.cx}
//                               y={viewBox.cy}
//                               className="fill-foreground text-xl font-bold"
//                             >
//                               Total
//                             </tspan>
//                             <tspan
//                               x={viewBox.cx}
//                               y={(viewBox.cy || 0) + 24}
//                               className="fill-foreground text-lg"
//                             >
//                               {totalValue}
//                             </tspan>
//                           </text>
//                         );
//                       }
//                     }}
//                   />
//                   {dataWithPercentage.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.fill} />
//                   ))}
//                 </Pie>
//               </PieChart>
//             )}
//           </ResponsiveContainer>
//         </div>
//         {!showDatePicker && doctorsData && (
//           <div className="w-full max-h-[120px] overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {doctorsData
//                   .sort((a, b) => b.status - a.status)
//                   .map((doctor, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{doctor.name}</TableCell>
//                       <TableCell>{doctor.type}</TableCell>
//                       <TableCell>{doctor.status ? "Online" : "Offline"}</TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//         {!showDatePicker && nursesData && (
//           <div className="w-full max-h-[120px] overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {nursesData
//                   .sort((a, b) => b.status - a.status)
//                   .map((nurse, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{nurse.name}</TableCell>
//                       <TableCell>{nurse.type}</TableCell>
//                       <TableCell>{nurse.status ? "Online" : "Offline"}</TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </CardContent>

//       {dataWithPercentage.length > 0 && totalValue > 0 && (
//         <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
//           <div className="flex flex-wrap justify-center gap-2 text-sm sm:text-base">
//             {dataWithPercentage.map((item) => (
//               <div key={item.name} className="flex items-center">
//                 <div
//                   className="w-4 h-4 rounded-full mr-2"
//                   style={{ backgroundColor: item.fill }}
//                 />
//                 <span>
//                   {item.name}: {item.value} ({item.percentage})
//                 </span>
//               </div>
//             ))}
//           </div>
//         </CardFooter>
//       )}
//     </Card>
//   );
// }

import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Label, Tooltip, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, BarChart3 } from "lucide-react";

const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};

export function PieChartComponent({ 
  data, 
  config, 
  title, 
  description, 
  showDatePicker = true, 
  doctorsData, 
  nursesData
}) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredData = data.map((item) => {
    if (!item.dates) {
      // For cases like "Status" where no dates array exists, return the item as is if no date picker
      return showDatePicker ? null : item;
    }

    const yearStart = new Date(`January 1, ${selectedYear}`).setHours(0, 0, 0, 0);
    const yearEnd = new Date(`December 31, ${selectedYear}`).setHours(23, 59, 59, 999);

    const validDates = item.dates.filter((dateStr) => {
      const itemDate = new Date(dateStr).setHours(0, 0, 0, 0);
      if (selectedMonth === "all") {
        return itemDate >= yearStart && itemDate <= yearEnd;
      }
      const monthStart = new Date(`${selectedMonth} 1, ${selectedYear}`).setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart).setMonth(new Date(monthStart).getMonth() + 1) - 1;
      return itemDate >= monthStart && itemDate <= monthEnd;
    });

    return validDates.length > 0 ? { ...item, value: validDates.length } : null;
  }).filter((item) => item !== null);

  const aggregatedData = filteredData.reduce((acc, item) => {
    const existing = acc.find((d) => d.name === item.name);
    if (existing) {
      existing.value += item.value;
    } else {
      acc.push({ name: item.name, value: item.value, fill: item.fill });
    }
    return acc;
  }, []).filter(item => item.value > 0);

  const totalValue = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);
  const dataWithPercentage = aggregatedData.map((item) => ({
    ...item,
    percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) + "%" : "0%",
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, percentage } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <p className="font-medium text-indigo-900">{name}</p>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-gray-600">Count:</span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium">{percentage}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none">
      {title && description && (
        <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="text-blue-100">{description}</CardDescription>
          </div>
        </CardHeader>
      )}

      {showDatePicker && (
        <div className="bg-gray-50 p-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Time Period:
          </div>
          <div className="flex flex-wrap gap-3">
            <Select onValueChange={setSelectedMonth} value={selectedMonth}>
              <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className="w-32 bg-white border-gray-200 text-sm text-indigo-900">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {dataWithPercentage.length === 0 || totalValue === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No data available</span>
                </div>
              </div>
            ) : (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={dataWithPercentage}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="45%"
                  outerRadius="70%"
                  strokeWidth={2}
                  stroke="#ffffff"
                  paddingAngle={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <g>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy - 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-indigo-900 text-base font-medium"
                            >
                              Total
                            </text>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy + 15}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-indigo-800 text-2xl font-bold"
                            >
                              {totalValue}
                            </text>
                          </g>
                        );
                      }
                    }}
                  />
                  {dataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {!showDatePicker && doctorsData && (
          <div className="mt-4 pt-3 border-t border-gray-100 w-full">
            <h3 className="font-medium text-indigo-900 mb-2 text-sm">Staff Details</h3>
            <div className="max-h-[180px] overflow-y-auto rounded-lg border border-gray-100">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="py-2 text-indigo-900 font-medium">Name</TableHead>
                    <TableHead className="py-2 text-indigo-900 font-medium">Type</TableHead>
                    <TableHead className="py-2 text-indigo-900 font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                        No staff data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctorsData
                      .sort((a, b) => b.status - a.status)
                      .map((doctor, index) => (
                        <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <TableCell className="py-2 font-medium">{doctor.name}</TableCell>
                          <TableCell className="py-2 capitalize">{doctor.type?.toLowerCase() || "N/A"}</TableCell>
                          <TableCell className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${doctor.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {doctor.status ? "Online" : "Offline"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {!showDatePicker && nursesData && (
          <div className="mt-4 pt-3 border-t border-gray-100 w-full">
            <h3 className="font-medium text-indigo-900 mb-2 text-sm">Staff Details</h3>
            <div className="max-h-[180px] overflow-y-auto rounded-lg border border-gray-100">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="py-2 text-indigo-900 font-medium">Name</TableHead>
                    <TableHead className="py-2 text-indigo-900 font-medium">Type</TableHead>
                    <TableHead className="py-2 text-indigo-900 font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nursesData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                        No staff data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    nursesData
                      .sort((a, b) => b.status - a.status)
                      .map((nurse, index) => (
                        <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <TableCell className="py-2 font-medium">{nurse.name}</TableCell>
                          <TableCell className="py-2 capitalize">{nurse.type?.toLowerCase() || "N/A"}</TableCell>
                          <TableCell className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${nurse.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {nurse.status ? "Online" : "Offline"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      {dataWithPercentage.length > 0 && totalValue > 0 && (
        <CardFooter className="flex flex-col items-center gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-3">
            {dataWithPercentage.map((item) => (
              <div key={item.name} className="flex items-center bg-white px-3 py-1.5 rounded-lg">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm">
                  <span className="font-medium">{item.name}</span>: {item.value} <span className="text-gray-500">({item.percentage})</span>
                </span>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}