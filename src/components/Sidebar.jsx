import React, { useMemo } from 'react';
import { LayoutDashboard, ListTodo, Users, BarChart3, Settings, Plus, Clock } from 'lucide-react';
import { useData } from '../DataContext.jsx';

const nav = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'tasks', label: '업무 목록', icon: ListTodo },
  { id: 'pics', label: 'PIC 관리', icon: Users },
  { id: 'reports', label: '보고서', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: Settings },
];

export default function Sidebar({ page, setPage, onNewTask }) {
  const { tasks } = useData();

  const now = new Date();
  const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);

  const ongoingCount = useMemo(
    () => tasks?.filter(t => t.status === 'ongoing').length || 0,
    [tasks]
  );

  const urgentCount = useMemo(
    () => tasks?.filter(t => {
      if (t.status !== 'ongoing' || !t.validityDate) return false;
      const v = new Date(t.validityDate);
      return v <= fiveHoursLater && v >= now;
    }).length || 0,
    [tasks]
  );

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[#111827] font-semibold text-sm tracking-wide">PendingMate</div>
            <div className="text-[#9ca3af] text-xs">JP 업무관리</div>
          </div>
        </div>
      </div>

      {/* New Task Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onNewTask}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500
                     text-white px-3 py-2.5 rounded-lg text-sm font-medium
                     transition-all active:scale-95"
        >
          <Plus size={15} />
          <span>새 업무 등록</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm transition-all text-left relative
                        ${page === id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]'
                        }`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {id === 'tasks' && ongoingCount > 0 && (
              <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {ongoingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Urgent Alert */}
      {urgentCount > 0 && (
        <div className="mx-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg urgent-pulse">
          <div className="text-red-600 text-xs font-medium">⚠️ 마감 임박</div>
          <div className="text-red-500 text-xs mt-0.5">{urgentCount}건 5시간 이내 마감</div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#e5e7eb]">
        <div className="text-[#9ca3af] text-xs">v1.0 · Supabase</div>
      </div>
    </aside>
  );
}
