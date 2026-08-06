import React from 'react';
import { UserRole, UserProfile } from '../types';
import { Mail, Shield, ShieldCheck, User, Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (r: UserRole) => void;
  currentUser: UserProfile;
  unreadNotesCount: number;
  onOpenNotes: () => void;
  onOpenAdmin: () => void;
  isGlobalAnonymous: boolean;
  setIsGlobalAnonymous: (anon: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  currentUser,
  unreadNotesCount,
  onOpenNotes,
  onOpenAdmin,
  isGlobalAnonymous,
  setIsGlobalAnonymous,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Accent */}
      <div className="h-1 bg-gradient-to-r from-[#0A174C] via-[#0577B2] to-[#0A174C]" />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A174C] to-[#0577B2] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-sky-900/10 border border-white/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  명지전문대 <span className="text-[#0577B2]">개인비서</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#0577B2]/10 text-[#0577B2]">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">MJC Campus Assistant</p>
            </div>
          </div>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Identity Selector Button */}
          <button
            onClick={() => setIsGlobalAnonymous(!isGlobalAnonymous)}
            title="기본 포스팅/댓글 익명 설정 변경"
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              isGlobalAnonymous
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-sky-50 text-[#0577B2] border-sky-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isGlobalAnonymous ? '기본: 익명 모드' : `ID: ${currentUser.nickname}`}</span>
          </button>

          {/* Admin Mode Switcher */}
          <button
            onClick={() => {
              const newRole = userRole === 'admin' ? 'user' : 'admin';
              setUserRole(newRole);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              userRole === 'admin'
                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>관리자 모드</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">학생 모드</span>
              </>
            )}
          </button>

          {/* Admin Management Panel Button if Admin */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 bg-[#0A174C] text-white rounded-lg text-xs font-bold hover:bg-[#0577B2] transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>신고/공지 관리</span>
            </button>
          )}

          {/* Direct Messages / Notes Button */}
          <button
            onClick={onOpenNotes}
            className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/80"
            aria-label="쪽지함"
          >
            <Mail className="w-4 h-4" />
            {unreadNotesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadNotesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Identity Toggle Bar */}
      <div className="sm:hidden px-4 pb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-semibold">명지전문대 학생 전용</span>

        <button
          onClick={() => setIsGlobalAnonymous(!isGlobalAnonymous)}
          className="px-2 py-1 rounded-lg border text-[11px] font-medium bg-slate-100 text-slate-700 shrink-0"
        >
          {isGlobalAnonymous ? '익명' : '닉네임'}
        </button>
      </div>
    </header>
  );
};
