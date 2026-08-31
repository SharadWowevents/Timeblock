import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AuthScreen() {
  const { API_URL, handleAuthResponse } = useAppContext();
  
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isSetupMode ? '/auth/setup' : '/auth/login';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Authentication failed.');
      }

      handleAuthResponse(data);
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Timeblock</h1>
        <p className="auth-subtitle">
          {isSetupMode ? "Set up the admin account to get started." : "Log in to see your week."}
        </p>
        
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          
          <label className="field-label">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="field-error">{error}</p>}
          
          <button type="submit" className="btn btn-primary auth-submit">
            {isSetupMode ? 'Create admin account' : 'Log in'}
          </button>
        </form>

        <p style={{marginTop: '20px', fontSize: '13px', textAlign: 'center', color: 'var(--ink-muted)'}}>
          {isSetupMode ? "Already set up? " : "First time here? "}
          <button 
            type="button" 
            style={{background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600}}
            onClick={() => setIsSetupMode(!isSetupMode)}
          >
            {isSetupMode ? 'Log in' : 'Setup Admin'}
          </button>
        </p>
      </div>
    </div>
  );
}