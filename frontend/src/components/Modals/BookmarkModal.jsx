import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

// Accept an optional 'bookmark' prop
export default function BookmarkModal({ tabId, bookmark, onClose }) {
  const { userData, updateUserData } = useAppContext();
  
  // Initialize state with existing bookmark data if we are editing
  const [url, setUrl] = useState(bookmark ? bookmark.url : '');
  const [title, setTitle] = useState(bookmark ? bookmark.title : '');
  
  const bookmarkTabs = userData?.bookmarkTabs || [];
  const tab = bookmarkTabs.find(t => t.id === tabId);

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const updatedTabs = bookmarkTabs.map(t => {
      if (t.id === tabId) {
        const currentBookmarks = t.bookmarks || [];
        let newBookmarksArray;

        if (bookmark) {
          // EDIT MODE: Map over bookmarks, find the matching ID, and update it
          newBookmarksArray = currentBookmarks.map(b => 
            b.id === bookmark.id 
              ? { ...b, url: url.trim().slice(0, 300), title: title.trim().slice(0, 60) || url.trim() }
              : b
          );
        } else {
          // ADD MODE: Create a new bookmark object and append it
          const newBookmark = {
            id: `bm-${Date.now()}`,
            url: url.trim().slice(0, 300),
            title: title.trim().slice(0, 60) || url.trim()
          };
          newBookmarksArray = [...currentBookmarks, newBookmark];
        }

        return { ...t, bookmarks: newBookmarksArray };
      }
      return t;
    });

    updateUserData({ bookmarkTabs: updatedTabs });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Dynamically change headings based on mode */}
        <h2>{bookmark ? 'Edit bookmark' : 'Add bookmark'}</h2>
        <p className="modal-subtitle">
          {bookmark ? 'Update link in' : 'Add a link to'} "{tab?.heading || 'Tab'}"
        </p>
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