// import React from "react";
// import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// // DoctorTypeAndSpecialtyLineChart Component
// const DoctorTypeAndSpecialtyLineChart = ({ data, view }) => {
//   // Aggregate data based on view (specialties or types)
//   const aggregateData = () => {
//     const aggregated = {};
//     data.forEach((doctor) => {
//       const key = view === "specialties" ? doctor.specialty.toLowerCase() : doctor.type.toLowerCase();
//       if (key) {
//         aggregated[key] = (aggregated[key] || 0) + 1;
//       }
//     });

//     // Convert to array of objects for recharts
//     return Object.keys(aggregated)
//       .sort()
//       .map((key) => ({
//         label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize for display
//         count: aggregated[key],
//       }));
//   };

//   const chartData = aggregateData();

//   // Chart configuration (removed ChartConfig reference)
//   const chartConfig = {
//     count: {
//       label: "Count",
//       color: "hsl(var(--chart-1))",
//     },
//   };

//   return (
//     <ChartContainer config={chartConfig}>
//       <LineChart
//         accessibilityLayer
//         data={chartData}
//         margin={{
//           left: 12,
//           right: 12,
//         }}
//       >
//         <CartesianGrid vertical={false} />
//         <XAxis
//           dataKey="label"
//           tickLine={false}
//           axisLine={false}
//           tickMargin={8}
//           angle={-45}
//           textAnchor="end"
//           tickFormatter={(value) => value.slice(0, 10)} // Shorten long labels
//         />
//         <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//         <Line
//           dataKey="count"
//           type="natural"
//           stroke="var(--color-count)"
//           strokeWidth={2}
//           dot={false}
//         />
//       </LineChart>
//     </ChartContainer>
//   );
// };

// // NurseTypeAndSpecialtyLineChart Component
// const NurseTypeAndSpecialtyLineChart = ({ data, view }) => {
//   // Aggregate data based on view (specialties or types)
//   const aggregateData = () => {
//     const aggregated = {};
//     data.forEach((nurse) => {
//       const key = view === "specialties" ? nurse.specialty.toLowerCase() : nurse.type.toLowerCase();
//       if (key) {
//         aggregated[key] = (aggregated[key] || 0) + 1;
//       }
//     });

//     // Convert to array of objects for recharts
//     return Object.keys(aggregated)
//       .sort()
//       .map((key) => ({
//         label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize for display
//         count: aggregated[key],
//       }));
//   };

//   const chartData = aggregateData();

//   // Chart configuration (removed ChartConfig reference)
//   const chartConfig = {
//     count: {
//       label: "Count",
//       color: "hsl(var(--chart-2))",
//     },
//   };

//   return (
//     <ChartContainer config={chartConfig}>
//       <LineChart
//         accessibilityLayer
//         data={chartData}
//         margin={{
//           left: 12,
//           right: 12,
//         }}
//       >
//         <CartesianGrid vertical={false} />
//         <XAxis
//           dataKey="label"
//           tickLine={false}
//           axisLine={false}
//           tickMargin={8}
//           angle={-45}
//           textAnchor="end"
//           tickFormatter={(value) => value.slice(0, 10)} // Shorten long labels
//         />
//         <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//         <Line
//           dataKey="count"
//           type="natural"
//           stroke="var(--color-count)"
//           strokeWidth={2}
//           dot={false}
//         />
//       </LineChart>
//     </ChartContainer>
//   );
// };

// export { DoctorTypeAndSpecialtyLineChart, NurseTypeAndSpecialtyLineChart };

import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// DoctorTypeAndSpecialtyLineChart Component
const DoctorTypeAndSpecialtyLineChart = ({ data, view }) => {
  // Aggregate data based on view (specialties or types)
  const aggregateData = () => {
    const aggregated = {};
    data.forEach((doctor) => {
      const key = view === "specialties" ? doctor.specialty?.toLowerCase() : doctor.type?.toLowerCase();
      if (key) {
        aggregated[key] = (aggregated[key] || 0) + 1;
      }
    });

    // Convert to array of objects for recharts
    return Object.keys(aggregated)
      .sort()
      .map((key, index) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize for display
        count: aggregated[key],
        index,
      }));
  };

  const chartData = aggregateData();

  // Chart configuration
  const chartConfig = {
    count: {
      label: "Count",
      color: "#4338CA", // Indigo-600
    },
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <p className="font-medium text-indigo-900">{label}</p>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-gray-600">Count:</span>
            <span className="font-medium">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="label"
          tick={{ fill: '#4B5563' }}
          axisLine={{ stroke: '#d1d5db' }}
          tickMargin={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fill: '#4B5563' }} 
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          content={customTooltip}
          cursor={{ stroke: '#818CF8', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Legend 
          iconType="circle"
          wrapperStyle={{ paddingTop: '10px' }}
        />
        <Line
          name="Count"
          dataKey="count"
          type="monotone"
          stroke="#4338CA" // Indigo-600
          strokeWidth={2}
          dot={{ fill: '#4338CA', r: 5 }} // Indigo-600
          activeDot={{ r: 7, stroke: '#312E81', strokeWidth: 2 }} // Indigo-800
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// NurseTypeAndSpecialtyLineChart Component
const NurseTypeAndSpecialtyLineChart = ({ data, view }) => {
  // Aggregate data based on view (specialties or types)
  const aggregateData = () => {
    const aggregated = {};
    data.forEach((nurse) => {
      const key = view === "specialties" ? nurse.specialty?.toLowerCase() : nurse.type?.toLowerCase();
      if (key) {
        aggregated[key] = (aggregated[key] || 0) + 1;
      }
    });

    // Convert to array of objects for recharts
    return Object.keys(aggregated)
      .sort()
      .map((key, index) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize for display
        count: aggregated[key],
        index,
      }));
  };

  const chartData = aggregateData();

  // Chart configuration
  const chartConfig = {
    count: {
      label: "Count",
      color: "#6366F1", // Indigo-500
    },
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <p className="font-medium text-indigo-900">{label}</p>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-gray-600">Count:</span>
            <span className="font-medium">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="label"
          tick={{ fill: '#4B5563' }}
          axisLine={{ stroke: '#d1d5db' }}
          tickMargin={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fill: '#4B5563' }} 
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          content={customTooltip}
          cursor={{ stroke: '#818CF8', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Legend 
          iconType="circle"
          wrapperStyle={{ paddingTop: '10px' }}
        />
        <Line
          name="Count"
          dataKey="count"
          type="monotone"
          stroke="#6366F1" // Indigo-500
          strokeWidth={2}
          dot={{ fill: '#6366F1', r: 5 }} // Indigo-500
          activeDot={{ r: 7, stroke: '#4338CA', strokeWidth: 2 }} // Indigo-600
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { DoctorTypeAndSpecialtyLineChart, NurseTypeAndSpecialtyLineChart };