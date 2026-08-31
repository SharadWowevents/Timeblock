import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Header({ onManageUsers }) {
  // Use logout instead of setCurrentUserId since we are communicating with the backend Context
  const { currentUser, userData, logout } = useAppContext();
  const [timeStr, setTimeStr] = useState('');

  // Safe fallback for backend data
  const categories = userData?.categories || [];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(`${now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${now.toLocaleTimeString()}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="session-bar">
        <div className="session-info">
          <span className="live-clock">{timeStr}</span>
          {/* Use optional chaining on currentUser to prevent logout crashes */}
          <span className="session-user">
            {currentUser?.email} {currentUser?.role === 'admin' ? '· Admin' : ''}
          </span>
        </div>
        <div className="session-actions">
          {currentUser?.role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={onManageUsers}>Manage users</button>
          )}
          {/* Trigger the logout function from Context */}
          <button className="btn btn-secondary btn-sm" onClick={logout}>Log out</button>
        </div>
      </div>

      <header className="app-header">
        <div>
          <h1 className="app-title">Timeblock</h1>
          <p className="app-subtitle">Your recurring week, Monday to Sunday. Click a time slot to add a repeating task.</p>
        </div>
        
        {/* Safely use the categories fallback */}
        {categories.length > 0 && (
          <ul className="legend">
            {categories.map(c => (
              <li key={c.name} className="legend-item">
                <span className="dot" style={{ '--cat-c': c.color }}></span>{c.name}
              </li>
            ))}
          </ul>
        )}
      </header>
    </>
  );
}