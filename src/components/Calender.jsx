import React, { useState, useEffect } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { format } from 'date-fns/format';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [selectedWorkingDays, setSelectedWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [selectedTimeIntervals, setSelectedTimeIntervals] = useState([]);

  const timeOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  ];

  const workingDaysOptions = [ 
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
  ];

  const { startOfWeek, endOfWeek } = getWeekRange(currentDate, selectedTimezone);

  function getWeekRange(date, timeZone) {
    const startOfWeek = new Date(date.toLocaleString('en-US', { timeZone }));
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startOfWeek, endOfWeek };
  }

  function isPastDay(startOfWeek, currentDate) {
    return currentDate < startOfWeek;
  }
  const isFirstDayPast = isPastDay(startOfWeek, currentDate);

  const getFormattedDateForDay = (dayValue) => {
    const todayIndex = new Date().getDay() - 1; // Adjusting for 0-based index
    const dayIndex = selectedWorkingDays.findIndex((day) => day === dayValue);
    
    if (dayIndex !== -1) {
      const daysUntilSelectedDay = (dayIndex - todayIndex + 7) % 7;
      const selectedDay = new Date(currentDate);
      selectedDay.setDate(currentDate.getDate() - (todayIndex - dayIndex));
      
      const dayOfMonth = selectedDay.getDate();
      const month = selectedDay.getMonth() + 1;
      return `${dayOfMonth < 10 ? '0' : ''}${dayOfMonth}/${month < 10 ? '0' : ''}${month}`;
    }
    
    return '';
  };
  
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        console.log(data);
        setSelectedTimeIntervals(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTimezoneChange = (event) => {
    setSelectedTimezone(event.target.value);
  };

  const goToPreviousWeek = () => {
    setCurrentDate((prevDate) => {
      const previousWeek = new Date(prevDate);
      previousWeek.setDate(prevDate.getDate() - 7);
      return previousWeek;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate((prevDate) => {
      const nextWeek = new Date(prevDate);
      nextWeek.setDate(prevDate.getDate() + 7);
      return nextWeek;
    });
  };

  const formattedDate = format(currentDate, 'MMM d, yyyy', { timeZone: selectedTimezone });
  return (
    <div className="main">
      <div className='btn'>
        <div className="prev">
          <button onClick={goToPreviousWeek}>Previous Week</button>
          <span>{formattedDate}</span>
        </div>
        <button onClick={goToNextWeek}>Next Week</button>
      </div>
      <div className='timezone'>
        <label htmlFor="timezone">Select Timezone: </label>
        <select id="timezone" value={selectedTimezone} onChange={handleTimezoneChange}>
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className='week-time'>
        {selectedWorkingDays.map((day) => {
          const dayDate = new Date(startOfWeek);
          const dayIndex = workingDaysOptions.findIndex((d) => d.value === day);
          dayDate.setDate(dayDate.getDate() + dayIndex);
          const isDayPast = isPastDay(dayDate, currentDate);

          return (
            <div key={day} style={{ display: "flex", width: "100%", height: "15vh", justifyContent: "space-between" }}>
              <div className="weekdays">
                <button>
                  {day}
                  {selectedWorkingDays.includes(day) && (
                    <div className="selected-date">
                      <p>{isFirstDayPast && isDayPast ? "Past" : getFormattedDateForDay(day)}</p>
                    </div>
                  )}
                </button>
              </div>
              <div className='time'>
                {selectedTimeIntervals.map((interval, index) => (
                  <label key={index}>
                    {isFirstDayPast && isDayPast ? (
                      "Past"
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          value={interval.time}
                        />
                        {interval.time}
                      </>
                    )}
                  </label>
                ))}
                <hr />
              </div>
            </div>
          );
        })}
      </div>
      <SwipeableViews
        index={0}
        onChangeIndex={(index) => {
          if (index === 0) goToPreviousWeek();
          if (index === 2) goToNextWeek();
        }}
        slideStyle={{ padding: 15 }}
      />
    </div>
  );
};

export default Calendar;
