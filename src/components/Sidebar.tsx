import React from 'react';
import { Bus, UtensilsCrossed, Calendar, CheckSquare, Users, MessageSquare, Home, X } from 'lucide-react';

export type MainTab = 'home' | 'bus' | 'food' | 'schedule' | 'assignment' | 'meal' | 'community';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  pendingAssignmentsCount: number;
  openMealCount: number;
}

interface NavItem {
  id: MainTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  pendingAssignmentsCount,
  openMealCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'bus', label: '버스도착', icon: Bus },
    { id: 'food', label: '주변맛집', icon: UtensilsCrossed },
    { id: 'schedule', label: '강의일정', icon: Calendar },
    {
      id: 'assignment',
      label: '과제D-Day',
      icon: CheckSquare,
      badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
    },
    {
      id: 'meal',
      label: '밥매칭',
      icon: Users,
      badge: openMealCount > 0 ? openMealCount : undefined,
    },
    { id: 'community', label: '게시글', icon: MessageSquare },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[80vw] bg-white shadow-2xl border-r border-slate-200 transition-transform duration-200 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="font-extrabold text-slate-900 text-sm">메뉴</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-[#0A174C] text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-[#0577B2] text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
