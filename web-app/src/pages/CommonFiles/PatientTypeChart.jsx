
import React, { Component } from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { PatientsStatusBarChart } from "@/components/shared/barChart";
import { PieChart, UserPlus, UserCheck } from "lucide-react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium mb-2">Something went wrong: {this.state.error?.message || "Unknown error"}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PatientTypeChart = ({ data }) => {
  // Calculate total values for legend
  const totalValues = data.reduce((acc, item) => {
    acc.total += item.value;
    if (item.name.toLowerCase().includes("new")) {
      acc.new += item.value;
    } else {
      acc.existing += item.value;
    }
    return acc;
  }, { total: 0, new: 0, existing: 0 });

  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5" /> Patient Distribution
        </div>
        <CardDescription className="text-blue-100">New vs Existing Patients</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
     
          
          <ErrorBoundary>
            <div className="h-[500px]">
              <PatientsStatusBarChart data={data} />
            </div>
          </ErrorBoundary>
         
        
      </CardContent>
    </Card>
  );
};

export default PatientTypeChart;