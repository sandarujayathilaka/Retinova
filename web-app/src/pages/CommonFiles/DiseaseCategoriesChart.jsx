
import React, { Component } from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { PatientCategoryChart } from "@/components/shared/barChart";
import { BarChart3 } from "lucide-react";

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

const DiseaseCategoriesChart = ({ data }) => {
  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Disease Categories
        </div>
        <CardDescription className="text-blue-100">Patients Count by Category</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ErrorBoundary>
         
          <div className="h-[500px]">
            <PatientCategoryChart data={data} />
          </div>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default DiseaseCategoriesChart;