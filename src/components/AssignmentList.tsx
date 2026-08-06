import React, { useState } from 'react';
import { AssignmentItem } from '../types';
import { CheckSquare, Plus, Clock, BookOpen, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

interface AssignmentListProps {
  assignments: AssignmentItem[];
  setAssignments: React.Dispatch<React.SetStateAction<AssignmentItem[]>>;
  onShowToast: (msg: string) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  setAssignments,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New assignment form state
  const [title, setTitle] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('2026-08-10');
  const [dueTime, setDueTime] = useState<string>('23:59');
  const [memo, setMemo] = useState<string>('');

  // D-Day calculation helper function
  const getDDay = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'D-Day', color: 'bg-rose-500 text-white animate-pulse', isUrgent: true };
    if (diffDays > 0) {
      if (diffDays <= 3) {
        return { label: `D-${diffDays}`, color: 'bg-rose-100 text-rose-700 border-rose-300', isUrgent: true };
      }
      return { label: `D-${diffDays}`, color: 'bg-sky-100 text-[#0577B2] border-sky-300', isUrgent: false };
    }
    return { label: `D+${Math.abs(diffDays)} (지남)`, color: 'bg-slate-200 text-slate-600', isUrgent: false };
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (filter === 'pending') return !asg.completed;
    if (filter === 'completed') return asg.completed;
    return true;
  });

  const handleToggleComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = !a.completed;
          onShowToast(updated ? `✅ 과제가 완료 처리되었습니다!` : '과제가 미완료로 변경되었습니다.');
          return { ...a, completed: updated };
        }
        return a;
      })
    );
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseName.trim()) return;

    const newAssignment: AssignmentItem = {
      id: `asg_${Date.now()}`,
      title: title.trim(),
      courseName: courseName.trim(),
      dueDate,
      dueTime,
      completed: false,
      memo: memo.trim(),
    };

    setAssignments([newAssignment, ...assignments]);
    setIsAddModalOpen(false);
    setTitle('');
    setCourseName('');
    setMemo('');
    onShowToast(`📝 과제 "${newAssignment.title}" 등록 완료!`);
  };

  const handleDeleteAssignment = (id: string, name: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
    onShowToast(`과제 "${name}" 삭제 완료.`);
  };

  const pendingCount = assignments.filter((a) => !a.completed).length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#0577B2]" />
            <span>과제 D-Day 리스트</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
              마감임박 {pendingCount}개
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            제출 기한 카운트다운 D-Day 및 과제 이행 상태 관리
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-[#0A174C] hover:bg-[#0577B2] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 과제 등록</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'pending'
              ? 'bg-[#0A174C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          진행중 과제 ({assignments.filter((a) => !a.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-[#0577B2] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          제출완료 ({assignments.filter((a) => a.completed).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          전체 보기 ({assignments.length})
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-slate-700 font-bold text-sm">해당하는 과제 항목이 없습니다.</p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const ddayInfo = getDDay(asg.dueDate);
            return (
              <div
                key={asg.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  asg.completed
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : ddayInfo.isUrgent
                    ? 'border-rose-200 ring-2 ring-rose-100'
                    : 'border-slate-200/80 hover:border-[#0577B2]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(asg.id)}
                    className={`w-6 h-6 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                      asg.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-[#0577B2]'
                    }`}
                  >
                    {asg.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0A174C] text-[10px] font-extrabold border border-slate-200">
                        {asg.courseName}
                      </span>
                      <h3
                        className={`font-extrabold text-sm ${
                          asg.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {asg.title}
                      </h3>
                    </div>

                    {asg.memo && (
                      <p className="text-xs text-slate-500 font-medium pl-0.5">{asg.memo}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        마감: {asg.dueDate} ({asg.dueTime})
                      </span>
                    </div>
                  </div>
                </div>

                {/* D-Day Tag & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black shadow-xs border ${ddayInfo.color}`}
                  >
                    {asg.completed ? '제출 완료' : ddayInfo.label}
                  </span>

                  <button
                    onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="과제 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Assignment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">새 과제 D-Day 등록</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">과목명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 웹프레임워크실습"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">과제 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: React 컴포넌트 과제 제출"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">마감 날짜 *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">마감 시간</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">과제 메모 / 상세 내용</label>
                <textarea
                  rows={2}
                  placeholder="제출 방식이나 유의사항을 메모해 두세요."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A174C] text-white font-bold rounded-xl hover:bg-[#0577B2] transition-colors"
                >
                  과제 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
