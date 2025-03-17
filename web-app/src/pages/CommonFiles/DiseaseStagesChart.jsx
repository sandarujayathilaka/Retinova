// // import React, { Component } from "react";
// // import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// // import { DiseaseStageChart } from "@/components/ui/barChart";
// // import { Activity, ViewIcon } from "lucide-react";

// // class ErrorBoundary extends Component {
// //   state = { hasError: false, error: null };

// //   static getDerivedStateFromError(error) {
// //     return { hasError: true, error };
// //   }

// //   render() {
// //     if (this.state.hasError) {
// //       return (
// //         <div className="text-red-600 p-4">
// //           <p>Something went wrong: {this.state.error?.message || "Unknown error"}</p>
// //           <Button onClick={() => this.setState({ hasError: false, error: null })}>
// //             Retry
// //           </Button>
// //         </div>
// //       );
// //     }
// //     return this.props.children;
// //   }
// // }

// // const DiseaseStagesChart = ({ data }) => {
// //   return (
// //     <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
// //       <CardHeader className="bg-teal-500 text-white py-4">
// //         <div className="text-lg font-semibold flex items-center gap-2">
// //           <ViewIcon className="h-5 w-5" /> Disease Stages
// //         </div>
// //         <CardDescription className="text-teal-100">Patients Count by Stage</CardDescription>
// //       </CardHeader>
// //       <CardContent className="p-6">
// //         <ErrorBoundary>
// //           <DiseaseStageChart data={data} />
// //         </ErrorBoundary>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default DiseaseStagesChart;

// import React, { Component } from "react";
// import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// import { DiseaseStageChart } from "@/components/ui/barChart";
// import { LineChart, TrendingUp } from "lucide-react";

// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
//           <p className="font-medium mb-2">Something went wrong: {this.state.error?.message || "Unknown error"}</p>
//           <button 
//             onClick={() => this.setState({ hasError: false, error: null })}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const DiseaseStagesChart = ({ data }) => {
//   return (
//     <Card className="shadow-lg rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-xl border-none">
//       <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <LineChart className="h-5 w-5" /> Disease Progression Analysis
//         </div>
//         <CardDescription className="text-blue-100">Patients Count by Stage Over Time</CardDescription>
//       </CardHeader>
//       <CardContent className="p-6">
//         <ErrorBoundary>
//           <div className="h-80">
//             <DiseaseStageChart data={data} />
//           </div>
//         </ErrorBoundary>
//       </CardContent>
//     </Card>
//   );
// };

// export default DiseaseStagesChart;

import React, { Component } from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { DiseaseStageChart } from "@/components/shared/barChart";
import { LineChart } from "lucide-react";

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

const DiseaseStagesChart = ({ data }) => {
  return (
    <Card className="rounded-xl overflow-hidden bg-white transition-all duration-300 border-none h-full">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <LineChart className="h-5 w-5" /> Disease Progression Analysis
        </div>
        <CardDescription className="text-blue-100">Patients Count by Stage Over Time</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ErrorBoundary>
          <div className="h-[550px]">
            <DiseaseStageChart data={data} />
          </div>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default DiseaseStagesChart;