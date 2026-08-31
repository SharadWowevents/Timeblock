import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext'; // 1. Import the provider
import './index.css'; // <-- Add this line!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap the App with the Provider */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);