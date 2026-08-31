import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TaskModal({ slot, onClose }) {
  const { userData, updateUserData, PALETTE } = useAppContext();
  const existingTask = slot.task || null;
  
  const [text, setText] = useState(existingTask ? existingTask.text : '');
  const [category, setCategory] = useState(existingTask ? existingTask.category || '' : '');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // 1. Safe fallbacks: Default to empty array/object if backend data is momentarily missing
  const categories = userData?.categories || [];
  const schedule = userData?.schedule || {};
  
  // Pick next unused color for new category safely using the fallback
  const usedColors = categories.map(c => c.color);
  const defaultColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[0];
  const [newCategoryColor, setNewCategoryColor] = useState(defaultColor);

  const handleSave = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    let finalCategory = category;

    if (category === '__new__') {
      const name = newCategoryName.trim().slice(0, 24);
      if (name) {
        const exists = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          finalCategory = exists.name;
        } else {
          updateUserData({ 
            categories: [...categories, { name, color: newCategoryColor }] 
          });
          finalCategory = name;
        }
      } else {
        finalCategory = '';
      }
    }

    // 2. Safe fallback: Ensure the schedule object and the specific day exist before mutating
    const newSchedule = { ...schedule };
    if (!newSchedule[slot.day]) {
      newSchedule[slot.day] = {};
    }
    
    newSchedule[slot.day][slot.time] = { text: text.trim().slice(0, 60), category: finalCategory };
    
    updateUserData({ schedule: newSchedule });
    onClose();
  };

  const handleDelete = () => {
    const newSchedule = { ...schedule };
    if (newSchedule[slot.day]) {
      delete newSchedule[slot.day][slot.time];
    }
    updateUserData({ schedule: newSchedule });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{existingTask ? 'Edit task' : 'Add task'}</h2>
        <p className="modal-subtitle">{slot.day} · {slot.time}</p>
        
        <form onSubmit={handleSave}>
          <label className="field-label">Task</label>
          <input type="text" autoFocus value={text} onChange={e => setText(e.target.value)} maxLength="60" placeholder="e.g. Gym, Team standup" required />
          
          <label className="field-label">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">No category</option>
            {/* Map over the safely defaulted categories array */}
            {categories.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
            <option value="__new__">+ Add new category...</option>
          </select>

          {category === '__new__' && (
            <div style={{marginTop: '8px'}}>
              <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} maxLength="24" placeholder="New category name" />
              <p className="field-hint">Pick a color:</p>
              <div className="swatch-row">
                {PALETTE.map(c => (
                  <button key={c} type="button" className={`swatch-btn ${c === newCategoryColor ? 'selected' : ''}`} style={{'--cat-c': c}} onClick={() => setNewCategoryColor(c)} />
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions" style={{justifyContent: existingTask ? 'space-between' : 'flex-end'}}>
            {existingTask && <button type="button" className="btn btn-ghost-danger" onClick={handleDelete}>Delete</button>}
            <div className="modal-actions-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}