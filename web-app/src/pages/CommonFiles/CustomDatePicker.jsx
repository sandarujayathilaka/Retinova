import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({
  selected,
  onChange,
  minDate,
  filterDate,
  placeholderText,
  renderDayContents,
  inline = false, 
  className,
}) => {
  return (
    <>
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        filterDate={filterDate}
        className={
          !inline
            ? "w-full bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-200 text-gray-700"
            : `${className} mx-auto` 
        }
        placeholderText={placeholderText}
        dateFormat="yyyy-MM-dd"
        popperPlacement="top-start"
        calendarClassName="custom-datepicker"
        renderDayContents={renderDayContents}
        inline={inline} 
      />
      <style>{`
        .custom-datepicker {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
          background-color: #ffffff;
          font-family: inherit;
          overflow: hidden;
          display: flex; /* Make the calendar a flex container */
          justify-content: center; /* Center horizontally */
          margin: 0 auto; /* Ensure it centers in the parent container */
        }
        .react-datepicker__header {
          background: linear-gradient(to right, #1e3a8a, #3730a3);
          border-bottom: none;
          padding: 0.75rem;
          color: #ffffff;
          font-weight: 600;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: #ffffff;
          font-weight: 500;
        }
        .react-datepicker__day {
          color: #1f2937;
          position: relative;
          margin: 0.2rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }
        .react-datepicker__day:hover {
          background-color: #e0e7ff;
          color: #4338ca;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #4f46e5;
          color: #ffffff;
          font-weight: 600;
          border-radius: 0.25rem;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #ffffff;
        }
        .react-datepicker__triangle {
          border-bottom-color: #1e3a8a;
        }
        .react-datepicker__month-container {
          padding-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
};

export default CustomDatePicker;