import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      sessionStorage.setItem('pm_auth', 'true');
      onLogin();
    } else {
      setError('비밀번호가 올바르지 않습니다');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-sm p-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Clock size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#111827]">PendingMate</h1>
          <p className="text-sm text-[#9ca3af] mt-1">JP 업무관리 시스템</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호를 입력하세요"
              className="pm-input"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="pm-btn-primary w-full py-2.5"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
