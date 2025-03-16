// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Loader2 } from "lucide-react";

// const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm, disabled }) => {
//   const [localLoading, setLocalLoading] = useState(false); // Local loading state for this dialog

//   const handleConfirm = () => {
//     if (!localLoading && !disabled) {
//       setLocalLoading(true);
//       onConfirm().finally(() => setLocalLoading(false)); // Reset loading after confirm completes
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="rounded-lg shadow-lg"
//         onInteractOutside={(e) => e.preventDefault()}
//         onEscapeKeyDown={(e) => e.preventDefault()}
//       >
//         <DialogHeader>
//           <DialogTitle className="text-teal-800">Confirm Deletion</DialogTitle>
//         </DialogHeader>
//         <p className="text-gray-600">Are you sure you want to delete this medical record? This action cannot be undone.</p>
//         <DialogFooter>
//           <Button
//             onClick={() => onOpenChange(false)}
//             variant="ghost"
//             disabled={localLoading || disabled}
//             className="text-gray-600"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirm}
//             disabled={localLoading || disabled}
//             className="bg-red-600 hover:bg-red-700 text-white"
//           >
//             {localLoading ? (
//               <>
//                 <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                 Deleting...
//               </>
//             ) : (
//               "Delete"
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default DeleteConfirmationDialog;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash2, AlertTriangle, X } from "lucide-react";

const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm, disabled }) => {
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = () => {
    if (!localLoading && !disabled) {
      setLocalLoading(true);
      onConfirm().finally(() => setLocalLoading(false));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-xl bg-white border-2 border-red-100 max-w-md mx-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirm Deletion
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-700">Are you sure you want to delete this medical record? This action cannot be undone.</p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            disabled={localLoading || disabled}
            className="h-10 px-5 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={localLoading || disabled}
            className="h-10 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white"
          >
            {localLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;