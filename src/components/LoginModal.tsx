import React, { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Lock, Mail } from 'lucide-react';

interface LoginModalProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
  onClose: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/user-not-found': '등록되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/email-already-in-use': '이미 가입된 이메일입니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다. Firebase 콘솔 > Authentication > Sign-in method에서 활성화하세요.',
  'auth/too-many-requests': '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
};

function toKoreanMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return ERROR_MESSAGES[err.code] ?? '알 수 없는 오류가 발생했습니다.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onSignup, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onSignup(email, password);
      }
      onClose();
    } catch (err) {
      setError(toKoreanMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#0577B2]" />
            <span>관리자 로그인</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
            ✕
          </button>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          관리자 전용입니다. 로그인/회원가입 시 기존 채팅 닉네임과 쪽지함이 초기화됩니다.
        </p>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-[#0A174C] text-white' : 'text-slate-600'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-[#0577B2] text-white' : 'text-slate-600'
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">이메일</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">비밀번호</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
            />
          </div>

          {error && (
            <p className="text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-lg p-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#0A174C] hover:bg-[#0577B2] disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};
