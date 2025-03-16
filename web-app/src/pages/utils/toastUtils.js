import { toast } from "react-hot-toast";
import { AlertCircle, Check } from "lucide-react";

export const showErrorToast = (message) => {
  toast.custom((t) => (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-md flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <div className="font-medium">{message}</div>
    </div>
  ), { duration: 4000 });
};

export const showSuccessToast = (message) => {
  toast.custom((t) => (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl shadow-md flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <Check className="h-4 w-4 text-blue-700" />
      </div>
      <div className="font-medium">{message}</div>
    </div>
  ), { duration: 4000 });
};