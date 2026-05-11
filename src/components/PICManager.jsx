import React, { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { STATUS_LABEL, STATUS_CLASS } from '../db.js';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function PICForm({ pic, onSave, onCancel, addPic, updatePic }) {
  const [form, setForm] = useState({
    name:  pic?.name  || '',
    role:  pic?.role  || '',
    email: pic?.email || '',
    phone: pic?.phone || '',
    memo:  pic?.memo  || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return alert('이름을 입력해주세요');
    pic?.id ? await updatePic(pic.id, form) : await addPic(form);
    onSave();
  };

  return (
    <div className="pm-card p-4 space-y-3 fade-in">
      <h3 className="text-sm font-medium text-[#111827]">{pic ? 'PIC 수정' : '새 PIC 등록'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#6b7280] mb-1 block">이름 *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="홍길동" className="pm-input" />
        </div>
        <div>
          <label className="text-xs text-[#6b7280] mb-1 block">소속/역할</label>
          <input value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="영업팀 과장" className="pm-input" />
        </div>
        <div>
          <label className="text-xs text-[#6b7280] mb-1 block">이메일</label>
          <input value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="email@company.com" className="pm-input" />
        </div>
        <div>
          <label className="text-xs text-[#6b7280] mb-1 block">연락처</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="010-0000-0000" className="pm-input" />
        </div>
      </div>
      <div>
        <label className="text-xs text-[#6b7280] mb-1 block">메모</label>
        <input value={form.memo} onChange={e => set('memo', e.target.value)}
          placeholder="특이사항, 참고사항" className="pm-input" />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="pm-btn-ghost flex-1">취소</button>
        <button onClick={handleSave} className="pm-btn-primary flex-1">저장</button>
      </div>
    </div>
  );
}

export default function PICManager() {
  const [showForm, setShowForm]     = useState(false);
  const [editingPic, setEditingPic] = useState(null);
  const [selectedPic, setSelectedPic] = useState(null);

  const { pics, tasks, addPic, updatePic, deletePic } = useData();

  const handleDelete = async (id) => {
    const taskCount = tasks?.filter(t => t.picId === id).length || 0;
    if (taskCount > 0 &&
        !confirm(`이 PIC에게 배정된 업무 ${taskCount}건이 있습니다. 그래도 삭제하시겠습니까?`)) return;
    await deletePic(id);
    if (selectedPic?.id === id) setSelectedPic(null);
  };

  const picTasks = selectedPic && tasks
    ? tasks.filter(t => t.picId === selectedPic.id)
    : [];

  return (
    <div className="p-4 md:p-6 fade-in">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-bold text-[#111827]">PIC 관리</h1>
        <button onClick={() => { setShowForm(true); setEditingPic(null); }}
          className="pm-btn-primary flex items-center gap-2">
          <Plus size={14} />PIC 추가
        </button>
      </div>

      {(showForm || editingPic) && (
        <div className="mb-4">
          <PICForm pic={editingPic} addPic={addPic} updatePic={updatePic}
            onSave={() => { setShowForm(false); setEditingPic(null); }}
            onCancel={() => { setShowForm(false); setEditingPic(null); }} />
        </div>
      )}

      {/* 모바일: 1열 / 데스크탑: 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PIC 목록 */}
        <div className="md:col-span-1 space-y-2">
          {(!pics || pics.length === 0) ? (
            <div className="pm-card p-8 text-center text-[#9ca3af] text-sm">등록된 PIC가 없습니다</div>
          ) : (
            pics.map(pic => {
              const picTaskList = tasks?.filter(t => t.picId === pic.id) || [];
              const ongoing  = picTaskList.filter(t => t.status === 'ongoing').length;
              const clear    = picTaskList.filter(t => t.status === 'clear').length;
              const clearRate = picTaskList.length > 0
                ? Math.round(clear / picTaskList.length * 100) : 0;
              const isSelected = selectedPic?.id === pic.id;

              return (
                <div key={pic.id}
                  onClick={() => setSelectedPic(isSelected ? null : pic)}
                  className={`pm-card p-3.5 cursor-pointer transition-all
                    ${isSelected ? 'border-blue-400 bg-blue-50' : 'hover:border-[#d1d5db]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center
                                      text-blue-600 text-xs font-bold flex-shrink-0">
                        {pic.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#111827] truncate">{pic.name}</div>
                        <div className="text-xs text-[#9ca3af] truncate">{pic.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setEditingPic(pic); setShowForm(false); }}
                        className="p-1 text-[#9ca3af] hover:text-blue-600 rounded">
                        <Pencil size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(pic.id); }}
                        className="p-1 text-[#9ca3af] hover:text-red-600 rounded">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                    <span>총 {picTaskList.length}건</span>
                    <span>·</span>
                    <span className="text-blue-600">진행 {ongoing}</span>
                    <span>·</span>
                    <span className="text-emerald-600">달성 {clearRate}%</span>
                  </div>
                  <div className="mt-2 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${clearRate}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PIC 상세 */}
        <div className="md:col-span-2">
          {!selectedPic ? (
            <div className="pm-card p-12 text-center text-[#9ca3af] hidden md:block">
              PIC를 선택하면 업무 내역을 확인할 수 있습니다
            </div>
          ) : (
            <div className="pm-card p-4 fade-in">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e5e7eb]">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center
                                text-blue-600 font-bold flex-shrink-0">
                  {selectedPic.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[#111827]">{selectedPic.name}</div>
                  <div className="text-xs text-[#6b7280] truncate">
                    {selectedPic.role} {selectedPic.email && `· ${selectedPic.email}`}
                  </div>
                  {selectedPic.memo && (
                    <div className="text-xs text-[#9ca3af] mt-0.5">{selectedPic.memo}</div>
                  )}
                </div>
              </div>

              {picTasks.length === 0 ? (
                <div className="text-center text-[#9ca3af] py-8 text-sm">배정된 업무가 없습니다</div>
              ) : (
                <div className="space-y-2">
                  {picTasks
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .map(t => (
                    <div key={t.id}
                      className="flex items-start gap-3 p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_CLASS[t.status]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#111827]">{t.title}</div>
                        {t.content && (
                          <div className="text-xs text-[#9ca3af] mt-0.5 truncate">{t.content}</div>
                        )}
                        {t.result && (
                          <div className="text-xs text-emerald-700 mt-0.5 truncate">결과: {t.result}</div>
                        )}
                      </div>
                      {t.validityDate && (
                        <div className="text-xs text-[#6b7280] flex-shrink-0">
                          {new Date(t.validityDate).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
