import React, { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { STATUS_LABEL, STATUS_CLASS } from '../db.js';
import { format, isPast, differenceInHours } from 'date-fns';
import { Search, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all',     label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'clear',   label: 'Clear' },
  { value: 'drop',    label: 'Drop' },
  { value: 'hold',    label: '보류' },
];

export default function TaskList({ onNewTask, onEditTask }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [picFilter, setPicFilter]       = useState('all');
  const [search, setSearch]             = useState('');

  const { tasks, pics, deleteTask } = useData();

  if (!tasks || !pics) return <div className="p-8 text-[#9ca3af]">로딩중...</div>;

  const picMap = Object.fromEntries(pics.map(p => [p.id, p]));

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (picFilter !== 'all' && String(t.picId) !== picFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.content?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
    if (b.status === 'ongoing' && a.status !== 'ongoing') return 1;
    if (a.validityDate && b.validityDate)
      return new Date(a.validityDate) - new Date(b.validityDate);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleDelete = async (id) => {
    if (!confirm('이 업무를 삭제하시겠습니까?')) return;
    await deleteTask(id);
  };

  const now = new Date();

  return (
    <div className="p-4 md:p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-bold text-[#111827]">업무 목록</h1>
        <button onClick={onNewTask} className="pm-btn-primary hidden md:flex items-center gap-2">
          <Plus size={14} />새 업무
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 md:mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="업무 검색..." className="pm-input pl-8" />
        </div>

        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                ${statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <select value={picFilter} onChange={e => setPicFilter(e.target.value)}
          className="pm-input sm:w-auto">
          <option value="all">전체 PIC</option>
          {pics.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
      </div>

      <div className="text-xs text-[#9ca3af] mb-3">총 {filtered.length}건</div>

      {/* 데스크탑: 테이블 / 모바일: 카드 */}
      {filtered.length === 0 ? (
        <div className="pm-card p-12 text-center text-[#9ca3af]">조건에 맞는 업무가 없습니다</div>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="pm-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    {['업무 제목', 'PIC', 'Validity', '달성도', '우선순위', ''].map(h => (
                      <th key={h} className="text-left text-xs text-[#6b7280] font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(task => {
                    const pic = picMap[task.picId];
                    const validity = task.validityDate ? new Date(task.validityDate) : null;
                    const isOverdue = validity && isPast(validity) && task.status === 'ongoing';
                    const isUrgent  = validity && !isPast(validity) && task.status === 'ongoing'
                      && differenceInHours(validity, now) <= 5;

                    return (
                      <tr key={task.id}
                        className="border-b border-[#e5e7eb] hover:bg-[#f9fafb] transition-all group">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            {isOverdue && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />}
                            {isUrgent  && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
                            <button onClick={() => onEditTask(task.id)}
                              className="text-sm text-[#111827] hover:text-blue-600 transition-colors text-left">
                              {task.title}
                            </button>
                          </div>
                          {task.content && (
                            <div className="text-xs text-[#9ca3af] mt-0.5 truncate">{task.content}</div>
                          )}
                          {task.result && (
                            <div className="text-xs text-emerald-700 mt-0.5 truncate">결과: {task.result}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {pic ? (
                            <div>
                              <div className="text-sm text-[#111827]">{pic.name}</div>
                              <div className="text-xs text-[#9ca3af]">{pic.role}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9ca3af]">미지정</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {validity ? (
                            <div>
                              <div className={`text-sm ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[#6b7280]'}`}>
                                {format(validity, 'MM/dd HH:mm')}
                              </div>
                              <div className="text-xs text-[#9ca3af]">
                                {isOverdue ? '기한초과' :
                                 isUrgent  ? `${differenceInHours(validity, now)}시간 후` :
                                 `${Math.floor(differenceInHours(validity, now) / 24)}일 후`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9ca3af]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_CLASS[task.status]}`}>
                            {STATUS_LABEL[task.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {task.priority === 'high' ? '🔴' : task.priority === 'normal' ? '🟡' : '🟢'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditTask(task.id)}
                              className="p-1.5 text-[#6b7280] hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className="space-y-2 md:hidden">
            {filtered.map(task => {
              const pic = picMap[task.picId];
              const validity = task.validityDate ? new Date(task.validityDate) : null;
              const isOverdue = validity && isPast(validity) && task.status === 'ongoing';
              const isUrgent  = validity && !isPast(validity) && task.status === 'ongoing'
                && differenceInHours(validity, now) <= 5;

              return (
                <div key={task.id} className="pm-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {isOverdue && <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />}
                      {isUrgent  && <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                      <button onClick={() => onEditTask(task.id)}
                        className="text-sm font-medium text-[#111827] text-left">
                        {task.title}
                      </button>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => onEditTask(task.id)}
                        className="p-1.5 text-[#6b7280] hover:text-blue-600 rounded">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-[#6b7280] hover:text-red-600 rounded">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {task.content && (
                    <div className="text-xs text-[#9ca3af] mb-1 line-clamp-2">{task.content}</div>
                  )}
                  {task.result && (
                    <div className="text-xs text-emerald-700 mb-2 line-clamp-2">결과: {task.result}</div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_CLASS[task.status]}`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                    {pic && (
                      <span className="text-xs text-[#6b7280]">{pic.name}</span>
                    )}
                    {validity && (
                      <span className={`text-xs ml-auto ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[#9ca3af]'}`}>
                        {format(validity, 'MM/dd HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
