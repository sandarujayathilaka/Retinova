export const dateToUTCString = (date) => {
    if (!date) return null;
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      .toISOString().split("T")[0];
  };

  export const isDateDisabled = (date, doctor) => {
    if (!date || !doctor) return false;
    
    const day = date.toLocaleString("en-US", { weekday: "long" });
    const isWorkingDay = !!doctor.workingHours[day];
    const isDayOff = doctor.daysOff?.some((dayOff) => {
      const start = new Date(dayOff.startDate);
      const end = new Date(dayOff.endDate);
      return date >= start && date <= end;
    }) || false;
  
    return !isWorkingDay || isDayOff;
  };