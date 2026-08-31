import React from 'react';
import { useAppContext } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import './index.css';

export default function App() {
  const { token, currentUser } = useAppContext();

  // If there is no token or user loaded, show Auth Screen
  if (!token || !currentUser) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}