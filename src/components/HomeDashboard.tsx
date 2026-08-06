import React, { useState } from 'react';
import {
  CampusType,
  BusRoute,
  ClassItem,
  AssignmentItem,
  MealMatch,
  CommunityPost,
  FoodSpot,
} from '../types';
import {
  Bus,
  Calendar,
  CheckSquare,
  Users,
  UtensilsCrossed,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Copy,
  Heart,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface HomeDashboardProps {
  campus: CampusType;
  busRoutes: BusRoute[];
  classes: ClassItem[];
  assignments: AssignmentItem[];
  mealMatches: MealMatch[];
  posts: CommunityPost[];
  foodSpots: FoodSpot[];
  onNavigate: (tab: any) => void;
  onCreatePost: () => void;
  onShowToast: (msg: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  campus,
  busRoutes,
  classes,
  assignments,
  mealMatches,
  posts,
  foodSpots,
  onNavigate,
  onCreatePost,
  onShowToast,
}) => {
  const [activeFeedFilter, setActiveFeedFilter] = useState<'meal' | 'class' | 'notice' | 'event'>('meal');
  const [isAnonMode, setIsAnonMode] = useState<boolean>(true);

  const campusBuses = busRoutes.filter((b) => b.campus === campus);
  const topBus = campusBuses[0] || busRoutes[0];
  const secondBus = campusBuses[1] || busRoutes[1];

  // 미니 캘린더: 하드코딩된 날짜가 아니라 실제 오늘을 기준으로 2주(14일)를 계산한다.
  // 강의가 있는 요일에는 점을 찍고, 날짜를 누르면 강의일정 탭으로 이동한다.
  const today = new Date();
  const WEEKDAY_INDEX: Record<string, number> = { 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };
  const classWeekdays = new Set(classes.map((c) => WEEKDAY_INDEX[c.dayOfWeek]));
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - today.getDay());
  const miniCalendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startOfThisWeek);
    d.setDate(startOfThisWeek.getDate() + i);
    return d;
  });

  const pendingAssignments = assignments.filter((a) => !a.completed);
  const campusPosts = posts.filter((p) => p.campus === campus);
  const topFoodSpots = foodSpots.filter((f) => f.campus === campus);

  // 활동 피드 탭(밥매칭/강의소식/공지/이벤트) -> 실제 게시글 tab 값 매핑
  const feedTabToPostTab: Record<'meal' | 'class' | 'notice' | 'event', CommunityPost['tab']> = {
    meal: 'meal',
    class: 'lecture',
    notice: 'notice',
    event: 'event',
  };
  const activeFeedPosts = campusPosts
    .filter((p) => p.tab === feedTabToPostTab[activeFeedFilter])
    .slice(0, 3);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    onShowToast(`📍 주소가 복사되었습니다: "${addr}"`);
  };

  return (
    <div className="space-y-6">
      {/* High Density Banner Header */}
      <div className="bg-gradient-to-r from-[#0A174C] via-[#0577B2] to-[#0A174C] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>명지전문대 개인비서 2.0 (High Density)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            명지전문대 캠퍼스 실시간 하이데시티 대시보드
          </h1>
          <p className="text-xs text-sky-100/90 max-w-xl">
            실시간 버스 도착, 캘린더 강의 일정, D-Day 과제, 주변 맛집 핀, 밥 매칭 및 익명 커뮤니티
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <button
            onClick={onCreatePost}
            className="px-4 py-2 bg-white text-[#0A174C] font-extrabold text-xs rounded-xl shadow-xs hover:bg-sky-50 transition-all"
          >
            + 새 글 작성
          </button>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 3-Column High Density Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Academic & Tasks (3 Cols on lg) */}
        <section className="lg:col-span-3 space-y-5 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs">
          {/* Lecture Calendar Widget */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#0A174C] flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#0577B2] rounded-full"></span>
                강의 일정
              </h2>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-[#0577B2] hover:underline"
              >
                캘린더
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <div className="grid grid-cols-7 text-[10px] text-center text-slate-400 mb-2 uppercase font-bold">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {miniCalendarDays.map((d, i) => {
                  const isToday = d.toDateString() === today.toDateString();
                  const isCurrentMonth = d.getMonth() === today.getMonth();
                  const hasClass = classWeekdays.has(d.getDay());
                  return (
                    <button
                      key={i}
                      onClick={() => onNavigate('schedule')}
                      className={`h-6 flex items-center justify-center text-xs font-semibold rounded-md relative transition-colors ${
                        isToday
                          ? 'bg-[#0A174C] text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-900 hover:bg-slate-200'
                          : 'text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {d.getDate()}
                      {hasClass && !isToday && (
                        <span className="absolute bottom-0.5 w-1 h-1 bg-[#0577B2] rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Lecture list items */}
              <div className="mt-3 space-y-2">
                {classes.slice(0, 2).map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => onNavigate('schedule')}
                    className="text-[11px] flex justify-between p-2 bg-white rounded-lg border-l-4 border-[#0577B2] shadow-2xs cursor-pointer hover:bg-sky-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 truncate pr-1">{cls.name}</span>
                    <span className="text-slate-500 shrink-0">{cls.startTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task D-Day List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-[#0A174C]">과제 리스트</h2>
              <button
                onClick={() => onNavigate('assignment')}
                className="text-[#0577B2] font-bold text-xs flex items-center gap-0.5 hover:underline"
              >
                + 과제함
              </button>
            </div>

            <div className="space-y-2">
              {pendingAssignments.slice(0, 3).map((asg, idx) => {
                const daysLeft = Math.max(1, 3 + idx * 4);
                const isUrgent = daysLeft <= 3;
                return (
                  <div
                    key={asg.id}
                    onClick={() => onNavigate('assignment')}
                    className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-[#0577B2] transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold ${isUrgent ? 'text-rose-600' : 'text-[#0577B2]'}`}>
                        D-{daysLeft}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{asg.courseName}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{asg.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Middle Column: Feed & Meal Match Cards (5 Cols on lg) */}
        <main className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
          {/* Header Feed Tabs & Anon Toggle */}
          <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveFeedFilter('meal')}
                className={`text-xs font-bold pb-3 px-1 border-b-2 transition-all ${
                  activeFeedFilter === 'meal'
                    ? 'border-[#0A174C] text-[#0A174C]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                밥 매칭
              </button>
              <button
                onClick={() => setActiveFeedFilter('class')}
                className={`text-xs font-bold pb-3 px-1 border-b-2 transition-all ${
                  activeFeedFilter === 'class'
                    ? 'border-[#0A174C] text-[#0A174C]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                강의소식
              </button>
              <button
                onClick={() => setActiveFeedFilter('notice')}
                className={`text-xs font-bold pb-3 px-1 border-b-2 transition-all ${
                  activeFeedFilter === 'notice'
                    ? 'border-[#0A174C] text-[#0A174C]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                공지
              </button>
              <button
                onClick={() => setActiveFeedFilter('event')}
                className={`text-xs font-bold pb-3 px-1 border-b-2 transition-all ${
                  activeFeedFilter === 'event'
                    ? 'border-[#0A174C] text-[#0A174C]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                이벤트
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setIsAnonMode(true)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  isAnonMode ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400'
                }`}
              >
                익명
              </button>
              <button
                onClick={() => setIsAnonMode(false)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  !isAnonMode ? 'bg-white shadow-2xs text-[#0577B2]' : 'text-slate-400'
                }`}
              >
                ID 표시
              </button>
            </div>
          </header>

          <div className="p-4 space-y-4">
            {activeFeedPosts.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-500">
                  아직 이 탭에 게시글이 없습니다.
                </p>
                <button
                  onClick={() => onNavigate('community')}
                  className="mt-3 text-xs font-bold text-[#0577B2] hover:underline"
                >
                  게시글 전체 보러가기 →
                </button>
              </div>
            ) : (
              activeFeedPosts.map((post) => {
                const displayName = post.isAnonymous
                  ? isAnonMode
                    ? '익명의 명지인'
                    : post.authorName
                  : post.authorName;
                return (
                  <article
                    key={post.id}
                    onClick={() => onNavigate('community')}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs cursor-pointer hover:border-[#0577B2] transition-colors"
                  >
                    <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {displayName.slice(0, 1)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{displayName}</span>
                          <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                        </div>
                      </div>
                      {post.isNotice && (
                        <span className="px-2 py-0.5 bg-[#0577B2]/10 text-[#0577B2] rounded text-[10px] font-bold uppercase shrink-0">
                          공지
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 space-y-2">
                      <p className="text-xs font-bold text-slate-900">{post.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{post.content}</p>

                      {post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.slice(0, 2).map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="w-full h-24 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        댓글 {post.comments.length}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* Right Column: Live Campus Utilities (4 Cols on lg) */}
        <section className="lg:col-span-4 space-y-5 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs">
          {/* Bus Real-time Card */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-[#0A174C]">실시간 버스 정보</h2>
              <button
                onClick={() => onNavigate('bus')}
                className="text-xs font-bold text-[#0577B2] hover:underline"
              >
                전체보기
              </button>
            </div>

            <div className="space-y-2.5">
              {topBus && (
                <div
                  onClick={() => onNavigate('bus')}
                  className="p-3.5 bg-gradient-to-r from-[#0A174C] to-[#0577B2] rounded-2xl text-white shadow-xs cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">
                      진입예정
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">
                      {topBus.busNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold">{topBus.destination}</span>
                    <span className="text-xl font-black">{topBus.nextArrivalMinutes}분</span>
                  </div>
                </div>
              )}

              {secondBus && (
                <div
                  onClick={() => onNavigate('bus')}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      다음 버스
                    </span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-bold">
                      {secondBus.busNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-800">{secondBus.destination}</span>
                    <span className="text-base font-black text-[#0577B2]">
                      {secondBus.nextArrivalMinutes}분
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Food Spots */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-[#0A174C]">주변 맛집 추천</h2>
              <button
                onClick={() => onNavigate('food')}
                className="text-xs text-slate-400 font-bold hover:text-slate-600"
              >
                더보기
              </button>
            </div>

            <div className="space-y-3">
              {topFoodSpots.slice(0, 2).map((spot) => (
                <div
                  key={spot.id}
                  className="flex gap-3 items-center group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0577B2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{spot.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{spot.address}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(spot.address)}
                    className="p-1.5 text-slate-400 hover:text-[#0577B2] rounded-lg hover:bg-sky-50 transition-colors"
                    title="주소 복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Message Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-xs">
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-extrabold text-sky-400 tracking-wider">ADMIN MESSAGE</p>
              <p className="text-xs leading-relaxed text-slate-200 font-medium">
                서버 점검 및 수강신청 대비 시스템 최적화가 진행 중입니다.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-sky-500/20 blur-2xl rounded-full" />
          </div>
        </section>
      </div>
    </div>
  );
};

