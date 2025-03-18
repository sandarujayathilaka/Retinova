import React from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import { LiaUserNurseSolid } from "react-icons/lia";

const NurseSpecialtiesLineChart = ({ nurses, nurseChartView, setNurseChartView }) => {
  const title = nurseChartView === "specialties" ? "Nurse Specialties Trend" : "Nurse Types Trend";
  const description = nurseChartView === "specialties" ? "Distribution Analysis" : "Full-time vs Part-time Analysis";

  // Aggregate data based on view (specialties or types)
  const aggregateData = () => {
    const aggregated = {};
    nurses.forEach((nurse) => {
      const key = nurseChartView === "specialties" ? nurse.specialty?.toLowerCase() : nurse.type?.toLowerCase();
      if (key) {
        aggregated[key] = (aggregated[key] || 0) + 1;
      }
    });

    return Object.keys(aggregated)
      .sort()
      .map((key, index) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        count: aggregated[key],
        index,
      }));
  };

  const chartData = aggregateData();

  const chartConfig = {
    count: {
      label: "Count",
      color: "#4338CA",
    },
  };

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LineChartIcon className="h-5 w-5" /> {title}
        </div>
        <CardDescription className="text-blue-100">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            {nurseChartView === "specialties" ? 
              <BarChart3 className="h-4 w-4" /> : 
              <LineChartIcon className="h-4 w-4" />} 
            Analysis:
          </div>
          <Select value={nurseChartView} onValueChange={setNurseChartView}>
            <SelectTrigger className="w-[180px] bg-white text-indigo-800 border-indigo-100">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specialties">Specialties</SelectItem>
              <SelectItem value="types">Types</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-grow min-h-[300px] relative">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <LiaUserNurseSolid className="h-10 w-10 text-gray-300" />
                <span className="text-gray-500">No data available</span>
              </div>
            </div>
          ) : (
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
                  interval={0}
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }} 
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`${value} nurses`, name === "count" ? "Count" : name]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line
                  name="Count"
                  dataKey="count"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ fill: '#6366F1', r: 5 }}
                  activeDot={{ r: 7, stroke: '#4338CA', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {chartData.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
            Total: {nurses.length} nurses across {chartData.length} {nurseChartView === "specialties" ? "specialties" : "types"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NurseSpecialtiesLineChart;