import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TodoPanel() {
  const { userData, updateUserData } = useAppContext();
  const [inputValue, setInputValue] = useState('');

  // Safe fallback for backend data
  const todos = userData?.todos || [];

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newTodo = { id: `td-${Date.now()}`, text: inputValue.trim(), done: false };
    updateUserData({ todos: [...todos, newTodo] });
    setInputValue('');
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    updateUserData({ todos: updated });
  };

  const deleteTodo = (id) => {
    updateUserData({ todos: todos.filter(t => t.id !== id) });
  };

  const sortedTodos = [...todos].sort((a, b) => a.done === b.done ? 0 : a.done ? 1 : -1);

  return (
    <aside className="todo-panel">
      <div className="todo-header">
        <h2>To-do</h2>
        <span className="todo-count">{todos.filter(t => !t.done).length}</span>
      </div>
      <form id="todo-form" onSubmit={addTodo}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          placeholder="One-off task…" 
          maxLength="120" 
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      
      {sortedTodos.length === 0 ? (
        <p className="empty-note">Nothing here yet — add a one-off task above.</p>
      ) : (
        <ul className="todo-list">
          {sortedTodos.map(t => (
            <li key={t.id} className={`todo-item ${t.done ? 'done' : ''}`}>
              <label className="todo-check">
                <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                <span className="todo-text">{t.text}</span>
              </label>
              <button type="button" className="todo-delete" onClick={() => deleteTodo(t.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}