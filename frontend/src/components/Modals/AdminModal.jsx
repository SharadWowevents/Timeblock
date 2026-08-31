import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AdminModal({ onClose }) {
  const { API_URL, token } = useAppContext();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        setError('Network error: Could not load users');
      }
    };
    fetchUsers();
  }, [API_URL, token]);

  const handleDeleteUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Remove the user from the UI state
        setUsers(users.filter(u => u._id !== id));
      } else {
        // The backend will send an error if you try to delete yourself or the last admin
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error: Could not connect to server');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Failed to create user');
      }

      // Add the new user to state. We inject Date.now() because the backend POST 
      // response doesn't return the createdAt field immediately.
      setUsers([...users, { ...data, createdAt: Date.now() }]);
      
      // Reset form
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (err) {
      setError('Network error: Could not connect to server');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal admin-modal">
        <h2>Manage users</h2>
        <p className="modal-subtitle">Create a login for anyone who should have their own timetable.</p>
        
        <ul className="user-list">
          {users.map(u => (
            <li key={u._id} className="user-row">
              <div className="user-row-info">
                <div className="user-row-email">{u.email}</div>
                {/* Restored the "Added on" meta text to match original UI */}
                <div className="user-row-meta">
                  Added {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="role-badge">{u.role}</span>
              <button className="user-row-delete" onClick={() => handleDeleteUser(u._id)} title="Delete user">×</button>
            </li>
          ))}
        </ul>
        
        <div className="admin-divider"></div>
        
        <form onSubmit={handleAddUser}>
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
          
          <label className="field-label">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6}/>
          
          <label className="field-label">Role</label>
          <div className="role-radio-group">
            <label className="role-radio">
              <input type="radio" name="role" value="user" checked={role === 'user'} onChange={e => setRole(e.target.value)} /> User
            </label>
            <label className="role-radio">
              <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={e => setRole(e.target.value)} /> Admin
            </label>
          </div>
          
          {error && <p className="field-error">{error}</p>}
          
          <div className="modal-actions">
            <div className="modal-actions-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary">Add user</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}