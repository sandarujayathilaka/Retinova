// import { Button } from "@/components/ui/button";

// const PaginationControls = ({ pagination, onPageChange }) => {
//   const displayedCount = Math.min(pagination.currentPage * pagination.limit, pagination.totalPatients);

//   return pagination.totalPatients > 0 ? (
//     <div className="flex justify-between items-center mt-4">
//       <p className="text-sm text-gray-600">
//         Showing {displayedCount > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} to {displayedCount} of {pagination.totalPatients} patients
//       </p>
//       <div className="flex gap-2">
//         <Button
//           variant="outline"
//           disabled={pagination.currentPage === 1}
//           onClick={() => onPageChange(pagination.currentPage - 1)}
//           className="rounded-full"
//         >
//           Previous
//         </Button>
//         <Button
//           variant="outline"
//           disabled={pagination.currentPage === pagination.totalPages}
//           onClick={() => onPageChange(pagination.currentPage + 1)}
//           className="rounded-full"
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   ) : null;
// };

// export default PaginationControls;

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

const PaginationControls = ({ 
  pagination, 
  onPageChange, 
  customClass = "", 
  buttonClass = "", 
  activeButtonClass = ""
}) => {
  const displayedCount = Math.min(pagination.currentPage * pagination.limit, pagination.totalPatients);
  const startingItem = pagination.totalPatients > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0;

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show
    
    if (pagination.totalPages <= maxPageButtons) {
      // If we have fewer total pages than our max, show all pages
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, pagination.currentPage - 1);
      let endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
      
      // Adjust if we're near the beginning
      if (pagination.currentPage <= 3) {
        endPage = Math.min(pagination.totalPages - 1, 4);
      }
      
      // Adjust if we're near the end
      if (pagination.currentPage >= pagination.totalPages - 2) {
        startPage = Math.max(2, pagination.totalPages - 3);
      }
      
      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (endPage < pagination.totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page if we have more than 1 page
      if (pagination.totalPages > 1) {
        pages.push(pagination.totalPages);
      }
    }
    
    return pages;
  };

  return pagination.totalPatients > 0 ? (
    <div className={`mt-6 ${customClass}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="bg-blue-50 rounded-full px-4 py-2 text-blue-700 font-medium flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>
            Showing <span className="font-semibold">{startingItem}</span> to{" "}
            <span className="font-semibold">{displayedCount}</span> of{" "}
            <span className="font-semibold">{pagination.totalPatients}</span> patients
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 1}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            className={`${buttonClass || 'rounded-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200'}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 text-gray-500">...</span>
            ) : (
              <Button
                key={`page-${page}`}
                variant={pagination.currentPage === page ? "default" : "outline"}
                onClick={() => page !== pagination.currentPage && onPageChange(page)}
                className={pagination.currentPage === page 
                  ? (activeButtonClass || 'rounded-full bg-blue-900 hover:bg-blue-800 text-white') 
                  : (buttonClass || 'rounded-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200')}
                aria-label={`Go to page ${page}`}
                aria-current={pagination.currentPage === page ? "page" : undefined}
              >
                {page}
              </Button>
            )
          ))}
          
          <Button
            variant="outline"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            className={`${buttonClass || 'rounded-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200'}`}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default PaginationControls;