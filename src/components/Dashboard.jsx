import React from 'react';
import { useData } from '../DataContext.jsx';
import { STATUS_LABEL, STATUS_CLASS } from '../db.js';
import { format, isPast, differenceInHours } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, PauseCircle, AlertTriangle, Plus } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="pm-card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={17} />
      </div>
      <div>
        <div className="text-xl font-bold text-[#111827]">{value ?? 0}</div>
        <div className="text-xs text-[#6b7280]">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNewTask, onEditTask, setPage }) {
  const { tasks, pics } = useData();

  if (!tasks || !pics) return <div className="p-8 text-[#9ca3af]">로딩중...</div>;

  const picMap = Object.fromEntries(pics.map(p => [p.id, p]));
  const now = new Date();

  const stats = {
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    clear:   tasks.filter(t => t.status === 'clear').length,
    drop:    tasks.filter(t => t.status === 'drop').length,
    hold:    tasks.filter(t => t.status === 'hold').length,
  };

  const urgent = tasks.filter(t => {
    if (t.status !== 'ongoing' || !t.validityDate) return false;
    const v = new Date(t.validityDate);
    return v >= now && differenceInHours(v, now) <= 5;
  });

  const overdue = tasks.filter(t => {
    if (t.status !== 'ongoing' || !t.validityDate) return false;
    return isPast(new Date(t.validityDate));
  });

  const upcomingTasks = tasks
    .filter(t => t.status === 'ongoing' && t.validityDate && !isPast(new Date(t.validityDate)))
    .sort((a, b) => new Date(a.validityDate) - new Date(b.validityDate))
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#111827]">대시보드</h1>
          <p className="text-[#6b7280] text-xs md:text-sm mt-0.5">
            {format(now, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </p>
        </div>
        <button onClick={onNewTask} className="pm-btn-primary hidden md:flex items-center gap-2">
          <Plus size={14} />새 업무
        </button>
      </div>

      {/* Stats: 2열(모바일) / 4열(데스크탑) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard label="진행중" value={stats.ongoing} icon={Clock}        color="bg-blue-50 text-blue-600" />
        <StatCard label="Clear"  value={stats.clear}   icon={CheckCircle}  color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Drop"   value={stats.drop}    icon={XCircle}      color="bg-red-50 text-red-600" />
        <StatCard label="보류"   value={stats.hold}    icon={PauseCircle}  color="bg-amber-50 text-amber-600" />
      </div>

      {/* Urgent & Overdue */}
      {(urgent.length > 0 || overdue.length > 0) && (
        <div className="space-y-2">
          {overdue.length > 0 && (
            <div className="pm-card border-red-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-500" />
                <span className="text-red-600 text-sm font-medium">기한 초과 ({overdue.length}건)</span>
              </div>
              <div className="space-y-2">
                {overdue.map(t => (
                  <div key={t.id} onClick={() => onEditTask(t.id)}
                    className="flex items-start justify-between p-2 bg-red-50 rounded-lg
                               cursor-pointer hover:bg-red-100 transition-all gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-[#111827] truncate">{t.title}</div>
                      <div className="text-xs text-[#6b7280]">PIC: {picMap[t.picId]?.name || '미지정'}</div>
                      {t.result && (
                        <div className="text-xs text-emerald-700 mt-0.5 truncate">결과: {t.result}</div>
                      )}
                    </div>
                    <div className="text-xs text-red-600 flex-shrink-0">
                      {format(new Date(t.validityDate), 'M/d HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {urgent.length > 0 && (
            <div className="pm-card border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-500" />
                <span className="text-amber-600 text-sm font-medium">마감 5시간 이내 ({urgent.length}건)</span>
              </div>
              <div className="space-y-2">
                {urgent.map(t => (
                  <div key={t.id} onClick={() => onEditTask(t.id)}
                    className="flex items-start justify-between p-2 bg-amber-50 rounded-lg
                               cursor-pointer hover:bg-amber-100 transition-all gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-[#111827] truncate">{t.title}</div>
                      <div className="text-xs text-[#6b7280]">PIC: {picMap[t.picId]?.name || '미지정'}</div>
                      {t.result && (
                        <div className="text-xs text-emerald-700 mt-0.5 truncate">결과: {t.result}</div>
                      )}
                    </div>
                    <div className="text-xs text-amber-600 flex-shrink-0">
                      {differenceInHours(new Date(t.validityDate), now)}시간 후
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tasks */}
      <div className="pm-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">진행중 업무 (마감 순)</h2>
          <button onClick={() => setPage('tasks')} className="text-xs text-blue-600 hover:text-blue-500">
            전체보기 →
          </button>
        </div>
        {upcomingTasks.length === 0 ? (
          <div className="text-center text-[#9ca3af] py-6 text-sm">진행중인 업무가 없습니다</div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map(t => {
              const pic = picMap[t.picId];
              const hoursLeft = differenceInHours(new Date(t.validityDate), now);
              return (
                <div key={t.id} onClick={() => onEditTask(t.id)}
                  className="flex items-start gap-3 p-3 bg-[#f9fafb] rounded-lg
                             cursor-pointer hover:bg-[#f3f4f6] transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#111827] group-hover:text-blue-600 transition-colors truncate">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#6b7280] mt-0.5">
                      PIC: {pic?.name || '미지정'} · {pic?.role || ''}
                    </div>
                    {t.result && (
                      <div className="text-xs text-emerald-700 mt-0.5 truncate">결과: {t.result}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs ${hoursLeft <= 24 ? 'text-amber-600' : 'text-[#6b7280]'}`}>
                      {format(new Date(t.validityDate), 'M/d HH:mm')}
                    </div>
                    <div className="text-xs text-[#9ca3af]">
                      {hoursLeft < 24 ? `${hoursLeft}시간 후` : `${Math.floor(hoursLeft / 24)}일 후`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PIC Summary */}
      <div className="pm-card p-4">
        <h2 className="text-sm font-semibold text-[#111827] mb-4">PIC별 진행중 업무</h2>
        <div className="space-y-3">
          {pics.map(pic => {
            const picTasks = tasks.filter(t => t.picId === pic.id);
            const ongoingTasks = picTasks.filter(t => t.status === 'ongoing');
            const clearTasks  = picTasks.filter(t => t.status === 'clear');
            const total = picTasks.length;
            const clearRate = total > 0 ? Math.round((clearTasks.length / total) * 100) : 0;
            return (
              <div key={pic.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center
                                text-blue-600 text-xs font-bold flex-shrink-0">
                  {pic.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#111827] truncate">{pic.name}</span>
                    <span className="text-xs text-[#6b7280] ml-2 flex-shrink-0">진행중 {ongoingTasks.length}건</span>
                  </div>
                  <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${clearRate}%` }} />
                  </div>
                </div>
                <span className="text-xs text-[#6b7280] w-10 text-right flex-shrink-0">{clearRate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
