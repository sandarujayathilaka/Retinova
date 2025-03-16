import { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import { 
  CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, 
  PhoneIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon, 
  UserCircleIcon, CheckCircleIcon, XCircleIcon 
} from '@heroicons/react/24/outline';

const NurseProfile = ({ nurseId: propNurseId }) => {
  const [nurse, setNurse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date('2025-03-14'));
  const [activeTab, setActiveTab] = useState('schedule');
  const SAMPLE_NURSE_ID = '67d1eec052a3868b43b617d3';

  useEffect(() => {
    const fetchNurse = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const nurseIdToUse = propNurseId || SAMPLE_NURSE_ID;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await api.get(`/nurse/${nurseIdToUse}`, config);
        if (typeof res.data !== 'object' || res.data === null) throw new Error('Invalid response format');
        setNurse(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load nurse profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNurse();
  }, [propNurseId]);

  const timeToPercentage = (time) => {
    if (!time) return 0;
    const [hourMinute, period] = time.split(' ');
    const [hour, minute] = hourMinute.split(':').map(Number);
    let hours = hour;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return (hours * 60 + (minute || 0)) / (24 * 60) * 100;
  };

  // Sub-components
  const ProfileHeader = () => {
    // Extract the image URL from the S3 metadata if it exists
    const imageUrl = nurse?.image?.Location || (typeof nurse?.image === 'string' ? nurse.image : null);

    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={nurse.name || 'Nurse'} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} // Fallback on error
              />
            ) : null}
            <div 
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
            >
              <UserCircleIcon className="w-16 h-16 md:w-20 md:h-20 text-blue-300" />
            </div>
            <div className={`absolute bottom-1 right-1 rounded-full p-1 ${nurse.status ? 'bg-green-400' : 'bg-red-400'}`}>
              {nurse.status ? <CheckCircleIcon className="w-6 h-6 text-white" /> : <XCircleIcon className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{nurse.name || 'Unknown Nurse'}</h1>
            <p className="text-blue-100 font-medium">{nurse.specialty || 'General Nursing'}</p>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-100">{nurse.type || 'Full-time'}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${nurse.status ? 'bg-green-500 text-green-50' : 'bg-red-500 text-red-50'}`}>
                {nurse.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ContactInfo = () => (
    <div className="p-6 md:flex-1 border-b md:border-b-0 md:border-r border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
      <div className="space-y-4">
        {nurse.phone && <div className="flex items-center"><PhoneIcon className="w-5 h-5 text-blue-600 mr-3" /><a href={`tel:${nurse.phone}`} className="text-gray-600 hover:text-blue-600">{nurse.phone}</a></div>}
        {nurse.email && <div className="flex items-center"><EnvelopeIcon className="w-5 h-5 text-blue-600 mr-3" /><a href={`mailto:${nurse.email}`} className="text-gray-600 hover:text-blue-600">{nurse.email}</a></div>}
        {nurse.address && <div className="flex items-start"><MapPinIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" /><span className="text-gray-600">{nurse.address}</span></div>}
        {nurse.department && <div className="flex items-center"><BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-3" /><span className="text-gray-600">{nurse.department}</span></div>}
      </div>
    </div>
  );

  const Tabs = () => (
    <div className="px-6 py-4 md:w-1/2 lg:w-2/5">
      <div className="flex space-x-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('schedule')} className={`px-1 py-3 font-medium text-sm flex items-center ${activeTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <ClockIcon className="w-5 h-5 mr-2" /> Working Schedule
        </button>
        <button onClick={() => setActiveTab('days-off')} className={`px-1 py-3 font-medium text-sm flex items-center ${activeTab === 'days-off' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <CalendarIcon className="w-5 h-5 mr-2" /> Days Off
        </button>
      </div>
    </div>
  );

  const ScheduleView = () => {
    if (!nurse?.workingHours) return <p className="text-gray-500">No schedule data available.</p>;
    const today = new Date('2025-03-14');
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + currentWeekOffset * 7 - weekStart.getDay());
    const weeklySchedule = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
      const workingHour = nurse.workingHours[dayName] || { enabled: false };
      const isWorking = workingHour.enabled && workingHour.startTime && workingHour.endTime;
      const isHoliday = nurse.daysOff?.some(h => new Date(h.startDate) <= date && new Date(h.endDate) >= date) || false;
      return {
        day: dayName,
        date,
        formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isWorking,
        isHoliday,
        isToday: date.toDateString() === today.toDateString(),
        start: isWorking ? timeToPercentage(workingHour.startTime) : 0,
        width: isWorking ? timeToPercentage(workingHour.endTime) - timeToPercentage(workingHour.startTime) : 0,
        hours: isWorking ? `${workingHour.startTime} - ${workingHour.endTime}` : 'Off',
      };
    });
    const weekRange = weeklySchedule.length ? `${weeklySchedule[0].formattedDate} - ${weeklySchedule[6].formattedDate}` : '';

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Schedule</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ChevronLeftIcon className="w-5 h-5" /></button>
            <span className="text-sm text-gray-600 font-medium">{weekRange}</span>
            <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-32 shrink-0" />
            <div className="flex-1 relative">
              {['12AM', '6AM', '12PM', '6PM', '11PM'].map((time, i) => (
                <span key={time} className="absolute" style={{ left: `${i * 25}%`, transform: 'translateX(-50%)' }}>{time}</span>
              ))}
            </div>
          </div>
          {weeklySchedule.map(day => (
            <div key={`${day.day}-${day.date.toISOString()}`} className={`flex items-center p-2 rounded-lg ${day.isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <div className={`w-32 font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                <div>{day.day}</div>
                <div className="text-xs text-gray-500">{day.formattedDate}</div>
              </div>
              <div className="flex-1 relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                {[0, 25, 50, 75, 100].map(pos => <div key={pos} className="absolute h-full w-px bg-gray-200" style={{ left: `${pos}%` }} />)}
                {day.isHoliday && <div className="absolute inset-0 bg-blue-100 bg-opacity-60 flex items-center justify-center"><span className="text-blue-700 text-xs font-medium">Holiday</span></div>}
                {!day.isHoliday && day.isWorking && (
                  <div className="absolute h-full bg-green-500 rounded-lg group" style={{ left: `${day.start}%`, width: `${Math.max(day.width, 3)}%` }}>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">{day.hours}</span>
                  </div>
                )}
              </div>
              <div className="w-20 text-right text-sm">{!day.isHoliday && day.isWorking ? <span className="text-green-600 font-medium">Working</span> : <span className="text-gray-500">Off</span>}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DaysOffView = () => {
    if (!nurse?.daysOff) return <p className="text-gray-500">No days off data available.</p>;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date('2025-03-14');
    const daysOffDates = new Set();
    nurse.daysOff.forEach(day => {
      const start = new Date(day.startDate);
      const end = new Date(day.endDate);
      if (start.getFullYear() === year && start.getMonth() === month) {
        for (let d = start.getDate(); d <= end.getDate() && d <= daysInMonth; d++) daysOffDates.add(d);
      }
    });
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const calendar = Array(totalCells).fill(null).map((_, i) => {
      const day = i - firstDay + 1;
      if (i < firstDay || day > daysInMonth) return null;
      return {
        day,
        isPast: new Date(year, month, day) < today,
        isDayOff: daysOffDates.has(day),
        isToday: new Date(year, month, day).toDateString() === today.toDateString(),
      };
    });

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Days Off Calendar</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ChevronLeftIcon className="w-5 h-5" /></button>
            <span className="text-sm text-gray-600 font-medium">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-7 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 bg-gray-50 text-gray-700 font-medium text-sm border-b border-gray-200">{day}</div>
            ))}
            {calendar.map((day, i) => (
              <div key={i} className={`p-3 border-b border-r border-gray-200 ${!day ? 'bg-gray-50' : day.isToday ? 'bg-blue-50' : day.isPast ? 'text-gray-400' : 'text-gray-800'} ${day?.isDayOff ? 'bg-red-50' : ''}`}>
                {day && (
                  <>
                    <span className={day.isToday ? 'h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center' : ''}>{day.day}</span>
                    {day.isDayOff && <div className="mt-1"><span className="inline-block h-1 w-1 rounded-full bg-red-500"></span></div>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 mb-2">Upcoming Days Off</h3>
          {nurse.daysOff.length ? (
            nurse.daysOff.map((dayOff, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {new Date(dayOff.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {new Date(dayOff.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {dayOff.reason && <div className="text-xs text-gray-500">{dayOff.reason}</div>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No scheduled days off.</p>
          )}
        </div>
      </div>
    );
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
        <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">Try Again</button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        <ProfileHeader />
        <div className="border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <ContactInfo />
            <Tabs />
          </div>
        </div>
        <div className="p-6">{activeTab === 'schedule' ? <ScheduleView /> : <DaysOffView />}</div>
      </div>
    </div>
  );
};

export default NurseProfile;