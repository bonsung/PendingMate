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
      {/* 메인 레이아웃 - overflow-hidden 컨테이너 */}
      <div className="flex h-screen overflow-hidden bg-[#f5f6f8]">
        {/* Sidebar: desktop only */}
        <Sidebar page={page} setPage={setPage} onNewTask={openNewTask} />

        {/* Main content: pb-[72px]로 하단 탭바에 가리지 않도록 */}
        <main className="flex-1 overflow-y-auto pb-[72px] md:pb-0">
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
      </div>

      {/* Mobile Bottom Tab Bar
          overflow-hidden 컨테이너 밖에 배치 → 모든 페이지에서 항상 표시 */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="flex items-center justify-around w-full px-1">
          {/* 앞 2개 */}
          {mobileNav.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all flex-1
                ${page === id ? 'text-blue-600' : 'text-[#9ca3af]'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}

          {/* 중앙 + 버튼 */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button onClick={openNewTask}
              style={{ marginTop: '-20px' }}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center
                         text-white shadow-lg active:scale-95 transition-all flex-shrink-0">
              <Plus size={22} />
            </button>
          </div>

          {/* 뒤 3개 */}
          {mobileNav.slice(2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all flex-1
                ${page === id ? 'text-blue-600' : 'text-[#9ca3af]'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </DataProvider>
  );
}
