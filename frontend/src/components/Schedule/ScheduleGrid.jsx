import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import TaskModal from '../Modals/TaskModal';

const HOURS = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0];

export default function ScheduleGrid() {
  const { DAYS, userData } = useAppContext();
  const [editingSlot, setEditingSlot] = useState(null); 
  
  // Reference for the scrollable container
  const scrollContainerRef = useRef(null);

  // Safe fallbacks for backend data
  const schedule = userData?.schedule || {};
  const categories = userData?.categories || [];

  const currentHour = new Date().getHours();
  const currentDay = DAYS[(new Date().getDay() + 6) % 7]; 

  // Automatically scroll to the current hour column on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Find the index of the current hour (fallback to index 0 if not found)
      const hourIndex = HOURS.indexOf(currentHour);
      if (hourIndex !== -1) {
        // Each time column has a min-width of ~68px, plus padding/borders. 
        // We calculate an approximate pixel offset based on the hour index minus a couple columns for padding.
        const targetScrollLeft = Math.max(0, (hourIndex - 1) * 75);
        scrollContainerRef.current.scrollLeft = targetScrollLeft;
      }
    }
  }, []);

  const formatHour = (h) => {
    const period = h < 12 ? 'AM' : 'PM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr} ${period}`;
  };

  const getSlotKey = (h) => `${h < 10 ? '0' : ''}${h}:00`;

  return (
    <section className="grid-panel">
      {/* Attach the ref to the scrollable wrapper div */}
      <div className="table-scroll" ref={scrollContainerRef}>
        <table className="week-table">
          <thead>
            <tr>
              <th className="corner">Day / Time</th>
              {HOURS.map(h => (
                <th key={h} className={`time-head ${h === currentHour ? 'is-now-col' : ''}`}>
                  {formatHour(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => {
              const daySchedule = schedule[day] || {};

              return (
                <tr key={day} className={`day-row ${day === currentDay ? 'is-today' : ''}`}>
                  <th scope="row" className="day-cell">
                    {day} {day === currentDay && <span className="today-badge">Today</span>}
                  </th>
                  {HOURS.map(h => {
                    const timeKey = getSlotKey(h);
                    const task = daySchedule[timeKey];
                    const isNow = day === currentDay && h === currentHour;
                    
                    return (
                      <td key={h} className={`slot ${isNow ? 'is-now' : ''} ${task ? 'filled' : ''}`}>
                        {task ? (
                          <button 
                            className="chip" 
                            onClick={() => setEditingSlot({ day, time: timeKey, task })}
                            style={task.category ? { 
                              '--cat-c': categories.find(c => c.name === task.category)?.color 
                            } : {}}
                          >
                            {task.text}
                          </button>
                        ) : (
                          <button 
                            className="slot-add" 
                            onClick={() => setEditingSlot({ day, time: timeKey, task: null })}
                          >+</button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {editingSlot && (
        <TaskModal 
          slot={editingSlot} 
          onClose={() => setEditingSlot(null)} 
        />
      )}
    </section>
  );
}