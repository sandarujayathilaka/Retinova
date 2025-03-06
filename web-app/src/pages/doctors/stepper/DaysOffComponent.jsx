import { Controller, useFieldArray, useFormContext } from "react-hook-form";

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
  const {
    register,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useFormContext();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "daysOff",
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const formValues = watch();

  const handleAddDayOff = () => {
    const formData = watch();

    if (!formData.dayOffName || !formData.startDate || !formData.endDate) {
      console.error("Missing data:", formData);
      return;
    }

    if (isEditing && selectedDay !== null) {
      update(selectedDay, {
        dayOffName: formData.dayOffName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        repeatYearly: formData.repeatYearly || false,
      });
    } else {
      append({
        dayOffName: formData.dayOffName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        repeatYearly: formData.repeatYearly || false,
      });
    }

    // Reset state and close dialog
    setSelectedDay(null);
    setIsEditing(false);
    setIsAdding(false);

    // Clear input values
    setValue("dayOffName", "");
    setValue("startDate", null);
    setValue("endDate", null);
    setValue("repeatYearly", false);
  };

  const handleEditDayOff = index => {
    const day = fields[index];

    setValue("dayOffName", day.dayOffName);
    setValue("startDate", day.startDate);
    setValue("endDate", day.endDate);
    setValue("repeatYearly", day.repeatYearly);

    setSelectedDay(index);
    setIsEditing(true);
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
          setIsAdding(true);
          setIsEditing(false);
          setSelectedDay(null);

          setValue("dayOffName", "");
          setValue("startDate", null);
          setValue("endDate", null);
          setValue("repeatYearly", false);
        }}
      />

      {/* Reusable Add/Edit Dialog */}
      <Dialog
        open={isEditing || isAdding}
        onOpenChange={() => {
          setIsEditing(false);
          setIsAdding(false);
        }}
      >
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
                {...register("dayOffName", { required: "Day off name is required" })}
                className="block w-full p-2 border rounded-md"
              />
              {errors.dayOffName && (
                <span className="text-sm text-destructive">{errors.dayOffName.message}</span>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Date</label>
              <div className="flex items-center gap-4">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-1/2 justify-start text-left font-normal"
                        >
                          <CalendarIcon />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                to
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-1/2 justify-start text-left font-normal"
                        >
                          <CalendarIcon />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            {/* Repeat Yearly Switch */}
            <div className="flex items-center space-x-2">
              <Controller
                name="repeatYearly"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="repeat-yearly"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="repeat-yearly">Repeat this day off yearly</Label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={e => {
                  e.preventDefault();
                  handleAddDayOff();
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
