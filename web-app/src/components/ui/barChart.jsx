import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};

export function PatientCategoryChart({ data }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  
  const categoryMapping = {
    'PDR': 'DR',
    'NPDR': 'DR',
    'DRY': 'AMD',
    'WET': 'AMD',
    'EARLY': 'GLAUCOMA',
    'ADVANCED': 'GLAUCOMA',
    'CRVO': 'RVO',
    'BRVO': 'RVO',
    'NO_DR': 'NORMAL', // Changed to uppercase
    'NORMAL': 'NORMAL',
  };
  
  const defaultCategories = ['AMD', 'DR', 'GLAUCOMA', 'RVO', 'NORMAL'];
  
  const getCategory = (condition) => {
    const mappedCategory = categoryMapping[condition?.toUpperCase()] || 'Others';
    console.log(`Mapping '${condition}' to '${mappedCategory}'`); // Debug log
    return mappedCategory;
  };

  const handleCategoryChange = (value) => {
    if (value === "all") {
      setSelectedCategories(["all"]);
    } else {
      const updatedSelection = selectedCategories.includes("all")
        ? [value]
        : selectedCategories.includes(value)
        ? selectedCategories.filter((d) => d !== value)
        : [...selectedCategories, value];
      setSelectedCategories(updatedSelection.length > 0 ? updatedSelection : ["all"]);
    }
  };

  console.log("PatientCategoryChart Raw Data:", data);

  const filteredData = data.map(entry => ({
    ...entry,
    category: getCategory(entry.stage),
  })).filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryMonth = entryDate.toLocaleString("en-US", { month: "long" });
    const entryYear = entryDate.getFullYear().toString();

    const isMonthMatch = selectedMonth && selectedMonth !== "all" ? entryMonth === selectedMonth : true;
    const isYearMatch = entryYear === selectedYear;
    const isCategoryMatch = selectedCategories.includes("all")
      ? true
      : selectedCategories.includes(entry.category);

    return isMonthMatch && isYearMatch && isCategoryMatch;
  });

  console.log("Filtered Data:", filteredData);

  const transformedData = transformData(filteredData, selectedYear, defaultCategories);

  console.log("Transformed Data:", transformedData);

  const totals = transformedData.reduce(
    (acc, item) => {
      defaultCategories.forEach((category) => {
        acc[category] = (acc[category] || 0) + (item[category] || 0);
      });
      acc.overall += defaultCategories.reduce((sum, category) => sum + (item[category] || 0), 0);
      return acc;
    },
    { overall: 0 }
  );

  return (
    <Card>
      <CardHeader className="relative overflow-hidden flex flex-col sm:flex-row items-start justify-end gap-2">
        <div className="flex flex-wrap gap-4">
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleCategoryChange} value={selectedCategories.join(", ")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories">
                {selectedCategories.includes("all") ? "All Categories" : selectedCategories.join(", ")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <Checkbox checked={selectedCategories.includes("all")} className="mr-2" />
                  All Categories
                </div>
              </SelectItem>
              {defaultCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center">
                    <Checkbox checked={selectedCategories.includes(category)} className="mr-2" />
                    {category}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            {transformedData.every(item => defaultCategories.every(cat => item[cat] === 0)) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {defaultCategories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={category}
                    fill={`hsl(var(--chart-${index + 1}))`}
                    radius={4}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      {totals.overall > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="font-semibold">Overall Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-4">
            {defaultCategories.map((category, index) => (
              <div key={category} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: `hsl(var(--chart-${index + 1}))` }}
                />
                <span>{category}: {totals[category]}</span>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function transformData(rawData, selectedYear, categories) {
  const months = getMonths();
  const groupedData = {};

  months.forEach((month) => {
    groupedData[month] = { month, year: selectedYear };
    categories.forEach((category) => {
      groupedData[month][category] = 0;
    });
  });

  rawData.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const month = entryDate.toLocaleString("en-US", { month: "long" });
    const category = entry.category;
    const value = entry.value || 0;

    if (groupedData[month] && categories.includes(category)) {
      groupedData[month][category] += value;
    }
  });

  return Object.values(groupedData);
}
const getCurrentMonthAndYear = () => {
  const now = new Date();
  return {
    month: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear().toString()
  };
};
export function DiseaseStageChart({ data }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStages, setSelectedStages] = useState(["all"]);
  
  // Added 'NORMAL' to defaultStages
  const defaultStages = ['PDR', 'NPDR', 'EARLY', 'ADVANCED', 'DRY', 'WET', 'CRVO', 'BRVO', 'NORMAL'];

  const handleStageChange = (value) => {
    if (value === "all") {
      setSelectedStages(["all"]);
    } else {
      const updatedSelection = selectedStages.includes("all")
        ? [value]
        : selectedStages.includes(value)
        ? selectedStages.filter((s) => s !== value)
        : [...selectedStages, value];
      setSelectedStages(updatedSelection.length > 0 ? updatedSelection : ["all"]);
    }
  };

  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryMonth = entryDate.toLocaleString("en-US", { month: "long" });
    const entryYear = entryDate.getFullYear().toString();
    // Map 'No_DR' to 'NORMAL' if present, handle case-insensitivity
    const stage = entry.disease ? (entry.disease.toUpperCase() === 'NO_DR' ? 'NORMAL' : entry.disease.toUpperCase()) : '';

    const isMonthMatch = selectedMonth && selectedMonth !== "all" ? entryMonth === selectedMonth : true;
    const isYearMatch = entryYear === selectedYear;
    const isStageMatch = selectedStages.includes("all")
      ? true
      : stage && selectedStages.includes(stage);

    return isMonthMatch && isYearMatch && isStageMatch;
  });

  console.log("Filtered Data (DiseaseStageChart):", filteredData); // Debug log

  const transformedData = transformDataSatage(filteredData, selectedYear, defaultStages);

  console.log("Transformed Data (DiseaseStageChart):", transformedData); // Debug log

  const totals = transformedData.reduce(
    (acc, item) => {
      defaultStages.forEach((stage) => {
        acc[stage] = (acc[stage] || 0) + (item[stage] || 0);
      });
      acc.overall += defaultStages.reduce((sum, stage) => sum + (item[stage] || 0), 0);
      return acc;
    },
    { overall: 0 }
  );

  return (
    <Card>
      <CardHeader className="relative overflow-hidden flex flex-col sm:flex-row items-start justify-end gap-2">
        <div className="flex flex-wrap gap-4">
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleStageChange} value={selectedStages.join(", ")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Stages">
                {selectedStages.includes("all") ? "All Stages" : selectedStages.join(", ")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <Checkbox checked={selectedStages.includes("all")} className="mr-2" />
                  All Stages
                </div>
              </SelectItem>
              {defaultStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  <div className="flex items-center">
                    <Checkbox checked={selectedStages.includes(stage)} className="mr-2" />
                    {stage}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            {transformedData.every(item => defaultStages.every(stage => item[stage] === 0)) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {defaultStages.map((stage, index) => (
                  <Bar
                    key={stage}
                    dataKey={stage}
                    name={stage}
                    fill={["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8]}
                    radius={4}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      {totals.overall > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="font-semibold">Overall Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-4">
            {defaultStages.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8] }}
                />
                <span>{stage}: {totals[stage]}</span>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function transformDataSatage(rawData, selectedYear, stageOptions) {
  const months = getMonths();
  const groupedData = {};

  months.forEach((month) => {
    groupedData[month] = { month, year: selectedYear };
    stageOptions.forEach((stage) => {
      groupedData[month][stage] = 0;
    });
  });

  rawData.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const month = entryDate.toLocaleString("en-US", { month: "long" });
    // Map 'No_DR' to 'NORMAL' if present
    const stage = entry.disease ? (entry.disease.toUpperCase() === 'NO_DR' ? 'NORMAL' : entry.disease.toUpperCase()) : '';
    const value = entry.value || 0;

    if (groupedData[month] && stageOptions.includes(stage)) {
      groupedData[month][stage] += value;
    }
  });

  return Object.values(groupedData);
}
export function PatientsStatusBarChart({ data }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(""); // Empty means all months
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const filteredData = data
    .map((item) => {
      if (!dateRange.from || !dateRange.to) return item;

      const fromDate = new Date(dateRange.from).setHours(0, 0, 0, 0);
      const toDate = new Date(dateRange.to).setHours(23, 59, 59, 999);

      if (item.dates) {
        const validDates = item.dates.filter((dateStr) => {
          const itemDate = new Date(dateStr).setHours(0, 0, 0, 0);
          return itemDate >= fromDate && itemDate <= toDate;
        });
        return validDates.length > 0 ? { ...item, value: validDates.length } : null;
      }
      return item;
    })
    .filter((item) => item !== null);

  const chartData = dateRange.from && dateRange.to ? filteredData : data;

  const transformedData = transformPatientStatusData(chartData, selectedYear, selectedMonth);

  const totals = transformedData.reduce(
    (acc, item) => {
      acc["New Patients"] += item["New Patients"] || 0;
      acc["Existing Patients"] += item["Existing Patients"] || 0;
      acc.overall += (item["New Patients"] || 0) + (item["Existing Patients"] || 0);
      return acc;
    },
    { "New Patients": 0, "Existing Patients": 0, overall: 0 }
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill }}>{`${entry.name}: ${entry.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="relative overflow-hidden flex flex-col sm:flex-row items-start justify-end gap-2">
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
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            {transformedData.every(item => item["New Patients"] === 0 && item["Existing Patients"] === 0) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="New Patients" fill="#3B82F6" name="New Patients" radius={4} />
                <Bar dataKey="Existing Patients" fill="#FBBF24" name="Existing Patients" radius={4} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      {totals.overall > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="font-semibold">Overall Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
              <span>New Patients: {totals["New Patients"]}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#FBBF24" }} />
              <span>Existing Patients: {totals["Existing Patients"]}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function transformPatientStatusData(rawData, selectedYear, selectedMonth) {
  const months = selectedMonth && selectedMonth !== "all" ? [selectedMonth] : getMonths();
  const groupedData = {};

  months.forEach((month) => {
    groupedData[month] = { month, "New Patients": 0, "Existing Patients": 0 };
  });

  rawData.forEach((entry) => {
    entry.dates.forEach((dateStr) => {
      const entryDate = new Date(dateStr);
      const month = entryDate.toLocaleString("en-US", { month: "long" });
      const year = entryDate.getFullYear().toString();

      if (year === selectedYear && groupedData[month]) {
        groupedData[month][entry.name] += 1;
      }
    });
  });

  return Object.values(groupedData);
}

export function DoctorTypeAndSpecialtyBarChart({ data, view = "types" }) { // Add view prop
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const specialties = [
    "ophthalmologist",
    "optometrist",
    "retina specialist",
    "cornea specialist",
    "glaucoma specialist",
    "pediatric ophthalmologist",
    "neuro-ophthalmologist",
    "oculoplasticklore surgeon",
    "ocular oncologist",
    "contact lens specialist",
  ];
  const types = ["full time", "part time"];

  // Filter the data based on selections
  const filteredData = data.filter((doc) => {
    const docDate = new Date(doc.createdAt);
    const docMonth = docDate.toLocaleString("en-US", { month: "long" });
    const docYear = docDate.getFullYear().toString();
    const docType = doc.type ? doc.type.toLowerCase() : "";
    const docSpecialty = doc.specialty ? doc.specialty.toLowerCase() : "";

    const isMonthMatch = selectedMonth === "all" ? true : docMonth === selectedMonth;
    const isYearMatch = docYear === selectedYear;
    const isTypeMatch = selectedType === "all" ? true : docType === selectedType;
    const isSpecialtyMatch = selectedSpecialty === "all" ? true : specialties.includes(docSpecialty) && docSpecialty === selectedSpecialty;

    return isMonthMatch && isYearMatch && isTypeMatch && isSpecialtyMatch;
  });

  // Debug the filtered data
  useEffect(() => {
    console.log("Raw Data:", data);
    console.log("Filtered Data:", filteredData);
    console.log("Selected Filters:", { selectedMonth, selectedYear, selectedType, selectedSpecialty });
  }, [data, selectedMonth, selectedYear, selectedType, selectedSpecialty, filteredData]);

  const transformedData = transformDoctorData(filteredData, selectedYear, view);

  // Debug the transformed data
  console.log("Transformed Data:", transformedData);

  const totals = transformedData.reduce(
    (acc, item) => {
      if (view === "types") {
        acc["full time"] += item["full time"] || 0;
        acc["part time"] += item["part time"] || 0;
        acc.overall += (item["full time"] || 0) + (item["part time"] || 0);
      } else {
        specialties.forEach((specialty) => {
          acc[specialty] = (acc[specialty] || 0) + (item[specialty] || 0);
        });
        acc.overall += specialties.reduce((sum, specialty) => sum + (item[specialty] || 0), 0);
      }
      return acc;
    },
    view === "types" ? { "full time": 0, "part time": 0, overall: 0 } : { overall: 0 }
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {view === "types" && (
            <Select onValueChange={setSelectedType} value={selectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {view === "specialties" && (
            <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            {transformedData.every(item =>
              view === "types" ? (item["full time"] === 0 && item["part time"] === 0) :
              specialties.every(specialty => item[specialty] === 0)
            ) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {view === "types" ? (
                  <>
                    <Bar dataKey="full time" fill="#3B82F6" name="Full Time" radius={4} />
                    <Bar dataKey="part time" fill="#FBBF24" name="Part Time" radius={4} />
                  </>
                ) : (
                  specialties.map((specialty, index) => (
                    <Bar
                      key={specialty}
                      dataKey={specialty}
                      fill={["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8]}
                      name={specialty}
                      radius={4}
                    />
                  ))
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      {totals.overall > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="font-semibold">Overall Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-4">
            {view === "types" ? (
              <>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
                  <span>Full Time: {totals["full time"]}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#FBBF24" }} />
                  <span>Part Time: {totals["part time"]}</span>
                </div>
              </>
            ) : (
              specialties.map((specialty, index) => (
                totals[specialty] > 0 && (
                  <div key={specialty} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8] }}
                    />
                    <span>{specialty}: {totals[specialty]}</span>
                  </div>
                )
              ))
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function transformDoctorData(rawData, selectedYear, view) {
  const months = getMonths();
  const groupedData = {};

  // Initialize data structure for all months
  months.forEach((month) => {
    groupedData[month] = { month };
    if (view === "types") {
      groupedData[month]["full time"] = 0;
      groupedData[month]["part time"] = 0;
    } else {
      const specialties = [
        "ophthalmologist",
        "optometrist",
        "retina specialist",
        "cornea specialist",
        "glaucoma specialist",
        "pediatric ophthalmologist",
        "neuro-ophthalmologist",
        "oculoplastic surgeon",
        "ocular oncologist",
        "contact lens specialist",
      ];
      specialties.forEach((specialty) => {
        groupedData[month][specialty] = 0;
      });
    }
  });

  // Aggregate data
  rawData.forEach((doc) => {
    const docDate = new Date(doc.createdAt);
    const month = docDate.toLocaleString("en-US", { month: "long" });
    const year = docDate.getFullYear().toString();
    const type = doc.type ? doc.type.toLowerCase() : "";
    const specialty = doc.specialty ? doc.specialty.toLowerCase() : "";

    if (year === selectedYear && groupedData[month]) {
      if (view === "types" && (type === "full time" || type === "part time")) {
        groupedData[month][type] += 1;
      } else if (view === "specialties" && specialty) {
        groupedData[month][specialty] += 1;
      }
    }
  });

  return Object.values(groupedData);
}



export function NurseTypeAndSpecialtyBarChart({ data, view = "types" }) { // Add view prop
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const specialties = [
    "ophthalmologist",
    "optometrist",
    "retina specialist",
    "cornea specialist",
    "glaucoma specialist",
    "pediatric ophthalmologist",
    "neuro-ophthalmologist",
    "oculoplasticklore surgeon",
    "ocular oncologist",
    "contact lens specialist",
  ];
  const types = ["full time", "part time"];

  // Filter the data based on selections
  const filteredData = data.filter((nurse) => {
    const nurseDate = new Date(nurse.createdAt);
    const nurseMonth = nurseDate.toLocaleString("en-US", { month: "long" });
    const nurseYear = nurseDate.getFullYear().toString();
    const nurseType = nurse.type ? nurse.type.toLowerCase() : "";
    const nurseSpecialty = nurse.specialty ? nurse.specialty.toLowerCase() : "";

    const isMonthMatch = selectedMonth === "all" ? true : nurseMonth === selectedMonth;
    const isYearMatch = nurseYear === selectedYear;
    const isTypeMatch = selectedType === "all" ? true : nurseType === selectedType;
    const isSpecialtyMatch = selectedSpecialty === "all" ? true : specialties.includes(nurseSpecialty) && nurseSpecialty === selectedSpecialty;

    return isMonthMatch && isYearMatch && isTypeMatch && isSpecialtyMatch;
  });

  // Debug the filtered data
  useEffect(() => {
    console.log("Raw Data:", data);
    console.log("Filtered Data:", filteredData);
    console.log("Selected Filters:", { selectedMonth, selectedYear, selectedType, selectedSpecialty });
  }, [data, selectedMonth, selectedYear, selectedType, selectedSpecialty, filteredData]);

  const transformedData = transformNurseData(filteredData, selectedYear, view);

  // Debug the transformed data
  console.log("Transformed Data:", transformedData);

  const totals = transformedData.reduce(
    (acc, item) => {
      if (view === "types") {
        acc["full time"] += item["full time"] || 0;
        acc["part time"] += item["part time"] || 0;
        acc.overall += (item["full time"] || 0) + (item["part time"] || 0);
      } else {
        specialties.forEach((specialty) => {
          acc[specialty] = (acc[specialty] || 0) + (item[specialty] || 0);
        });
        acc.overall += specialties.reduce((sum, specialty) => sum + (item[specialty] || 0), 0);
      }
      return acc;
    },
    view === "types" ? { "full time": 0, "part time": 0, overall: 0 } : { overall: 0 }
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {view === "types" && (
            <Select onValueChange={setSelectedType} value={selectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {view === "specialties" && (
            <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            {transformedData.every(item =>
              view === "types" ? (item["full time"] === 0 && item["part time"] === 0) :
              specialties.every(specialty => item[specialty] === 0)
            ) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
                No records to show.
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {view === "types" ? (
                  <>
                    <Bar dataKey="full time" fill="#3B82F6" name="Full Time" radius={4} />
                    <Bar dataKey="part time" fill="#FBBF24" name="Part Time" radius={4} />
                  </>
                ) : (
                  specialties.map((specialty, index) => (
                    <Bar
                      key={specialty}
                      dataKey={specialty}
                      fill={["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8]}
                      name={specialty}
                      radius={4}
                    />
                  ))
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      {totals.overall > 0 && (
        <CardFooter className="flex flex-col items-center gap-2 text-sm mt-4">
          <div className="font-semibold">Overall Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-4">
            {view === "types" ? (
              <>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
                  <span>Full Time: {totals["full time"]}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#FBBF24" }} />
                  <span>Part Time: {totals["part time"]}</span>
                </div>
              </>
            ) : (
              specialties.map((specialty, index) => (
                totals[specialty] > 0 && (
                  <div key={specialty} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#FBBF24", "#EC4899", "#14B8A6"][index % 8] }}
                    />
                    <span>{specialty}: {totals[specialty]}</span>
                  </div>
                )
              ))
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function transformNurseData(rawData, selectedYear, view) {
  const months = getMonths();
  const groupedData = {};

  // Initialize data structure for all months
  months.forEach((month) => {
    groupedData[month] = { month };
    if (view === "types") {
      groupedData[month]["full time"] = 0;
      groupedData[month]["part time"] = 0;
    } else {
      const specialties = [
        "ophthalmologist",
        "optometrist",
        "retina specialist",
        "cornea specialist",
        "glaucoma specialist",
        "pediatric ophthalmologist",
        "neuro-ophthalmologist",
        "oculoplastic surgeon",
        "ocular oncologist",
        "contact lens specialist",
      ];
      specialties.forEach((specialty) => {
        groupedData[month][specialty] = 0;
      });
    }
  });

  // Aggregate data
  rawData.forEach((nurse) => {
    const nurseDate = new Date(nurse.createdAt);
    const month = nurseDate.toLocaleString("en-US", { month: "long" });
    const year = nurseDate.getFullYear().toString();
    const type = nurse.type ? nurse.type.toLowerCase() : "";
    const specialty = nurse.specialty ? nurse.specialty.toLowerCase() : "";

    if (year === selectedYear && groupedData[month]) {
      if (view === "types" && (type === "full time" || type === "part time")) {
        groupedData[month][type] += 1;
      } else if (view === "specialties" && specialty) {
        groupedData[month][specialty] += 1;
      }
    }
  });

  return Object.values(groupedData);
}
// export function DiseaseStageChart({ data }) {
//   const months = getMonths();
//   const years = getYears();
//   const currentYear = new Date().getFullYear().toString();
//   const [selectedMonth, setSelectedMonth] = useState(""); // Empty means all months
//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedStages, setSelectedStages] = useState([]); // Store multiple selected stages
//   const stageOptions = ["DRY", "WET", "CRVO", "BRVO", "PDR", "NPDR", "EARLY", "ADVANCED"];

//   // Function to handle multi-select stage change
//   const handleStageChange = (value) => {
//     setSelectedStages(value);
//   };

//   // Apply filters
//   const filteredData = data.filter((entry) => {
//     const entryDate = new Date(entry.date);
//     const entryMonth = entryDate.toLocaleString("en-US", { month: "long" });
//     const entryYear = entryDate.getFullYear().toString();

//     const isMonthMatch = selectedMonth && selectedMonth !== "all" ? entryMonth === selectedMonth : true;
//     const isYearMatch = entryYear === selectedYear; // Always match selected year
//     const isStageMatch = selectedStages.length > 0 ? selectedStages.includes(entry.stage) : true;

//     return isMonthMatch && isYearMatch && isStageMatch;
//   });

//   // Transform filtered data
//   const transformedData = transformDataStage(filteredData, selectedYear);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Disease Stages</CardTitle>
//         <CardDescription>Data Based on Records</CardDescription>
//         <div className="flex flex-wrap gap-4 mt-4">
//           <Select onValueChange={setSelectedMonth} value={selectedMonth}>
//             <SelectTrigger className="w-40"><SelectValue placeholder="Select Month (All by default)" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Months</SelectItem>
//               {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
//             </SelectContent>
//           </Select>

//           <Select onValueChange={setSelectedYear} value={selectedYear}>
//             <SelectTrigger className="w-40"><SelectValue placeholder="Select Year" /></SelectTrigger>
//             <SelectContent>{years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent>
//           </Select>

//           {/* Multi-Select for Stages */}
//           <Select onValueChange={handleStageChange} value={selectedStages} multiple>
//             <SelectTrigger className="w-40"><SelectValue placeholder="Select Stages" /></SelectTrigger>
//             <SelectContent>
//               {stageOptions.map((stage) => (
//                 <SelectItem key={stage} value={stage}>{stage}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer>
//           <BarChart data={transformedData} width={500} height={300}>
//             <CartesianGrid vertical={false} strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             {stageOptions.map(stage => (
//               <Bar key={stage} dataKey={stage} name={stage} fill={`hsl(var(--chart-${stageOptions.indexOf(stage) + 1}))`} radius={4} />
//             ))}
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
