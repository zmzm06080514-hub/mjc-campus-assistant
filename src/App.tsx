import React, { useEffect, useState } from 'react';
import {
  CampusType,
  UserRole,
  UserProfile,
  BusRoute,
  FoodSpot,
  ClassItem,
  AssignmentItem,
  MealMatch,
  CommunityPost,
  ContentReport,
} from './types';
import {
  CURRENT_USER,
  INITIAL_BUS_ROUTES,
  INITIAL_FOOD_SPOTS,
  INITIAL_CLASSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_MEAL_MATCHES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_REPORTS,
} from './data/mockData';
import { fetchLiveNotices } from './data/liveNotices';
import { useChatIdentity } from './hooks/useChatIdentity';
import { subscribeMyChats } from './data/chat';

import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { BusTracker } from './components/BusTracker';
import { FoodSpotMap } from './components/FoodSpotMap';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { AssignmentList } from './components/AssignmentList';
import { MealMatching } from './components/MealMatching';
import { CommunityFeed } from './components/CommunityFeed';
import { PostCreateModal } from './components/PostCreateModal';
import { ChatDrawer } from './components/ChatDrawer';
import { NicknameModal } from './components/NicknameModal';
import { AdminPanel } from './components/AdminPanel';
import { Toast } from './components/Toast';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  // 명지전문대 단일 캠퍼스만 지원합니다 (전환 UI 없음).
  const campus: CampusType = 'seoul';
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // Application Dynamic State
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(INITIAL_BUS_ROUTES);
  const [foodSpots, setFoodSpots] = useState<FoodSpot[]>(INITIAL_FOOD_SPOTS);
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [mealMatches, setMealMatches] = useState<MealMatch[]>(INITIAL_MEAL_MATCHES);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [reports, setReports] = useState<ContentReport[]>(INITIAL_REPORTS);

  // 실시간 채팅 (Firebase 익명 로그인 + 닉네임)
  const chatIdentity = useChatIdentity();
  const [myChatCount, setMyChatCount] = useState<{ total: number; withActivity: number }>({
    total: 0,
    withActivity: 0,
  });
  useEffect(() => {
    if (!chatIdentity.uid) return;
    return subscribeMyChats(chatIdentity.uid, (chats) => {
      // 참고: 정확한 "읽음" 추적은 하지 않는다 (MVP 단순화).
      // 상대가 마지막으로 보낸 대화가 있으면 "확인할 게 있다"는 정도의 표시만 한다.
      const withActivity = chats.filter(
        (c) => c.lastSenderUid && c.lastSenderUid !== chatIdentity.uid
      ).length;
      setMyChatCount({ total: chats.length, withActivity });
    });
  }, [chatIdentity.uid]);

  // GitHub Actions가 매일 크롤링해 둔 실제 명지전문대 공지사항을 불러와
  // 목업 게시글 위에 최신순으로 얹는다 (이미 들어와 있으면 건너뜀).
  useEffect(() => {
    fetchLiveNotices().then((liveNotices) => {
      if (liveNotices.length === 0) return;
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = liveNotices.filter((n) => !existingIds.has(n.id));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev];
      });
    });
  }, []);

  // Modal / Drawer & Toast Control
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [dmTarget, setDmTarget] = useState<{ uid: string; name: string } | null>(null);
  const [mealChatTarget, setMealChatTarget] = useState<{ mealMatchId: string; title: string } | null>(
    null
  );
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);

  // Report Popup State
  const [reportTarget, setReportTarget] = useState<{
    type: 'post' | 'comment';
    id: string;
    titleOrContent: string;
    authorName: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const pendingAssignmentsCount = assignments.filter((a) => !a.completed).length;
  const openMealCount = mealMatches.filter(
    (m) => m.campus === campus && m.status === 'open'
  ).length;

  const handleOpenDm = (receiverId: string, receiverName: string) => {
    setDmTarget({ uid: receiverId, name: receiverName });
    setMealChatTarget(null);
    setIsChatOpen(true);
  };

  const handleOpenMealChat = (mealMatchId: string, title: string) => {
    setMealChatTarget({ mealMatchId, title });
    setDmTarget(null);
    setIsChatOpen(true);
  };

  const handleTriggerReport = (
    type: 'post' | 'comment',
    id: string,
    titleOrContent: string,
    authorName: string
  ) => {
    setReportTarget({ type, id, titleOrContent, authorName });
  };

  const handleConfirmReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportReason.trim()) return;

    const newReport: ContentReport = {
      id: `rep_${Date.now()}`,
      contentType: reportTarget.type,
      targetId: reportTarget.id,
      targetTitleOrContent: reportTarget.titleOrContent,
      authorName: reportTarget.authorName,
      reporterName: '익명의 명지인',
      reason: reportReason.trim(),
      status: 'pending',
      createdAt: '방금 전',
    };

    setReports([newReport, ...reports]);
    setReportTarget(null);
    setReportReason('');
    showToast('🚨 신고가 성공적으로 접수되었습니다. 관리자 검토 후 조치됩니다.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 sm:pb-8 flex flex-col">
      {/* Top Header */}
      <Header
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={CURRENT_USER}
        unreadNotesCount={myChatCount.withActivity}
        onOpenNotes={() => {
          setDmTarget(null);
          setMealChatTarget(null);
          setIsChatOpen(true);
        }}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingAssignmentsCount={pendingAssignmentsCount}
        openMealCount={openMealCount}
      />

      {/* Main Container View Area */}
      <main className="max-w-7xl mx-auto px-4 py-4 flex-1 w-full">
        {activeTab === 'home' && (
          <HomeDashboard
            campus={campus}
            busRoutes={busRoutes}
            classes={classes}
            assignments={assignments}
            mealMatches={mealMatches}
            posts={posts}
            foodSpots={foodSpots}
            onNavigate={(t) => setActiveTab(t)}
            onCreatePost={() => {
              setActiveTab('community');
              setIsCreatePostModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'bus' && (
          <BusTracker campus={campus} busRoutes={busRoutes} setBusRoutes={setBusRoutes} />
        )}

        {activeTab === 'food' && (
          <FoodSpotMap
            campus={campus}
            foodSpots={foodSpots}
            setFoodSpots={setFoodSpots}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleCalendar classes={classes} setClasses={setClasses} onShowToast={showToast} />
        )}

        {activeTab === 'assignment' && (
          <AssignmentList
            assignments={assignments}
            setAssignments={setAssignments}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'meal' && (
          <MealMatching
            campus={campus}
            mealMatches={mealMatches}
            setMealMatches={setMealMatches}
            currentUser={CURRENT_USER}
            onOpenSendNote={handleOpenDm}
            onOpenMealChat={handleOpenMealChat}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeed
            campus={campus}
            posts={posts}
            setPosts={setPosts}
            currentUser={CURRENT_USER}
            userRole={userRole}
            onOpenCreateModal={() => setIsCreatePostModalOpen(true)}
            onOpenSendNote={handleOpenDm}
            onReportContent={handleTriggerReport}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {isCreatePostModalOpen && (
        <PostCreateModal
          campus={campus}
          currentUser={CURRENT_USER}
          userRole={userRole}
          onClose={() => setIsCreatePostModalOpen(false)}
          onSubmitPost={(newPost) => setPosts([newPost, ...posts])}
          onShowToast={showToast}
        />
      )}

      {isChatOpen && chatIdentity.uid && chatIdentity.nickname && (
        <ChatDrawer
          uid={chatIdentity.uid}
          myNickname={chatIdentity.nickname}
          initialDmTarget={dmTarget}
          initialMealChat={mealChatTarget}
          onClose={() => {
            setIsChatOpen(false);
            setDmTarget(null);
            setMealChatTarget(null);
          }}
        />
      )}

      {isChatOpen && chatIdentity.ready && !chatIdentity.nickname && (
        <NicknameModal onSubmit={(name) => chatIdentity.setNickname(name)} />
      )}

      {isAdminPanelOpen && (
        <AdminPanel
          reports={reports}
          setReports={setReports}
          posts={posts}
          setPosts={setPosts}
          onClose={() => setIsAdminPanelOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-[#0A174C] text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>콘텐츠 신고하기</span>
              </h3>
              <button
                onClick={() => setReportTarget(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReport} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">신고 대상 콘텐츠</span>
                <span className="font-extrabold text-slate-900 truncate block mt-0.5">
                  {reportTarget.titleOrContent}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  작성자: {reportTarget.authorName}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">신고 사유 선택 *</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                >
                  <option value="">-- 신고 사유를 선택하세요 --</option>
                  <option value="부적절한 광고 및 스팸">부적절한 광고 및 스팸</option>
                  <option value="욕설, 비하 및 명예훼손">욕설, 비하 및 명예훼손</option>
                  <option value="음란물 또는 유해 콘텐츠">음란물 또는 유해 콘텐츠</option>
                  <option value="사기 및 불법 행위 시도">사기 및 불법 행위 시도</option>
                  <option value="기타 사유">기타 사유</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors"
                >
                  신고 접수
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Component */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
