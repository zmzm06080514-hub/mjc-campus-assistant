import React, { useState } from 'react';
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
  NoteMessage,
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
  INITIAL_NOTES,
  INITIAL_REPORTS,
} from './data/mockData';

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
import { NoteDrawer } from './components/NoteDrawer';
import { AdminPanel } from './components/AdminPanel';
import { Toast } from './components/Toast';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  // 명지전문대 단일 캠퍼스만 지원합니다 (전환 UI 없음).
  const campus: CampusType = 'seoul';
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isGlobalAnonymous, setIsGlobalAnonymous] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // Application Dynamic State
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(INITIAL_BUS_ROUTES);
  const [foodSpots, setFoodSpots] = useState<FoodSpot[]>(INITIAL_FOOD_SPOTS);
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [mealMatches, setMealMatches] = useState<MealMatch[]>(INITIAL_MEAL_MATCHES);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [notes, setNotes] = useState<NoteMessage[]>(INITIAL_NOTES);
  const [reports, setReports] = useState<ContentReport[]>(INITIAL_REPORTS);

  // Modal / Drawer & Toast Control
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [sendNoteTarget, setSendNoteTarget] = useState<{
    receiverId: string;
    receiverName: string;
    relatedTitle?: string;
  } | null>(null);

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

  const unreadNotesCount = notes.filter(
    (n) => n.receiverId === CURRENT_USER.id && !n.isRead
  ).length;

  const pendingAssignmentsCount = assignments.filter((a) => !a.completed).length;
  const openMealCount = mealMatches.filter(
    (m) => m.campus === campus && m.status === 'open'
  ).length;

  const handleOpenSendNote = (
    receiverId: string,
    receiverName: string,
    relatedTitle?: string
  ) => {
    setSendNoteTarget({ receiverId, receiverName, relatedTitle });
    setIsNoteDrawerOpen(true);
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
      reporterName: isGlobalAnonymous ? '익명의 명지인' : CURRENT_USER.nickname,
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
        unreadNotesCount={unreadNotesCount}
        onOpenNotes={() => {
          setSendNoteTarget(null);
          setIsNoteDrawerOpen(true);
        }}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        isGlobalAnonymous={isGlobalAnonymous}
        setIsGlobalAnonymous={setIsGlobalAnonymous}
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
            onOpenSendNote={handleOpenSendNote}
            onShowToast={showToast}
            isGlobalAnonymous={isGlobalAnonymous}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeed
            campus={campus}
            posts={posts}
            setPosts={setPosts}
            currentUser={CURRENT_USER}
            userRole={userRole}
            isGlobalAnonymous={isGlobalAnonymous}
            onOpenCreateModal={() => setIsCreatePostModalOpen(true)}
            onOpenSendNote={handleOpenSendNote}
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
          isGlobalAnonymous={isGlobalAnonymous}
          onClose={() => setIsCreatePostModalOpen(false)}
          onSubmitPost={(newPost) => setPosts([newPost, ...posts])}
          onShowToast={showToast}
        />
      )}

      {isNoteDrawerOpen && (
        <NoteDrawer
          currentUser={CURRENT_USER}
          notes={notes}
          setNotes={setNotes}
          initialSendTarget={sendNoteTarget}
          onClose={() => setIsNoteDrawerOpen(false)}
          onShowToast={showToast}
        />
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
