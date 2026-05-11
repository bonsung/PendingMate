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
import {
  LayoutDashboard, ListTodo, Users, BarChart3, Settings as SettingsIcon, Plus,
} from 'lucide-react';

const mobileNav = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'tasks',     label: '업무',     icon: ListTodo },
  { id: 'pics',      label: 'PIC',      icon: Users },
  { id: 'reports',   label: '보고서',   icon: BarChart3 },
  { id: 'settings',  label: '설정',     icon: SettingsIcon },
];

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
        {/* Sidebar: desktop only */}
        <Sidebar page={page} setPage={setPage} onNewTask={openNewTask} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {page === 'dashboard' && (
            <Dashboard onNewTask={openNewTask} onEditTask={openEditTask} setPage={setPage} />
          )}
          {page === 'tasks'    && <TaskList onNewTask={openNewTask} onEditTask={openEditTask} />}
          {page === 'pics'     && <PICManager />}
          {page === 'reports'  && <Reports />}
          {page === 'settings' && <Settings />}
        </main>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="fade-in w-full max-w-2xl">
              <TaskForm taskId={editingTaskId} onClose={closeTaskForm} />
            </div>
          </div>
        )}

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb]
                        flex items-center md:hidden z-40 h-14">
          <div className="flex items-center justify-around w-full px-1">
            {/* 앞 2개 */}
            {mobileNav.slice(0, 2).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                  ${page === id ? 'text-blue-600' : 'text-[#9ca3af]'}`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}

            {/* 중앙 + 버튼 */}
            <button onClick={openNewTask}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center
                         text-white shadow-lg -mt-5 active:scale-95 transition-all flex-shrink-0">
              <Plus size={22} />
            </button>

            {/* 뒤 3개 */}
            {mobileNav.slice(2).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                  ${page === id ? 'text-blue-600' : 'text-[#9ca3af]'}`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </DataProvider>
  );
}
