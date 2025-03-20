import React, { useRef, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomDatePicker from "../../CommonFiles/CustomDatePicker";
import { CalendarClock, BadgeCheck, AlertTriangle, Stethoscope } from "lucide-react";

const DayWrapper = ({ day, date, isWorking, isWorkingAndOff, schedules, reviewCounts }) => {
  const dayRef = useRef(null);

  useEffect(() => {
    const tooltip = dayRef.current?.querySelector(".tooltip");
    if (tooltip) {
      const rect = dayRef.current.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const calendarRect = dayRef.current.closest(".react-datepicker")?.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      let top = rect.top - tooltipRect.height - 5;
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

      if (top < calendarRect.top || top < 0) {
        top = rect.bottom + 5;
      }
      if (top + tooltipRect.height > windowHeight) {
        top = rect.top - tooltipRect.height - 5;
        if (top < calendarRect.top || top < 0) {
          top = calendarRect.bottom + 5;
        }
      }
      if (left < calendarRect.left) {
        left = rect.left;
      }
      if (left + tooltipRect.width > windowWidth) {
        left = rect.left + rect.width - tooltipRect.width;
      }

      tooltip.style.zIndex = "1000";
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.position = "fixed";
    }
  }, [schedules, reviewCounts]);

  const dateString = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dailyReviews = reviewCounts[dateString] || {};

  return (
    <div
      ref={dayRef}
      className={`relative flex items-center justify-center w-full h-full p-1 group
        ${isWorking && !isWorkingAndOff ? "bg-indigo-50 text-indigo-900" : ""} 
        ${isWorkingAndOff ? "bg-gray-100 text-gray-500" : ""}
        ${Object.keys(dailyReviews).length > 0 ? "border-b-2 border-red-300" : ""}`}
    >
      <span className="text-sm font-medium">{day}</span>
      <div className="tooltip invisible group-hover:visible bg-white text-black text-sm rounded-lg py-2 px-3 border border-gray-200 max-w-sm">
        <div className="font-semibold text-indigo-900 mb-2 border-b border-gray-100 pb-1">
          Details for {date.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        {/* Staff Schedules */}
        {schedules.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-1.5">
                {schedule.status === "Working" ? (
                  <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span className="font-medium">{schedule.name}</span>
                <span className="text-xs text-gray-500">({schedule.role})</span>
                <span className={schedule.status === "Working" ? "text-green-600 text-xs" : "text-amber-600 text-xs"}>
                  {schedule.status}{schedule.time ? `: ${schedule.time}` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-1">No staff scheduled</div>
        )}

        {/* Review Counts */}
        {Object.keys(dailyReviews).length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="font-semibold text-red-700 mb-1">Patient Reviews</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(dailyReviews).map(([doctorName, count]) => (
                <div key={doctorName} className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-medium">
                    {doctorName}
                  </span>
                  <span className="text-xs text-red-600">
                    {count} review{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StaffSchedule = ({ doctors, nurses, selectedDate, setSelectedDate, reviewCounts, className }) => {
  const isDateInRange = (date, startDate, endDate, repeatYearly) => {
    const checkDate = date.getTime();
    let start = new Date(startDate);
    let end = new Date(endDate);
    if (repeatYearly) {
      start.setFullYear(date.getFullYear());
      end.setFullYear(date.getFullYear());
      if (end < start) end.setFullYear(date.getFullYear() + 1);
    }
    return checkDate >= start.getTime() && checkDate <= end.getTime();
  };

  const isWorkingDay = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    const allStaff = [...doctors, ...nurses];
    return allStaff.some((staff) => {
      const daySchedule = staff.workingHours?.[dayName];
      return daySchedule?.enabled === true;
    });
  };

  const isWorkingDayAndOff = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    const allStaff = [...doctors, ...nurses];
    return allStaff.some((staff) => {
      const daySchedule = staff.workingHours?.[dayName];
      const isEnabled = daySchedule?.enabled === true;
      const isDayOff = staff.daysOff?.some((dayOff) =>
        isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
      );
      return isEnabled && isDayOff;
    });
  };

  const getStaffSchedulesForDate = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    const allStaff = [...doctors, ...nurses];
    const workingStaff = allStaff
      .filter((staff) => {
        const daySchedule = staff.workingHours?.[dayName];
        return daySchedule?.enabled === true;
      })
      .map((staff) => {
        const isDayOff = staff.daysOff?.some((dayOff) =>
          isDateInRange(date, dayOff.startDate, dayOff.endDate, dayOff.repeatYearly)
        );
        return {
          id: staff.id,
          name: staff.name,
          role: doctors.includes(staff) ? "Doctor" : "Nurse",
          status: isDayOff ? "Day Off" : "Working",
          time: isDayOff ? "" : `${staff.workingHours[dayName]?.startTime} to ${staff.workingHours[dayName]?.endTime}`,
        };
      });

    return workingStaff.length === 0 ? [] : workingStaff;
  };

  const renderDayContents = (day, date) => {
    const isWorking = isWorkingDay(date);
    const isWorkingAndOff = isWorkingDayAndOff(date);
    const schedules = getStaffSchedulesForDate(date);

    return (
      <DayWrapper
        day={day}
        date={date}
        isWorking={isWorking}
        isWorkingAndOff={isWorkingAndOff}
        schedules={schedules}
        reviewCounts={reviewCounts}
      />
    );
  };

  return (
    <Card className={`rounded-xl overflow-hidden bg-white transition-all duration-300 border-none ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
        <div className="text-lg font-semibold flex items-center gap-2">
          <CalendarClock className="h-5 w-5" /> Staff Schedule
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center">
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-center mb-4 w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[340px]">
            <CustomDatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              renderDayContents={renderDayContents}
              inline
              className="w-full"
            />
          </div>

          <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
            <div className="grid grid-cols-2 gap-3 w-full text-sm">
              <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded">
                <span className="w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-sm"></span>
                <span className="text-indigo-900">Working Day</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm"></span>
                <span className="text-gray-600">Day Off</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-50 p-2 rounded w-full">
              <span className="w-3 h-3 bg-red-100 border-b-2 border-red-300 rounded-sm"></span>
              <span className="text-red-900">Day with Reviews</span>
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">
              Hover over a day to see staff details and review counts
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffSchedule;