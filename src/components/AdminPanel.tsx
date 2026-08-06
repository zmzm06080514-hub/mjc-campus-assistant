import React, { useState } from 'react';
import { ContentReport, CommunityPost } from '../types';
import { ShieldCheck, AlertTriangle, Trash2, CheckCircle, Megaphone, Sparkles, X } from 'lucide-react';

interface AdminPanelProps {
  reports: ContentReport[];
  setReports: React.Dispatch<React.SetStateAction<ContentReport[]>>;
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  reports,
  setReports,
  posts,
  setPosts,
  onClose,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'announcement'>('reports');

  // Official Announcement Form
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [noticeCategory, setNoticeCategory] = useState<'notice' | 'event'>('notice');

  const pendingReports = reports.filter((r) => r.status === 'pending');

  const handleDeleteReportedContent = (reportId: string, targetId: string) => {
    // Delete target post from community feed
    setPosts((prev) => prev.filter((p) => p.id !== targetId));

    // Update report status to deleted
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'deleted' } : r))
    );

    onShowToast('🚨 관리자 권한으로 부적절한 게시글이 즉시 삭제 처리되었습니다.');
  };

  const handleDismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
    onShowToast('신고건이 무혐의 처리되었습니다.');
  };

  const handlePostOfficialNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const officialPost: CommunityPost = {
      id: `notice_admin_${Date.now()}`,
      campus: 'seoul',
      tab: noticeCategory,
      title: `📢 [공지] ${noticeTitle.trim()}`,
      content: noticeContent.trim(),
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
      ],
      authorId: 'admin_mju',
      authorName: '명지전문대 총학생회 (관리자)',
      isAnonymous: false,
      createdAt: '방금 전',
      likesCount: 0,
      isLiked: false,
      comments: [],
      reportsCount: 0,
      isNotice: true,
    };

    setPosts([officialPost, ...posts]);
    setNoticeTitle('');
    setNoticeContent('');
    onShowToast(`📢 공식 ${noticeCategory === 'notice' ? '공지사항' : '이벤트'}가 게재되었습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">명지전문대 관리자 제어 센터</h3>
              <span className="text-[10px] text-amber-600 font-bold">
                신고 관리 및 공식 공지/이벤트 게재
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeSubTab === 'reports' ? 'bg-[#0A174C] text-white' : 'text-slate-600'
            }`}
          >
            신고 접수 내역 ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveSubTab('announcement')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeSubTab === 'announcement' ? 'bg-[#0577B2] text-white' : 'text-slate-600'
            }`}
          >
            공식 공지/이벤트 게재
          </button>
        </div>

        {/* Content */}
        {activeSubTab === 'reports' ? (
          <div className="space-y-3">
            {pendingReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-sm text-slate-700">처리 대기 중인 신고건이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-0.5">클린 명지전문대 커뮤니티가 유지되고 있습니다.</p>
              </div>
            ) : (
              pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      신고 대상: {report.targetTitleOrContent}
                    </span>
                    <span className="text-[10px] text-slate-400">{report.createdAt}</span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-rose-100 text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      신고 사유: {report.reason}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      작성자: {report.authorName} | 신고자: {report.reporterName}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      무혐의 종결
                    </button>
                    <button
                      onClick={() => handleDeleteReportedContent(report.id, report.targetId)}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>게시글 즉시 삭제</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handlePostOfficialNotice} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">공식 게시 카테고리</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNoticeCategory('notice')}
                  className={`py-2 rounded-xl font-bold ${
                    noticeCategory === 'notice'
                      ? 'bg-[#0A174C] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📢 학사 공지사항
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeCategory('event')}
                  className={`py-2 rounded-xl font-bold ${
                    noticeCategory === 'event'
                      ? 'bg-[#0577B2] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🎉 학생회 이벤트
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">공지 제목 *</label>
              <input
                type="text"
                required
                placeholder="예: 2026학년도 2학기 수강신청 일정 안내"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">공지 본문 내용 *</label>
              <textarea
                rows={5}
                required
                placeholder="공식 공지 내용을 상세히 입력해주세요."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A174C] hover:bg-[#0577B2] text-white font-extrabold rounded-xl transition-colors shadow-xs"
            >
              공식 공지 등록하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
