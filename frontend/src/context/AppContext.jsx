import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext(null);

// Make sure this matches your backend URL
const API_URL = '/api'; 
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PALETTE = ['#3d6b96', '#3fa9dc', '#4a9950', '#d9822b', '#d4a017', '#7a5ea8', '#b1477a', '#3d8f8a', '#5a6b8f', '#8a5a3d'];

const defaultUserData = () => ({
  schedule: DAYS.reduce((acc, day) => ({ ...acc, [day]: {} }), {}),
  todos: [],
  categories: [],
  bookmarkTabs: []
});

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('timeblock-token'));
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('timeblock-user')) || null);
  const [userData, setUserData] = useState(defaultUserData());
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch user data when token changes (e.g. on login or refresh)
  useEffect(() => {
    if (token) {
      localStorage.setItem('timeblock-token', token);
      if (currentUser) localStorage.setItem('timeblock-user', JSON.stringify(currentUser));
      fetchUserData();
    } else {
      localStorage.removeItem('timeblock-token');
      localStorage.removeItem('timeblock-user');
      setCurrentUser(null);
      setUserData(defaultUserData());
      setIsLoaded(true);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Merge fetched data with default structure to prevent undefined errors
        setUserData({ ...defaultUserData(), ...data });
      } else if (res.status === 401) {
        setToken(null); // Token expired or invalid
      }
    } catch (err) {
      console.error('Failed to load user data', err);
    }
    setIsLoaded(true);
  };

  const updateUserData = async (newData) => {
    // 1. Optimistic UI update (instantly updates screen)
    const updated = { ...userData, ...newData };
    setUserData(updated);

    // 2. Sync to backend
    try {
      await fetch(`${API_URL}/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Failed to sync data with server', err);
    }
  };

  const handleAuthResponse = (data) => {
    const user = { _id: data._id, email: data.email, role: data.role };
    setCurrentUser(user);
    setToken(data.token);
  };

  const logout = () => {
    setToken(null);
  };

  const contextValue = {
    API_URL, token, currentUser, userData, updateUserData,
    DAYS, PALETTE, handleAuthResponse, logout
  };

  if (!isLoaded) return null; // Or a loading spinner
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);