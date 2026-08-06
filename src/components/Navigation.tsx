import React from 'react';
import { Bus, UtensilsCrossed, Calendar, CheckSquare, Users, MessageSquare, Home } from 'lucide-react';

export type MainTab = 'home' | 'bus' | 'food' | 'schedule' | 'assignment' | 'meal' | 'community';

interface NavigationProps {
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

export const Navigation: React.FC<NavigationProps> = ({
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
      {/* Desktop / Tablet Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/90 shadow-2xs py-1.5 px-4 sticky top-[57px] sm:top-[61px] z-30 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MainTab)}
                className={`relative px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#0A174C] text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-[#0577B2] text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Instagram/App Style Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-7 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MainTab)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all relative ${
                  isActive ? 'text-[#0577B2] font-black scale-105' : 'text-slate-500 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-extrabold rounded-full min-w-[14px] text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tighter truncate w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-[#0577B2] rounded-full absolute bottom-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
