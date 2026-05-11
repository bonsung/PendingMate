import React, { useState } from 'react';
import { DataProvider } from './DataContext.jsx';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import TaskList from './components/TaskList.jsx';
import TaskForm from './components/TaskForm.jsx';
import PICManager from './components/PICManager.jsx';
import Reports from './components/Reports.jsx';
import Settings from './components/Settings.jsx';

export default function App() {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem('pm_auth') === 'true'
  );
  const [page, setPage] = useState('dashboard');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const openNewTask = () => { setEditingTaskId(null); setShowTaskForm(true); };
  const openEditTask = (id) => { setEditingTaskId(id); setShowTaskForm(true); };
  const closeTaskForm = () => { setShowTaskForm(false); setEditingTaskId(null); };

  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden bg-[#f5f6f8]">
        <Sidebar page={page} setPage={setPage} onNewTask={openNewTask} />

        <main className="flex-1 overflow-y-auto">
          {page === 'dashboard' && (
            <Dashboard onNewTask={openNewTask} onEditTask={openEditTask} setPage={setPage} />
          )}
          {page === 'tasks' && (
            <TaskList onNewTask={openNewTask} onEditTask={openEditTask} />
          )}
          {page === 'pics' && <PICManager />}
          {page === 'reports' && <Reports />}
          {page === 'settings' && <Settings />}
        </main>

        {showTaskForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="fade-in w-full max-w-2xl">
              <TaskForm taskId={editingTaskId} onClose={closeTaskForm} />
            </div>
          </div>
        )}
      </div>
    </DataProvider>
  );
}
