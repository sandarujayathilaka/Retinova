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
import { BarChart3, Filter, Calendar, PieChart, ChevronDown } from "lucide-react";

const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};
const getStage = (disease) => {
  const upperCaseDisease = disease?.toUpperCase() || '';
  const normalStages = ['NO_DR', 'NO_AMD', 'NO_GLACOMA', 'NO_RVO'];
  return normalStages.includes(upperCaseDisease) ? 'NORMAL' : upperCaseDisease;
};
export function PatientCategoryChart({ data }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  console.log("bar",data)
  const categoryMapping = {
    'PDR': 'DR',
    'NPDR': 'DR',
    'DRY': 'AMD',
    'WET': 'AMD',
    'EARLY': 'GLAUCOMA',
    'ADVANCED': 'GLAUCOMA',
    'CRVO': 'RVO',
    'BRVO': 'RVO',
    'NO_DR': 'NORMAL',
    'NO_AMD': 'NORMAL',
    'NO_RVO': 'NORMAL',
    'No_GLACOMA': 'NORMAL',
  };
  
  const defaultCategories = ['AMD', 'DR', 'GLAUCOMA', 'RVO', 'NORMAL'];
  
  // Color scheme to match the dashboard
  const categoryColors = {
    'AMD': '#1E3A8A',
    'DR': '#3730A3',
    'GLAUCOMA': '#4338CA',
    'RVO': '#4F46E5',
    'NORMAL': '#6366F1'
  };
  
  const getCategory = (condition) => {
    const mappedCategory = categoryMapping[condition?.toUpperCase()] || 'Others';
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

  const transformedData = transformData(filteredData, selectedYear, defaultCategories);

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
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          
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

          <Select onValueChange={handleCategoryChange} value={selectedCategories.join(", ")}>
            <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
      </div>

      <div className="p-4 flex-grow">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            {transformedData.every(item => defaultCategories.every(cat => item[cat] === 0)) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No records to show</span>
                </div>
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <YAxis tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '10px' }} 
                />
                {defaultCategories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={category}
                    fill={categoryColors[category] || `#4F46E5`}
                    radius={4}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {totals.overall > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
          <div className="font-semibold text-indigo-900 text-sm text-center mb-2">Total: {totals.overall} </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {defaultCategories.map((category) => (
              totals[category] > 0 && (
                <div key={category} className="flex items-center bg-white px-2 py-1 rounded-full">
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: categoryColors[category] || '#4F46E5' }}
                  />
                  <span className="text-gray-700">{category}: {totals[category]}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
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

export function DiseaseStageChart({ data }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStages, setSelectedStages] = useState(["all"]);
  
  const defaultStages = ['PDR', 'NPDR', 'EARLY', 'ADVANCED', 'DRY', 'WET', 'CRVO', 'BRVO', 'NORMAL'];

  // Color scheme to match the dashboard
  const stageColors = {
    'PDR': '#1E3A8A',
    'NPDR': '#3730A3',
    'EARLY': '#4338CA',
    'ADVANCED': '#4F46E5', 
    'DRY': '#6366F1',
    'WET': '#818CF8',
    'CRVO': '#4F46E5',
    'BRVO': '#6366F1',
    'NORMAL': '#A5B4FC'
  };

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

  // Function to map disease stages to NORMAL or keep the original stage
  const getStage = (disease) => {
    const upperCaseDisease = disease?.toUpperCase() || '';
    const normalStages = ['NO_DR', 'NO_AMD', 'NO_GLACOMA', 'NO_RVO'];
    return normalStages.includes(upperCaseDisease) ? 'NORMAL' : upperCaseDisease;
  };

  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryMonth = entryDate.toLocaleString("en-US", { month: "long" });
    const entryYear = entryDate.getFullYear().toString();
    const stage = getStage(entry.disease);

    const isMonthMatch = selectedMonth && selectedMonth !== "all" ? entryMonth === selectedMonth : true;
    const isYearMatch = entryYear === selectedYear;
    const isStageMatch = selectedStages.includes("all")
      ? true
      : stage && selectedStages.includes(stage);

    return isMonthMatch && isYearMatch && isStageMatch;
  });

  const transformedData = transformDataStage(filteredData, selectedYear, defaultStages);

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
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          
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

          <Select onValueChange={handleStageChange} value={selectedStages.join(", ")}>
            <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
      </div>

      <div className="p-4 flex-grow">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            {transformedData.every(item => defaultStages.every(stage => item[stage] === 0)) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No records to show</span>
                </div>
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <YAxis tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                {defaultStages.map((stage) => (
                  <Bar
                    key={stage}
                    dataKey={stage}
                    name={stage}
                    fill={stageColors[stage] || '#4F46E5'}
                    radius={4}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {totals.overall > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
          <div className="font-semibold text-indigo-900 text-sm text-center mb-2">Total: {totals.overall}</div>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {defaultStages.map((stage) => (
              totals[stage] > 0 && (
                <div key={stage} className="flex items-center bg-white px-2 py-1 rounded-full">
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: stageColors[stage] || '#4F46E5' }}
                  />
                  <span className="text-gray-700">{stage}: {totals[stage]}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function transformDataStage(rawData, selectedYear, stageOptions) {
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
    const stage = getStage(entry.disease); // Use the getStage function
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
  
  // Updated colors to match dashboard theme
  const patientTypeColors = {
    "New Patients": "#3B82F6",
    "Existing Patients": "#4338CA"
  };

  const filteredData = data.map((item) => item);

  const transformedData = transformPatientStatusData(filteredData, selectedYear, selectedMonth);

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
        <div className="bg-white p-3 border rounded-lg">
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center gap-2 text-sm">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              ></span>
              <span className="text-gray-800">{`${entry.name}: ${entry.value}`}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" /> Time Period:
          </div>
          
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
      
      <div className="p-4 flex-grow">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            {transformedData.every(item => item["New Patients"] === 0 && item["Existing Patients"] === 0) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No records to show</span>
                </div>
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <YAxis tick={{ fill: '#4B5563' }} axisLine={{ stroke: '#d1d5db' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar 
                  dataKey="New Patients" 
                  fill={patientTypeColors["New Patients"]} 
                  name="New Patients" 
                  radius={4} 
                />
                <Bar 
                  dataKey="Existing Patients" 
                  fill={patientTypeColors["Existing Patients"]} 
                  name="Existing Patients" 
                  radius={4} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {totals.overall > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
          <div className="font-semibold text-indigo-900 text-sm text-center mb-2">Total: {totals.overall} patients</div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center bg-white px-2 py-1 rounded-full ">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: patientTypeColors["New Patients"] }}
              />
              <span className="text-gray-700">New Patients: {totals["New Patients"]}</span>
            </div>
            <div className="flex items-center bg-white px-2 py-1 rounded-full">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: patientTypeColors["Existing Patients"] }}
              />
              <span className="text-gray-700">Existing Patients: {totals["Existing Patients"]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
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


export function DoctorTypeAndSpecialtyBarChart({ data, view = "types" }) {
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
    "oculoplastic surgeon",
    "ocular oncologist",
    "contact lens specialist",
  ];
  
  const types = ["full time", "part time"];

  // Colors for types and specialties using blue-indigo theme
  const typeColors = {
    "full time": "#1E40AF", // blue-800
    "part time": "#4338CA", // indigo-700
  };

  const specialtyColors = [
    "#1E3A8A", // blue-900
    "#3730A3", // indigo-800
    "#4338CA", // indigo-700
    "#4F46E5", // indigo-600
    "#6366F1", // indigo-500
    "#818CF8", // indigo-400
    "#3B82F6", // blue-500
    "#60A5FA", // blue-400
  ];

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

  const transformedData = transformDoctorData(filteredData, selectedYear, view);

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

  // Custom tooltip for better presentation
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <p className="font-medium text-indigo-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <div className="bg-gray-50 p-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          
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

          {view === "types" && (
            <Select onValueChange={setSelectedType} value={selectedType}>
              <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
              <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
      </div>

      <CardContent className="p-4 flex-grow">
        {/* Increased height from 350px to 450px */}
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {transformedData.every(item =>
              view === "types" ? (item["full time"] === 0 && item["part time"] === 0) :
              specialties.every(specialty => item[specialty] === 0)
            ) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No data available</span>
                </div>
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#4B5563' }} 
                  axisLine={{ stroke: '#d1d5db' }} 
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }} 
                  axisLine={{ stroke: '#d1d5db' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Legend component removed */}
                {view === "types" ? (
                  <>
                    <Bar 
                      dataKey="full time" 
                      fill={typeColors["full time"]} 
                      name="Full Time" 
                      radius={4} 
                    />
                    <Bar 
                      dataKey="part time" 
                      fill={typeColors["part time"]} 
                      name="Part Time" 
                      radius={4} 
                    />
                  </>
                ) : (
                  specialties.map((specialty, index) => (
                    <Bar
                      key={specialty}
                      dataKey={specialty}
                      fill={specialtyColors[index % specialtyColors.length]}
                      name={specialty.charAt(0).toUpperCase() + specialty.slice(1)}
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
        <CardFooter className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          {/* Simplified footer to only show total count */}
          <div className="font-semibold text-indigo-900">Total: {totals.overall} doctors</div>
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


export function NurseTypeAndSpecialtyBarChart({ data, view = "types" }) {
  const months = getMonths();
  const years = getYears();
  const currentYear = new Date().getFullYear().toString();
console.log("bar",data)
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const specialties = [
    "ophthalmic nurse",
    "ophthalmic surgical nurse",
    "ophthalmic nurse practitioner",
    "retina nurse",
    "glaucoma nurse",
    "pediatric ophthalmic nurse",
    "cornea & external disease nurse",
    "oculoplastic nurse",
    "ophthalmic oncology nurse",
    "low vision rehabilitation nurse",
  ];
  
  const types = ["full time", "part time"];

  // Colors for types and specialties using blue-indigo theme with slight variation from doctors
  const typeColors = {
    "full time": "#3730A3", // indigo-800
    "part time": "#4F46E5", // indigo-600
  };

  const specialtyColors = [
    "#3730A3", // indigo-800
    "#4338CA", // indigo-700
    "#4F46E5", // indigo-600
    "#6366F1", // indigo-500
    "#818CF8", // indigo-400
    "#1E3A8A", // blue-900
    "#1E40AF", // blue-800
    "#2563EB", // blue-600
  ];

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

  const transformedData = transformNurseData(filteredData, selectedYear, view);

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

  // Custom tooltip for better presentation
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <p className="font-medium text-indigo-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <div className="bg-gray-50 p-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          
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

          {view === "types" && (
            <Select onValueChange={setSelectedType} value={selectedType}>
              <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
              <SelectTrigger className="w-40 bg-white border-gray-200 text-sm text-indigo-900">
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
      </div>

      <CardContent className="p-4 flex-grow">
        {/* Increased height from 350px to 450px */}
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {transformedData.every(item =>
              view === "types" ? (item["full time"] === 0 && item["part time"] === 0) :
              specialties.every(specialty => item[specialty] === 0)
            ) ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
                  <span className="text-gray-500">No data available</span>
                </div>
              </div>
            ) : (
              <BarChart data={transformedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#4B5563' }} 
                  axisLine={{ stroke: '#d1d5db' }} 
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }} 
                  axisLine={{ stroke: '#d1d5db' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Legend removed */}
                {view === "types" ? (
                  <>
                    <Bar 
                      dataKey="full time" 
                      fill={typeColors["full time"]} 
                      name="Full Time" 
                      radius={4} 
                    />
                    <Bar 
                      dataKey="part time" 
                      fill={typeColors["part time"]} 
                      name="Part Time" 
                      radius={4} 
                    />
                  </>
                ) : (
                  specialties.map((specialty, index) => (
                    <Bar
                      key={specialty}
                      dataKey={specialty}
                      fill={specialtyColors[index % specialtyColors.length]}
                      name={specialty.charAt(0).toUpperCase() + specialty.slice(1)}
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
        <CardFooter className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          {/* Simplified footer to only show total count */}
          <div className="font-semibold text-indigo-900">Total: {totals.overall} nurses</div>
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
        "ophthalmic nurse",
        "ophthalmic surgical nurse",
        "ophthalmic nurse practitioner",
        "retina nurse",
        "glaucoma nurse",
        "pediatric ophthalmic nurse",
        "cornea & external disease nurse",
        "oculoplastic nurse",
        "ophthalmic oncology nurse",
        "low vision rehabilitation nurse",
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