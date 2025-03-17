// // import React, { Component } from "react";
// // import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// // import { PatientsStatusBarChart } from "@/components/ui/barChart";
// // import { User2,PersonStandingIcon } from "lucide-react";

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

// // const PatientTypeChart = ({ data }) => {
// //   return (
// //     <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-xl">
// //       <CardHeader className="bg-teal-500 text-white py-4">
// //         <div className="text-lg font-semibold flex items-center gap-2">
// //           <PersonStandingIcon className="h-5 w-5" /> Patient Type
// //         </div>
// //         <CardDescription className="text-teal-100">New vs Existing Patients</CardDescription>
// //       </CardHeader>
// //       <CardContent className="p-6">
// //         <ErrorBoundary>
// //           <PatientsStatusBarChart data={data} />
// //         </ErrorBoundary>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default PatientTypeChart;

// import React, { Component } from "react";
// import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
// import { PatientsStatusBarChart } from "@/components/ui/barChart";
// import { PieChart, Users, UserPlus, UserCheck } from "lucide-react";

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

// const PatientTypeChart = ({ data }) => {
//   // Calculate total values for legend
//   const totalValues = data.reduce((acc, item) => {
//     acc.total += item.value;
//     if (item.name.toLowerCase().includes("new")) {
//       acc.new += item.value;
//     } else {
//       acc.existing += item.value;
//     }
//     return acc;
//   }, { total: 0, new: 0, existing: 0 });

//   return (
//     <Card className="shadow-lg rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-xl border-none">
//       <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
//         <div className="text-lg font-semibold flex items-center gap-2">
//           <PieChart className="h-5 w-5" /> Patient Distribution
//         </div>
//         <CardDescription className="text-blue-100">New vs Existing Patients</CardDescription>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="flex flex-col items-center">
//           <div className="flex justify-center gap-6 mb-4">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3B82F6" }}></div>
//               <div className="text-sm">
//                 <span className="mr-1 font-medium text-blue-800 flex items-center gap-1">
//                   <UserPlus className="h-3 w-3" /> New
//                 </span>
//                 <span className="text-xs text-gray-500">{totalValues.new} patients</span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#4338CA" }}></div>
//               <div className="text-sm">
//                 <span className="mr-1 font-medium text-indigo-800 flex items-center gap-1">
//                   <UserCheck className="h-3 w-3" /> Existing
//                 </span>
//                 <span className="text-xs text-gray-500">{totalValues.existing} patients</span>
//               </div>
//             </div>
//           </div>
          
//           <ErrorBoundary>
//             <div className="h-64 w-full">
//               <PatientsStatusBarChart data={data} />
//             </div>
//           </ErrorBoundary>
          
//           <div className="mt-2 pt-2 border-t border-gray-100 w-full text-center">
//             <p className="text-sm text-gray-600">
//               <span className="font-medium text-indigo-800">{totalValues.total}</span> total patients
//             </p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default PatientTypeChart;

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