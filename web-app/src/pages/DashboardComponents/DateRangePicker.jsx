import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';

/**
 * Date range picker component for filtering dashboard data
 * 
 * @param {Object} props - Component props
 * @param {Date} props.startDate - Start date
 * @param {Date} props.endDate - End date
 * @param {Function} props.onStartDateChange - Function to call when start date changes
 * @param {Function} props.onEndDateChange - Function to call when end date changes
 * @param {string} props.className - Additional CSS classes
 */
export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-9 px-4 rounded-lg border-blue-200 text-blue-800 hover:bg-blue-50 flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {startDate ? format(startDate, 'PPP') : 'Select start date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <span className="text-gray-500">to</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-9 px-4 rounded-lg border-blue-200 text-blue-800 hover:bg-blue-50 flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {endDate ? format(endDate, 'PPP') : 'Select end date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) => startDate ? date < startDate : false}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};