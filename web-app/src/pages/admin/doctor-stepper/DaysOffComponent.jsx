import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import { CalendarIcon, PlusCircle, Trash2, AlertCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function DaysOffComponent() {
  const { control, watch } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({ control, name: "daysOff" });

  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [dayOffName, setDayOffName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [repeatYearly, setRepeatYearly] = useState(false);

  const formValues = watch();
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!dayOffName || dayOffName.length < 5) {
      newErrors.dayOffName = "Day Off Name must be at least 5 characters.";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required.";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required.";
    }
    if (startDate && endDate < startDate) {
      newErrors.endDate = "End date must be after or equal to the start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDayOff = () => {
    if (!validate()) return;

    if (isEditing && selectedDay !== null) {
      update(selectedDay, { dayOffName, startDate, endDate, repeatYearly });
    } else {
      append({ dayOffName, startDate, endDate, repeatYearly });
    }

    resetModal();
  };

  const handleEditDayOff = index => {
    const day = fields[index];
    setDayOffName(day.dayOffName);
    setStartDate(day.startDate);
    setEndDate(day.endDate);
    setRepeatYearly(day.repeatYearly);

    setSelectedDay(index);
    setIsEditing(true);
  };

  const resetModal = () => {
    setDayOffName("");
    setStartDate(null);
    setEndDate(null);
    setRepeatYearly(false);
    setSelectedDay(null);
    setIsEditing(false);
    setIsAdding(false);
    setErrors({});
  };

  return (
    <div className="space-y-4">
      {/* Header with instructions */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-700 mb-1">Days Off & Holidays</h3>
        <p className="text-xs text-slate-500">
          Add days when the doctor will not be available. This could include holidays, personal time
          off, or other absences.
        </p>
      </div>

      {/* List of Days Off */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-md">
            <p className="text-sm text-slate-500">No days off added yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Click the plus button below to add days off
            </p>
          </div>
        ) : (
          fields.map((day, index) => (
            <div key={day.id} className="flex items-center gap-2">
              <div
                className="border border-slate-200 p-3 rounded-md w-full cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleEditDayOff(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-slate-800">{day.dayOffName}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {day.startDate ? format(new Date(day.startDate), "PPP") : "No Start Date"}
                      {" - "}
                      {day.endDate ? format(new Date(day.endDate), "PPP") : "No End Date"}
                    </div>
                  </div>
                  {day.repeatYearly && (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                      <RotateCcw className="h-3 w-3" />
                      <span className="text-xs font-medium">Repeats Yearly</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={e => {
                  e.preventDefault(); // Prevent form submission
                  e.stopPropagation(); // Prevent triggering edit
                  remove(index);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="outline"
          className="border-dashed border-slate-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-700 hover:bg-emerald-50"
          onClick={e => {
            e.preventDefault(); // Prevent form submission
            resetModal();
            setIsAdding(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Day Off
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isEditing || isAdding}
        onOpenChange={value => {
          if (!value) resetModal();
        }}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-700 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {isEditing ? "Edit Day Off" : "Add Day Off"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update details for this day off period"
                : "Add a period when the doctor will be unavailable"}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 py-2" onSubmit={e => e.preventDefault()}>
            {/* Day Off Name Field */}
            <div className="space-y-2">
              <Label htmlFor="dayOffName" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Input
                id="dayOffName"
                value={dayOffName}
                onChange={e => setDayOffName(e.target.value)}
                placeholder="e.g., Summer Vacation, National Holiday"
                className={`${errors.dayOffName ? "border-red-300 focus-visible:ring-red-400" : ""}`}
              />
              {errors.dayOffName && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{errors.dayOffName}</p>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Date Range</Label>
              <div className="flex gap-3 justify-between items-start">
                {/* Start Date */}
                <div className="flex flex-col w-full space-y-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          errors.startDate ? "border-red-300 hover:border-red-400" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                        {startDate ? format(new Date(startDate), "PPP") : <span>Start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={setStartDate}
                        initialFocus
                        className="border rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <p className="text-xs text-red-600">{errors.startDate}</p>
                    </div>
                  )}
                </div>

                {/* Centered "to" Text */}
                <span className="text-sm text-slate-500 mt-2">to</span>

                {/* End Date */}
                <div className="flex flex-col w-full space-y-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          errors.endDate ? "border-red-300 hover:border-red-400" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                        {endDate ? format(new Date(endDate), "PPP") : <span>End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={setEndDate}
                        initialFocus
                        className="border rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <p className="text-xs text-red-600">{errors.endDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Repeat Yearly Switch */}
            <div className="flex items-center justify-between space-x-2 pt-2 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <Label htmlFor="repeat-yearly" className="text-sm font-medium text-slate-700">
                  Annual Recurrence
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">This time off repeats every year</p>
              </div>
              <Switch
                id="repeat-yearly"
                checked={repeatYearly}
                onCheckedChange={setRepeatYearly}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={e => {
                  e.preventDefault(); // Prevent form submission
                  resetModal();
                }}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={e => {
                  e.preventDefault(); // Prevent form submission
                  handleAddDayOff();
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isEditing ? "Update" : "Add"} Day Off
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
