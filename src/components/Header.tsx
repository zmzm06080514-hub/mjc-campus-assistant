import React from 'react';
import { UserProfile } from '../types';
import { Mail, Menu, LogIn, LogOut, Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  unreadNotesCount: number;
  onOpenNotes: () => void;
  onOpenAdmin: () => void;
  onToggleSidebar: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadNotesCount,
  onOpenNotes,
  onOpenAdmin,
  onToggleSidebar,
  isAdmin,
  isLoggedIn,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Accent */}
      <div className="h-1 bg-gradient-to-r from-[#0A174C] via-[#0577B2] to-[#0A174C]" />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="MJC Mate"
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-sky-900/10 border border-white/20"
            />
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                MJC <span className="text-[#0577B2]">Mate</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* 관리자 인증 상태에 따른 버튼 */}
          {isAdmin ? (
            <>
              <button
                onClick={onOpenAdmin}
                className="px-2.5 py-1.5 bg-[#0A174C] text-white rounded-lg text-xs font-bold hover:bg-[#0577B2] transition-colors flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>신고/공지 관리</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200/80"
                title="로그아웃"
                aria-label="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : isLoggedIn ? (
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-2.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1"
              title="로그인"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그인</span>
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
    </header>
  );
};
