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

const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};

export function PieChartComponent({ data, config, title, description, showDatePicker = true, doctorsData }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState("all"); // Default to "all" for all months
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    console.log("Pie Chart Received Data:", data);
  }, [data]);

  const filteredData = data.map((item) => {
    if (!item.dates) {
      // For cases like "Doctors Status" where no dates array exists, return the item as is
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
    percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(2) + "%" : "0%",
  }));

  console.log("Filtered Data:", filteredData);
  console.log("Aggregated Data:", aggregatedData);
  console.log("Data with Percentage:", dataWithPercentage);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p>{`${name}: ${value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{description}</CardDescription>
        </div>
        {showDatePicker && (
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={setSelectedMonth} value={selectedMonth}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Select Year" /></SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center pb-0 gap-4">
        <div className="w-full h-[310px]">
          <ResponsiveContainer width="100%" height="100%">
            {dataWithPercentage.length === 0 || totalValue === 0 ? (
              <div className="flex items-center justify-center h-60 w-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={dataWithPercentage}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="40%"
                  outerRadius="70%"
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              Total
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-foreground text-lg"
                            >
                              {totalValue}
                            </tspan>
                          </text>
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
          <div className="w-full max-h-[120px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorsData
                  .sort((a, b) => b.status - a.status)
                  .map((doctor, index) => (
                    <TableRow key={index}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.type}</TableCell>
                      <TableCell>{doctor.status ? "Online" : "Offline"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {dataWithPercentage.length > 0 && totalValue > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="flex flex-wrap justify-center gap-2 text-sm sm:text-base">
            {dataWithPercentage.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: item.fill }}
                />
                <span>
                  {item.name}: {item.value} ({item.percentage})
                </span>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}