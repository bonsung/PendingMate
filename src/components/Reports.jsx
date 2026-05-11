import React, { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { STATUS_LABEL, STATUS_CLASS } from '../db.js';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Download } from 'lucide-react';

export default function Reports() {
  const [selectedPicId, setSelectedPicId] = useState('all');
  const [period, setPeriod] = useState('all');

  const { tasks, pics } = useData();

  if (!tasks || !pics) return <div className="p-8 text-[#9ca3af]">로딩중...</div>;

  const picMap = Object.fromEntries(pics.map(p => [p.id, p]));
  const now = new Date();

  const filterByPeriod = (task) => {
    if (period === 'all') return true;
    if (!task.updatedAt) return false;
    const d = new Date(task.updatedAt);
    if (period === 'this_month')
      return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (period === 'last_month')
      return isWithinInterval(d, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
    return true;
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedPicId !== 'all' && String(t.picId) !== selectedPicId) return false;
    return filterByPeriod(t);
  });

  const picGroups = selectedPicId === 'all'
    ? pics.map(pic => ({ pic, tasks: filteredTasks.filter(t => t.picId === pic.id) }))
        .filter(g => g.tasks.length > 0)
    : [{ pic: picMap[Number(selectedPicId)], tasks: filteredTasks }];

  const handleExport = () => {
    const lines = [];
    const periodLabel = period === 'all' ? '전체' :
      period === 'this_month' ? format(now, 'yyyy년 M월') :
      format(new Date(now.getFullYear(), now.getMonth() - 1), 'yyyy년 M월');

    lines.push('PendingMate 업무 보고서');
    lines.push(`생성일: ${format(now, 'yyyy-MM-dd HH:mm')}`);
    lines.push(`기간: ${periodLabel}`);
    lines.push('='.repeat(50));

    picGroups.forEach(({ pic, tasks: grpTasks }) => {
      if (!pic) return;
      const clear = grpTasks.filter(t => t.status === 'clear').length;
      const drop = grpTasks.filter(t => t.status === 'drop').length;
      const ongoing = grpTasks.filter(t => t.status === 'ongoing').length;
      const hold = grpTasks.filter(t => t.status === 'hold').length;
      const clearRate = grpTasks.length > 0 ? Math.round(clear / grpTasks.length * 100) : 0;
      lines.push(`\n[${pic.name}] ${pic.role}`);
      lines.push(`총 ${grpTasks.length}건 | Clear ${clear} | Drop ${drop} | 진행중 ${ongoing} | 보류 ${hold} | 달성률 ${clearRate}%`);
      lines.push('-'.repeat(40));
      grpTasks.forEach(t => {
        const date = t.validityDate ? format(new Date(t.validityDate), 'MM/dd') : '-';
        lines.push(`  [${STATUS_LABEL[t.status]}] ${t.title} (${date})`);
        if (t.content) lines.push(`    ${t.content.substring(0, 80)}`);
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PM보고서_${format(now, 'yyyyMMdd_HHmm')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#111827]">보고서</h1>
        <button onClick={handleExport} className="pm-btn-primary flex items-center gap-2">
          <Download size={14} />텍스트 내보내기
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={selectedPicId} onChange={e => setSelectedPicId(e.target.value)} className="pm-input w-auto">
          <option value="all">전체 PIC</option>
          {pics.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="pm-input w-auto">
          <option value="all">전체 기간</option>
          <option value="this_month">이번 달</option>
          <option value="last_month">지난 달</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '전체', value: filteredTasks.length, color: 'text-[#111827]' },
          { label: 'Clear', value: filteredTasks.filter(t => t.status === 'clear').length, color: 'text-emerald-600' },
          { label: 'Drop', value: filteredTasks.filter(t => t.status === 'drop').length, color: 'text-red-600' },
          {
            label: '달성률',
            value: filteredTasks.length > 0
              ? `${Math.round(filteredTasks.filter(t => t.status === 'clear').length / filteredTasks.length * 100)}%`
              : '0%',
            color: 'text-blue-600',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="pm-card p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#9ca3af] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* PIC Reports */}
      {picGroups.length === 0 ? (
        <div className="pm-card p-12 text-center text-[#9ca3af]">해당 기간에 업무가 없습니다</div>
      ) : (
        <div className="space-y-4">
          {picGroups.map(({ pic, tasks: grpTasks }) => {
            if (!pic) return null;
            const clear = grpTasks.filter(t => t.status === 'clear').length;
            const drop = grpTasks.filter(t => t.status === 'drop').length;
            const ongoing = grpTasks.filter(t => t.status === 'ongoing').length;
            const clearRate = grpTasks.length > 0 ? Math.round(clear / grpTasks.length * 100) : 0;

            return (
              <div key={pic.id} className="pm-card p-4">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#e5e7eb]">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center
                                  text-blue-600 font-bold text-sm">
                    {pic.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111827]">{pic.name}</span>
                      <span className="text-xs text-[#9ca3af]">{pic.role}</span>
                    </div>
                    <div className="flex gap-3 text-xs mt-0.5">
                      <span className="text-[#6b7280]">총 {grpTasks.length}건</span>
                      <span className="text-emerald-600">Clear {clear}</span>
                      <span className="text-red-600">Drop {drop}</span>
                      <span className="text-blue-600">진행 {ongoing}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">{clearRate}%</div>
                    <div className="text-xs text-[#9ca3af]">달성률</div>
                  </div>
                </div>

                <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${clearRate}%` }} />
                </div>

                <div className="space-y-1.5">
                  {grpTasks.map(t => (
                    <div key={t.id}
                      className="flex items-center gap-3 p-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_CLASS[t.status]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                      <span className="flex-1 text-sm text-[#111827] truncate">{t.title}</span>
                      {t.validityDate && (
                        <span className="text-xs text-[#9ca3af] flex-shrink-0">
                          {format(new Date(t.validityDate), 'MM/dd')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
