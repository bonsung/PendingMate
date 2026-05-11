import React, { useState, useEffect, useRef } from 'react';
import { STATUS } from '../db.js';
import { useData } from '../DataContext.jsx';
import { supabase } from '../supabase.js';
import { X, Paperclip, Link, Image, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: STATUS.ONGOING, label: '진행중', cls: 'status-ongoing' },
  { value: STATUS.CLEAR, label: 'Clear ✓', cls: 'status-clear' },
  { value: STATUS.DROP, label: 'Drop ✗', cls: 'status-drop' },
  { value: STATUS.HOLD, label: '보류', cls: 'status-hold' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: '🔴 높음' },
  { value: 'normal', label: '🟡 보통' },
  { value: 'low', label: '🟢 낮음' },
];

export default function TaskForm({ taskId, onClose }) {
  const isEdit = !!taskId;
  const { pics, refresh } = useData();

  const [form, setForm] = useState({
    title: '', content: '', picId: '',
    status: STATUS.ONGOING,
    validityDay: '', validityTime: '',
    priority: 'normal',
  });

  // 저장된 첨부(수정 모드) / 임시 첨부(신규 모드)
  const [savedAttachments, setSavedAttachments] = useState([]);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkName, setLinkName] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    if (!taskId) return;
    supabase.from('tasks').select('*').eq('id', taskId).single()
      .then(({ data: task }) => {
        if (!task) return;
        const d = task.validity_date ? new Date(task.validity_date) : null;
        setForm({
          title: task.title || '',
          content: task.content || '',
          picId: task.pic_id || '',
          status: task.status || STATUS.ONGOING,
          validityDay: d ? format(d, 'yyyy-MM-dd') : '',
          validityTime: d ? format(d, 'HH:mm') : '',
          priority: task.priority || 'normal',
        });
      });

    supabase.from('attachments').select('*').eq('task_id', taskId)
      .then(({ data }) => setSavedAttachments(data || []));
  }, [taskId]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        if (isEdit) {
          const { data } = await supabase.from('attachments').insert({
            task_id: taskId, type, name: file.name, url: dataUrl,
            created_at: new Date().toISOString(),
          }).select().single();
          if (data) setSavedAttachments(prev => [...prev, data]);
        } else {
          setPendingAttachments(prev => [...prev, {
            _tempId: Date.now() + Math.random(), type, name: file.name, url: dataUrl,
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAddLink = async () => {
    if (!linkInput.trim()) return;
    const item = { type: 'link', name: linkName || linkInput, url: linkInput };
    if (isEdit) {
      const { data } = await supabase.from('attachments').insert({
        task_id: taskId, ...item, created_at: new Date().toISOString(),
      }).select().single();
      if (data) setSavedAttachments(prev => [...prev, data]);
    } else {
      setPendingAttachments(prev => [...prev, { _tempId: Date.now(), ...item }]);
    }
    setLinkInput(''); setLinkName(''); setShowLinkInput(false);
  };

  const handleDeleteAttachment = async (item) => {
    if (item.id) {
      await supabase.from('attachments').delete().eq('id', item.id);
      setSavedAttachments(prev => prev.filter(a => a.id !== item.id));
    } else {
      setPendingAttachments(prev => prev.filter(a => a._tempId !== item._tempId));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('업무 제목을 입력해주세요');
    setSaving(true);
    const now = new Date().toISOString();
    const taskData = {
      title: form.title,
      content: form.content || null,
      pic_id: form.picId ? Number(form.picId) : null,
      status: form.status,
      validity_date: form.validityDay
        ? new Date(`${form.validityDay}T${form.validityTime || '00:00'}`).toISOString()
        : null,
      priority: form.priority,
      updated_at: now,
    };

    if (isEdit) {
      await supabase.from('tasks').update(taskData).eq('id', taskId);
    } else {
      taskData.created_at = now;
      const { data: newTask } = await supabase.from('tasks').insert(taskData).select().single();
      if (newTask && pendingAttachments.length > 0) {
        await supabase.from('attachments').insert(
          pendingAttachments.map(a => ({
            task_id: newTask.id, type: a.type, name: a.name, url: a.url, created_at: now,
          }))
        );
      }
    }

    refresh();
    setSaving(false);
    onClose();
  };

  const displayAttachments = isEdit ? savedAttachments : pendingAttachments;

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-[#111827]">
          {isEdit ? '업무 수정' : '새 업무 등록'}
        </h2>
        <button onClick={onClose} className="pm-btn-ghost p-1.5"><X size={16} /></button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#6b7280] mb-1.5">업무 제목 *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="업무 제목을 입력하세요" className="pm-input" />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-medium text-[#6b7280] mb-1.5">업무 내용</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)}
            placeholder="업무 내용, 지시사항, 참고사항을 입력하세요"
            rows={4} className="pm-input resize-none" />
        </div>

        {/* PIC + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">PIC (담당자)</label>
            <select value={form.picId} onChange={e => set('picId', e.target.value)} className="pm-input">
              <option value="">담당자 선택</option>
              {(pics || []).map(p => (
                <option key={p.id} value={p.id}>{p.name} · {p.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">우선순위</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className="pm-input">
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validity + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Validity (마감일시)</label>
            <div className="flex gap-2">
              <input type="date" value={form.validityDay} onChange={e => set('validityDay', e.target.value)}
                className="pm-input flex-1" />
              <input type="time" value={form.validityTime} onChange={e => set('validityTime', e.target.value)}
                className="pm-input w-28" placeholder="00:00" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">달성도</label>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => set('status', s.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all
                    ${form.status === s.value ? s.cls : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-medium text-[#6b7280] mb-2">첨부 (파일/이미지/링크)</label>

          {displayAttachments.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {displayAttachments.map(a => (
                <div key={a.id || a._tempId}
                  className="flex items-center gap-2 p-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm">
                  {a.type === 'image' ? <Image size={14} className="text-blue-500" /> :
                   a.type === 'link' ? <Link size={14} className="text-emerald-500" /> :
                   <Paperclip size={14} className="text-[#6b7280]" />}
                  <span className="flex-1 text-[#6b7280] truncate text-xs">{a.name}</span>
                  {(a.type === 'link' || a.type === 'image') && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600">
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button onClick={() => handleDeleteAttachment(a)}
                    className="text-red-400 hover:text-red-600 ml-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb]
                         rounded-lg text-xs text-[#6b7280] hover:border-blue-400 hover:text-blue-600 transition-all">
              <Paperclip size={12} />파일/이미지
            </button>
            <button onClick={() => setShowLinkInput(!showLinkInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb]
                         rounded-lg text-xs text-[#6b7280] hover:border-emerald-400 hover:text-emerald-600 transition-all">
              <Link size={12} />링크 추가
            </button>
          </div>

          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

          {showLinkInput && (
            <div className="mt-2 space-y-1.5 fade-in">
              <input type="text" value={linkName} onChange={e => setLinkName(e.target.value)}
                placeholder="링크 이름 (선택)" className="pm-input text-xs" />
              <div className="flex gap-2">
                <input type="url" value={linkInput} onChange={e => setLinkInput(e.target.value)}
                  placeholder="https://..." className="pm-input text-xs flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleAddLink()} />
                <button onClick={handleAddLink} className="pm-btn-primary text-xs px-3 whitespace-nowrap">
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5 pt-4 border-t border-[#e5e7eb]">
        <button onClick={onClose} className="pm-btn-ghost flex-1">취소</button>
        <button onClick={handleSubmit} disabled={saving} className="pm-btn-primary flex-1">
          {saving ? '저장중...' : isEdit ? '수정 저장' : '업무 등록'}
        </button>
      </div>
    </div>
  );
}
