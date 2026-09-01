import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TaskModal({ slot, onClose }) {
  const { userData, updateUserData, PALETTE } = useAppContext();
  const existingTask = slot.task || null;
  
  const [text, setText] = useState(existingTask ? existingTask.text : '');
  const [category, setCategory] = useState(existingTask ? existingTask.category || '' : '');
  
  // Safe fallbacks for backend data
  const categories = userData?.categories || [];
  const schedule = userData?.schedule || {};
  
  // New Category States
  const [newCategoryName, setNewCategoryName] = useState('');
  const usedColors = categories.map(c => c.color);
  const defaultColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[0];
  const [newCategoryColor, setNewCategoryColor] = useState(defaultColor);

  // Edit Existing Category States
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');

  const openCategoryEdit = () => {
    const target = categories.find(c => c.name === category);
    if (target) {
      setEditCatName(target.name);
      setEditCatColor(target.color);
      setIsEditingCategory(true);
    }
  };

  const handleDeleteCategory = () => {
    if (!window.confirm(`Delete category "${category}"? It will be removed from all tasks.`)) return;

    const updates = {};
    updates.categories = categories.filter(c => c.name !== category);

    // Deep copy schedule to clear this category from all days/times
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    Object.keys(newSchedule).forEach(day => {
      Object.keys(newSchedule[day]).forEach(time => {
        if (newSchedule[day][time].category === category) {
          newSchedule[day][time].category = '';
        }
      });
    });

    setCategory('');
    setIsEditingCategory(false);
    
    updates.schedule = newSchedule;
    updateUserData(updates); // Save immediately
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const updates = {};
    let finalCategory = category;
    
    // Use JSON deep copy to safely update multiple days/tasks if a category is renamed
    const newSchedule = JSON.parse(JSON.stringify(schedule));

    // Handle Creating a New Category
    if (category === '__new__') {
      const name = newCategoryName.trim().slice(0, 24);
      if (name) {
        const exists = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          finalCategory = exists.name;
        } else {
          updates.categories = [...categories, { name, color: newCategoryColor }];
          finalCategory = name;
        }
      } else {
        finalCategory = '';
      }
    } 
    // Handle Editing an Existing Category
    else if (isEditingCategory && category) {
      const newName = editCatName.trim().slice(0, 24) || category;
      
      updates.categories = categories.map(c => 
        c.name === category ? { name: newName, color: editCatColor } : c
      );

      // Update all existing tasks that used the old category name
      Object.keys(newSchedule).forEach(day => {
        Object.keys(newSchedule[day]).forEach(time => {
          if (newSchedule[day][time].category === category) {
            newSchedule[day][time].category = newName;
          }
        });
      });

      finalCategory = newName;
    }

    // Apply the current task changes
    if (!newSchedule[slot.day]) newSchedule[slot.day] = {};
    newSchedule[slot.day][slot.time] = { text: text.trim().slice(0, 60), category: finalCategory };
    
    updates.schedule = newSchedule;
    
    // Batch save everything to backend
    updateUserData(updates);
    onClose();
  };

  const handleDeleteTask = () => {
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', marginBottom: '6px' }}>
            <label className="field-label" style={{ margin: 0 }}>Category</label>
            {category && category !== '__new__' && !isEditingCategory && (
              <button type="button" onClick={openCategoryEdit} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                Edit Category
              </button>
            )}
          </div>
          
          <select value={category} onChange={e => { setCategory(e.target.value); setIsEditingCategory(false); }} disabled={isEditingCategory}>
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
            <option value="__new__">+ Add new category...</option>
          </select>

          {/* CREATE NEW CATEGORY UI */}
          {category === '__new__' && (
            <div style={{marginTop: '8px', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border-strong)'}}>
              <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} maxLength="24" placeholder="New category name" />
              <p className="field-hint">Pick a color:</p>
              <div className="swatch-row">
                {PALETTE.map(c => (
                  <button key={c} type="button" className={`swatch-btn ${c === newCategoryColor ? 'selected' : ''}`} style={{'--cat-c': c}} onClick={() => setNewCategoryColor(c)} />
                ))}
              </div>
            </div>
          )}

          {/* EDIT EXISTING CATEGORY UI */}
          {isEditingCategory && category !== '__new__' && (
            <div style={{marginTop: '8px', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border-strong)'}}>
              <label className="field-label" style={{marginTop: 0}}>Rename Category</label>
              <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} maxLength="24" />
              <p className="field-hint">Change color:</p>
              <div className="swatch-row">
                {PALETTE.map(c => (
                  <button key={c} type="button" className={`swatch-btn ${c === editCatColor ? 'selected' : ''}`} style={{'--cat-c': c}} onClick={() => setEditCatColor(c)} />
                ))}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
                <button type="button" className="btn btn-ghost-danger" style={{padding: '4px 8px', fontSize: '12.5px', marginLeft: '-8px'}} onClick={handleDeleteCategory}>
                  Delete Category
                </button>
                <button type="button" className="btn btn-secondary" style={{padding: '6px 10px', fontSize: '12.5px'}} onClick={() => setIsEditingCategory(false)}>
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          <div className="modal-actions" style={{justifyContent: existingTask ? 'space-between' : 'flex-end', marginTop: '28px'}}>
            {existingTask && <button type="button" className="btn btn-ghost-danger" style={{marginLeft: '-8px'}} onClick={handleDeleteTask}>Delete Task</button>}
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