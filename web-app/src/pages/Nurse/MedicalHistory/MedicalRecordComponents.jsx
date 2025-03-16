import React from "react";
import { Loader2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Component to show while records are loading
 */
export const LoadingState = () => (
  <div className="flex flex-col justify-center items-center h-64">
    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
    <p className="text-indigo-700 font-medium">Loading medical records...</p>
  </div>
);

/**
 * Component to show when no records exist
 */
export const EmptyState = ({ onAddRecord }) => (
  <Card className="p-8 bg-white border border-blue-100 rounded-xl text-center">
    <div className="flex flex-col items-center">
      <div className="bg-blue-50 p-4 rounded-full mb-4">
        <FileText className="h-12 w-12 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold text-blue-900 mb-2">No Medical Records</h3>
      <p className="text-blue-600 mb-6">This patient doesn't have any medical records yet.</p>
      <Button
        onClick={onAddRecord}
        className="px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
      >
        <Plus className="mr-2 h-4 w-4" /> Add First Record
      </Button>
    </div>
  </Card>
);

/**
 * Component for displaying diagnosis date
 */
export const DiagnosisDate = ({ date }) => {
  if (!date) return null;
  
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <Calendar className="h-4 w-4 text-indigo-500" />
      <span>
        Diagnosed: <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
      </span>
    </div>
  );
};

/**
 * Component to display condition type badge
 */
export const ConditionTypeBadge = ({ isChronicCondition }) => (
  <Badge 
    className={`${isChronicCondition 
      ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-700" 
      : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700"}
      px-3 py-1 rounded-full`}
  >
    {isChronicCondition ? "Chronic" : "Acute"}
  </Badge>
);

/**
 * Component to display last modified timestamp
 */
export const LastModified = ({ updatedAt }) => {
  if (!updatedAt) return null;
  
  return (
    <p className="text-xs text-gray-500 flex items-center">
      <Clock className="h-3 w-3 mr-1 text-indigo-400" />
      Last Modified: {new Date(updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </p>
  );
};

/**
 * Action buttons for records
 */
export const RecordActions = ({ onEdit, onDelete, disabled }) => (
  <div className="flex gap-2">
    <Button
      onClick={onEdit}
      variant="outline"
      size="sm"
      disabled={disabled}
      className="h-9 px-4 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50"
    >
      <Pencil className="h-4 w-4 mr-2" /> Edit
    </Button>
    <Button
      onClick={onDelete}
      variant="outline"
      size="sm"
      disabled={disabled}
      className="h-9 px-4 rounded-full border-red-300 text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-2" /> Delete
    </Button>
  </div>
);