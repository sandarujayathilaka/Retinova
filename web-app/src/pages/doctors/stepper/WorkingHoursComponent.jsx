import { Controller, useFormContext } from "react-hook-form";

import { Separator } from "@/components/ui/separator";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { Clock } from "lucide-react";

export default function WorkingHoursComponent() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeIntervals = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start from 08:00 AM
    const period = hour < 12 ? "AM" : "PM";
    const formattedHour = hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
    return `${formattedHour}:00 ${period}`;
  });

  console.log("errors", errors);
  console.log(watch("workingHours"));

  // Helper function to safely access nested error messages
  const getErrorMessage = (day, field) => {
    try {
      return errors?.workingHours?.[day]?.[field]?.message;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-4 text-start flex flex-col gap-1">
      {daysOfWeek.map((day, index) => {
        const isWorking = watch(`workingHours.${day}.enabled`);

        return (
          <div key={day} className="space-y-4">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                {/* Switch for Day Selection */}
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name={`workingHours.${day}.enabled`}
                    render={({ field }) => (
                      <Switch
                        id={day.toLowerCase()}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={`data-[state=checked]:bg-main`}
                      />
                    )}
                  />
                  <Label htmlFor={day.toLowerCase()}>{day}</Label>
                </div>

                {isWorking ? (
                  <div className="flex space-x-2 items-start">
                    <div className="flex flex-col w-full space-y-1">
                      {/* Controlled Select for Start Time */}
                      <Controller
                        control={control}
                        name={`workingHours.${day}.startTime`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-[110px] flex items-center gap-1 text-sm px-1.5">
                              <Clock size={16} className="text-gray-500" />
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {timeIntervals.map(time => (
                                  <SelectItem key={`start-${day}-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {getErrorMessage(day, "startTime") && (
                        <p className="text-destructive text-xs mt-0">
                          {getErrorMessage(day, "startTime")}
                        </p>
                      )}
                    </div>

                    <span className="mt-2">to</span>

                    <div className="flex flex-col w-full space-y-1">
                      {/* Controlled Select for End Time */}
                      <Controller
                        control={control}
                        name={`workingHours.${day}.endTime`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-[110px] flex items-center gap-1 text-sm px-1.5">
                              <Clock size={16} className="text-gray-500" />
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {timeIntervals.map(time => (
                                  <SelectItem key={`end-${day}-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {getErrorMessage(day, "endTime") && (
                        <p className="text-destructive text-xs mt-0">
                          {getErrorMessage(day, "endTime")}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not working on this day</span>
                )}
              </div>
            </div>

            {/* Hide separator for last item */}
            {index !== daysOfWeek.length - 1 && (
              <Separator orientation="horizontal" className="my-2" />
            )}
          </div>
        );
      })}

      {/* Display the general "at least one day required" error */}
      {errors.workingHours?.day && (
        <span className="text-sm text-destructive mt-4">{errors.workingHours?.day.message}</span>
      )}
    </div>
  );
}
