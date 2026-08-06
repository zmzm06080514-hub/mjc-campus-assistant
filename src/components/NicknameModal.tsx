import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void | Promise<void>;
}

/**
 * 실시간 채팅에 처음 들어온 사람에게 닉네임만 받는다 (비밀번호 없음).
 * 한 번 정하면 이 브라우저(익명 로그인 세션)에 계속 저장되어 다시 묻지 않는다.
 */
export const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    await onSubmit(trimmed);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0A174C] text-white flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">채팅에서 쓸 닉네임을 정해주세요</h3>
          <p className="text-xs text-slate-500 mt-1">
            비밀번호는 필요 없어요. 이 기기에서는 계속 이 닉네임으로 채팅해요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            maxLength={20}
            required
            placeholder="예: 명지백호24"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-bold focus:outline-none focus:border-[#0577B2]"
          />
          <button
            type="submit"
            disabled={submitting || !value.trim()}
            className="w-full py-2.5 bg-[#0A174C] hover:bg-[#0577B2] disabled:opacity-50 text-white font-extrabold rounded-xl transition-colors text-sm"
          >
            {submitting ? '설정 중...' : '채팅 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
};
