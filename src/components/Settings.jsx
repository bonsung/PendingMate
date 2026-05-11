import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';
import { Bell, Save, FlaskConical, Trash2 } from 'lucide-react';

export default function Settings() {
  const [webhook, setWebhook] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'discordWebhook').maybeSingle()
      .then(({ data }) => { if (data?.value) setWebhook(data.value); });
  }, []);

  const handleSave = async () => {
    await supabase.from('settings').upsert({ key: 'discordWebhook', value: webhook });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const { data: setting } = await supabase
      .from('settings').select('value').eq('key', 'discordWebhook').maybeSingle();
    if (!setting?.value) {
      setTestResult({ ok: false, msg: 'Webhook URL을 먼저 저장해주세요' });
      setTesting(false);
      return;
    }
    const payload = {
      username: 'PendingMate',
      embeds: [{
        title: '✅ PendingMate 연결 테스트',
        color: 0x2563eb,
        description: 'Discord 알림이 정상적으로 연결되었습니다! 🎉\nValidity 마감 5시간 전에 이런 형식으로 알림이 옵니다.',
        footer: { text: 'PendingMate — JP 업무관리시스템' },
        timestamp: new Date().toISOString(),
      }],
    };
    try {
      const res = await fetch(setting.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setTestResult({ ok: res.ok, msg: res.ok ? '✅ 테스트 메시지 전송 성공!' : `❌ 오류: ${res.status}` });
    } catch (e) {
      setTestResult({ ok: false, msg: `❌ 연결 실패: ${e.message}` });
    }
    setTesting(false);
  };

  const handleClearData = async () => {
    if (!confirm('⚠️ 모든 업무 데이터를 삭제합니다. 되돌릴 수 없습니다. 계속하시겠습니까?')) return;
    await supabase.from('tasks').delete().neq('id', 0);
    await supabase.from('attachments').delete().neq('id', 0);
    alert('데이터가 삭제되었습니다.');
    window.location.reload();
  };

  const handleResetAlerts = async () => {
    await supabase.from('settings').delete().eq('key', 'alertedTasks');
    alert('알림 이력이 초기화되었습니다. 다음 체크 시 재발송됩니다.');
  };

  return (
    <div className="p-6 fade-in max-w-xl">
      <h1 className="text-xl font-bold text-[#111827] mb-6">설정</h1>

      {/* Discord */}
      <div className="pm-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-[#111827]">Discord 알림</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#6b7280] mb-1.5 block">
              Webhook URL
              <a href="https://support.discord.com/hc/en-us/articles/228383668"
                target="_blank" rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-500">만드는 방법 →</a>
            </label>
            <input type="url" value={webhook} onChange={e => setWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="pm-input font-mono text-xs" />
            <p className="text-xs text-[#9ca3af] mt-1.5">
              Validity 마감 5시간 전 자동 발송 · 10분 간격으로 체크
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="pm-btn-primary flex items-center gap-2">
              <Save size={13} />{saved ? '저장됨 ✓' : '저장'}
            </button>
            <button onClick={handleTest} disabled={testing}
              className="pm-btn-ghost flex items-center gap-2 border border-[#e5e7eb]">
              <FlaskConical size={13} />{testing ? '전송중...' : '테스트 발송'}
            </button>
          </div>

          {testResult && (
            <div className={`text-xs px-3 py-2 rounded-lg ${
              testResult.ok
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.msg}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pm-card p-5 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-red-600">데이터 관리</h2>
        </div>
        <div className="space-y-2">
          <button onClick={handleResetAlerts}
            className="w-full text-left px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb]
                       hover:bg-[#f3f4f6] rounded-lg text-sm text-[#6b7280] transition-all">
            알림 이력 초기화 — 이미 발송된 알림을 재발송 가능하게
          </button>
          <button onClick={handleClearData}
            className="w-full text-left px-3 py-2.5 bg-red-50 border border-red-200
                       hover:bg-red-100 rounded-lg text-sm text-red-600 transition-all">
            ⚠️ 전체 업무 데이터 삭제
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-4 px-2 text-xs text-[#9ca3af] space-y-1">
        <div>PendingMate v1.0 · Supabase 클라우드</div>
        <div>데이터는 Supabase DB에 저장됩니다</div>
      </div>
    </div>
  );
}
