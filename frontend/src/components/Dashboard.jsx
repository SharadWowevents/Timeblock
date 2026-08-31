import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ScheduleGrid from './Schedule/ScheduleGrid';
import TodoPanel from './Todos/TodoPanel';
import BookmarksList from './Bookmarks/BookmarksList';
import Header from './Header';
import AdminModal from './Modals/AdminModal';

export default function Dashboard() {
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onManageUsers={() => setAdminModalOpen(true)} />
      
      <main className="layout">
        <ScheduleGrid />
        <TodoPanel />
      </main>

      <BookmarksList />

      {isAdminModalOpen && <AdminModal onClose={() => setAdminModalOpen(false)} />}
    </div>
  );
}