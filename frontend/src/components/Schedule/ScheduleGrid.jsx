import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import TaskModal from '../Modals/TaskModal';

const HOURS = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0];

export default function ScheduleGrid() {
  const { DAYS, userData } = useAppContext();
  const [editingSlot, setEditingSlot] = useState(null); 
  
  // Safe fallbacks for backend data
  const schedule = userData?.schedule || {};
  const categories = userData?.categories || [];

  const currentHour = new Date().getHours();
  const currentDay = DAYS[(new Date().getDay() + 6) % 7]; 

  const formatHour = (h) => {
    const period = h < 12 ? 'AM' : 'PM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr} ${period}`;
  };

  const getSlotKey = (h) => `${h < 10 ? '0' : ''}${h}:00`;

  return (
    <section className="grid-panel">
      <div className="table-scroll">
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
              // Safely get the specific day's schedule, defaulting to an empty object
              const daySchedule = schedule[day] || {};

              return (
                <tr key={day} className={`day-row ${day === currentDay ? 'is-today' : ''}`}>
                  <th scope="row" className="day-cell">
                    {day} {day === currentDay && <span className="today-badge">Today</span>}
                  </th>
                  {HOURS.map(h => {
                    const timeKey = getSlotKey(h);
                    // Safely extract the task
                    const task = daySchedule[timeKey];
                    const isNow = day === currentDay && h === currentHour;
                    
                    return (
                      <td key={h} className={`slot ${isNow ? 'is-now' : ''} ${task ? 'filled' : ''}`}>
                        {task ? (
                          <button 
                            className="chip" 
                            onClick={() => setEditingSlot({ day, time: timeKey, task })}
                            style={task.category ? { 
                              // Safely search the categories array
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