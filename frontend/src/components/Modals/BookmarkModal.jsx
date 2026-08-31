import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function BookmarkModal({ tabId, onClose }) {
  const { userData, updateUserData } = useAppContext();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  
  // 1. Safe fallback: default to empty array if backend bookmarkTabs is missing
  const bookmarkTabs = userData?.bookmarkTabs || [];
  const tab = bookmarkTabs.find(t => t.id === tabId);

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    const newBookmark = {
      id: `bm-${Date.now()}`,
      url: url.trim().slice(0, 300),
      title: title.trim().slice(0, 60) || url.trim()
    };

    const updatedTabs = bookmarkTabs.map(t => {
      if (t.id === tabId) {
        // 2. Safe fallback: ensure t.bookmarks is an array before spreading it
        const currentBookmarks = t.bookmarks || [];
        return { ...t, bookmarks: [...currentBookmarks, newBookmark] };
      }
      return t;
    });

    updateUserData({ bookmarkTabs: updatedTabs });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Add bookmark</h2>
        {/* Added a fallback heading just in case tab data hasn't loaded */}
        <p className="modal-subtitle">Add a link to "{tab?.heading || 'Tab'}"</p>
        <form onSubmit={handleSave}>
          <label className="field-label">URL</label>
          <input type="text" autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. wowevents.in" />
          
          <label className="field-label">Title</label>
          <input type="text" maxLength="60" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. WOW Events site" />
          
          <div className="modal-actions">
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