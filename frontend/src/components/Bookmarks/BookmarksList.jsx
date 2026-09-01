import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import BookmarkModal from '../Modals/BookmarkModal';

export default function BookmarksList() {
  const { userData, updateUserData } = useAppContext();
  const [editingTabId, setEditingTabId] = useState(null);
  const [editHeadingVal, setEditHeadingVal] = useState('');
  const [activeModalTab, setActiveModalTab] = useState(null);
  const [editingBookmark, setEditingBookmark] = useState(null); // Add this line

  // Fallback to empty array to prevent crashes if DB returns undefined
  const bookmarkTabs = userData?.bookmarkTabs || [];

  const addTab = () => {
    const newTab = { id: `bt-${Date.now()}`, heading: 'New tab', bookmarks: [] };
    updateUserData({ bookmarkTabs: [...bookmarkTabs, newTab] });
  };

  const deleteTab = (tabId) => {
    updateUserData({ bookmarkTabs: bookmarkTabs.filter(t => t.id !== tabId) });
  };

  const deleteBookmark = (tabId, bmId) => {
    const updatedTabs = bookmarkTabs.map(tab => {
      if (tab.id === tabId) {
        // Fallback for bookmarks array inside the tab as well
        const currentBookmarks = tab.bookmarks || [];
        return { ...tab, bookmarks: currentBookmarks.filter(b => b.id !== bmId) };
      }
      return tab;
    });
    updateUserData({ bookmarkTabs: updatedTabs });
  };

  const handleEditSave = (tabId) => {
    const val = editHeadingVal.trim().slice(0, 40);
    const updatedTabs = bookmarkTabs.map(tab => {
      if (tab.id === tabId) {
        return { ...tab, heading: val || tab.heading };
      }
      return tab;
    });
    updateUserData({ bookmarkTabs: updatedTabs });
    setEditingTabId(null);
  };

  const getFavicon = (url) => {
    if (!url) return '';
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <section className="bookmarks-section">
      <div className="bookmarks-header">
        <h2>Bookmarks</h2>
        <button type="button" className="btn btn-secondary" onClick={addTab}>+ Add tab</button>
      </div>

      <div className="bookmarks-grid">
        {bookmarkTabs.length === 0 ? (
          <p className="empty-note">No bookmark tabs yet — add one to save links you use often.</p>
        ) : (
          bookmarkTabs.map(tab => (
            <div key={tab.id} className="bookmark-card">
              <div className="bookmark-card-header">
                {editingTabId === tab.id ? (
                  <input
                    type="text"
                    className="bookmark-heading-input"
                    autoFocus
                    value={editHeadingVal}
                    onChange={(e) => setEditHeadingVal(e.target.value)}
                    onBlur={() => handleEditSave(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                  />
                ) : (
                  <h3
                    className="bookmark-heading"
                    tabIndex="0"
                    onClick={() => { setEditingTabId(tab.id); setEditHeadingVal(tab.heading); }}
                  >
                    {tab.heading}
                  </h3>
                )}
                <button className="bookmark-tab-delete" onClick={() => deleteTab(tab.id)}>×</button>
              </div>

              <ul className="bookmark-list">
                {(tab.bookmarks || []).map(b => (
                  <li key={b.id} className="bookmark-row">
                    <img
                      className="bookmark-favicon"
                      src={getFavicon(b.url)}
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="bookmark-favicon bookmark-favicon-fallback" style={{ display: 'none' }}></span>
                    <a className="bookmark-title" href={b.url.startsWith('http') ? b.url : `https://${b.url}`} target="_blank" rel="noopener noreferrer">
                      {b.title}
                    </a>
                    <button
                      className="bookmark-delete"
                      onClick={() => { setActiveModalTab(tab.id); setEditingBookmark(b); }}
                      style={{ fontSize: '13px', marginRight: '4px' }}
                    >
                      ✎
                    </button>
                    <button className="bookmark-delete" onClick={() => deleteBookmark(tab.id, b.id)}>×</button>
                  </li>
                ))}
              </ul>

              <button className="btn btn-secondary bookmark-add-btn" onClick={() => setActiveModalTab(tab.id)}>+ Add bookmark</button>
            </div>
          ))
        )}
      </div>

      {activeModalTab && (
        <BookmarkModal
          tabId={activeModalTab}
          bookmark={editingBookmark}
          onClose={() => {
            setActiveModalTab(null);
            setEditingBookmark(null);
          }}
        />
      )}
    </section>
  );
}