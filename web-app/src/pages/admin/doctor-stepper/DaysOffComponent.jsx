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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { MdOutlineEventRepeat } from "react-icons/md";

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
  console.log("Form values", formValues);

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
    } else if (startDate && endDate < startDate) {
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
    <div>
      {/* List of Days Off */}
      <div className="space-y-2">
        {fields.map((day, index) => (
          <div key={day.id} className="flex items-center gap-1">
            <div
              className="border p-2 rounded-md w-full cursor-pointer hover:bg-gray-100"
              onClick={() => handleEditDayOff(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">{day.dayOffName}</div>
                  <div className="text-sm text-gray-500">
                    {day.startDate ? format(new Date(day.startDate), "PPP") : "No Start Date"} -{" "}
                    {day.endDate ? format(new Date(day.endDate), "PPP") : "No End Date"}
                  </div>
                </div>
                {day.repeatYearly && (
                  <div className="flex gap-2">
                    <MdOutlineEventRepeat className="size-5" />
                    <div className="text-sm">Repeat yearly</div>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Button */}
            <Trash2
              className="size-5 text-destructive/90 hover:text-destructive cursor-pointer"
              onClick={() => remove(index)}
            />
          </div>
        ))}
      </div>

      {/* Add Button */}
      <PlusCircle
        className="size-8 mt-3 text-gray-500 hover:text-gray-800 cursor-pointer"
        onClick={() => {
          resetModal();
          setIsAdding(true);
        }}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isEditing || isAdding} onOpenChange={resetModal}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Day Off" : "Add Day Off"}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4 text-start">
            {/* Day Off Name Field */}
            <div className="space-y-2">
              <label htmlFor="dayOffName" className="block text-sm font-medium text-primary">
                Day Off Name
              </label>
              <Input
                id="dayOffName"
                value={dayOffName}
                onChange={e => setDayOffName(e.target.value)}
                className="block w-full p-2 border rounded-md"
              />
              {errors.dayOffName && <p className="text-red-500 text-sm">{errors.dayOffName}</p>}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Date</label>
              <div className="flex gap-4 justify-between items-start">
                {/* Start Date */}
                <div className="flex flex-col w-full space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon />
                        {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                </div>

                {/* Centered "to" Text */}
                <span className="text-sm font-medium mt-2">to</span>

                {/* End Date */}
                <div className="flex flex-col w-full space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon />
                        {endDate ? format(new Date(endDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Repeat Yearly Switch */}
            <div className="flex items-center space-x-2 pt-3">
              <Switch id="repeat-yearly" checked={repeatYearly} onCheckedChange={setRepeatYearly} />
              <Label htmlFor="repeat-yearly">Repeat this day off yearly</Label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddDayOff}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
