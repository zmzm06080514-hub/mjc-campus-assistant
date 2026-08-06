import React, { useState } from 'react';
import { MealMatch, CampusType, UserProfile } from '../types';
import { Users, Plus, Clock, Utensils, MessageSquare, Send, Check, User } from 'lucide-react';

interface MealMatchingProps {
  campus: CampusType;
  mealMatches: MealMatch[];
  setMealMatches: React.Dispatch<React.SetStateAction<MealMatch[]>>;
  currentUser: UserProfile;
  onOpenSendNote: (receiverId: string, receiverName: string, relatedTitle?: string) => void;
  onOpenMealChat: (mealMatchId: string, title: string) => void;
  onShowToast: (msg: string) => void;
  isGlobalAnonymous: boolean;
}

export const MealMatching: React.FC<MealMatchingProps> = ({
  campus,
  mealMatches,
  setMealMatches,
  currentUser,
  onOpenSendNote,
  onOpenMealChat,
  onShowToast,
  isGlobalAnonymous,
}) => {
  const [filterType, setFilterType] = useState<string>('전체');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Meal Form
  const [title, setTitle] = useState<string>('');
  const [menuOrLocation, setMenuOrLocation] = useState<string>('');
  const [mealType, setMealType] = useState<MealMatch['mealType']>('점심');
  const [targetTime, setTargetTime] = useState<string>('12:30');
  const [maxPeople, setMaxPeople] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [isAnonPost, setIsAnonPost] = useState<boolean>(isGlobalAnonymous);

  const campusMatches = mealMatches.filter((m) => m.campus === campus);

  const handleJoinMatch = (matchId: string) => {
    setMealMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          if (m.participants.includes(currentUser.nickname)) {
            onShowToast('이미 매칭에 참여중입니다.');
            return m;
          }
          if (m.currentPeople >= m.maxPeople) {
            onShowToast('이미 매칭 인원이 마감되었습니다.');
            return m;
          }

          const updatedCurrent = m.currentPeople + 1;
          const isClosed = updatedCurrent >= m.maxPeople;
          onShowToast(`🎉 밥 매칭 참여 완료! 작성자에게 쪽지를 전송해보세요.`);
          return {
            ...m,
            currentPeople: updatedCurrent,
            status: isClosed ? 'closed' : 'open',
            participants: [...m.participants, currentUser.nickname],
          };
        }
        return m;
      })
    );
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !menuOrLocation.trim()) return;

    const newMatch: MealMatch = {
      id: `meal_${Date.now()}`,
      campus,
      title: title.trim(),
      menuOrLocation: menuOrLocation.trim(),
      mealType,
      targetTime,
      maxPeople,
      currentPeople: 1,
      authorId: currentUser.id,
      authorName: isAnonPost ? '익명의 명지인' : currentUser.nickname,
      isAnonymous: isAnonPost,
      createdAt: '방금 전',
      status: 'open',
      participants: [isAnonPost ? '익명의 명지인' : currentUser.nickname],
      description: description.trim() || '같이 맛있는 식사해요!',
    };

    setMealMatches([newMatch, ...mealMatches]);
    setIsModalOpen(false);
    setTitle('');
    setMenuOrLocation('');
    setDescription('');
    onShowToast(`🍱 밥 매칭 게시글이 등록되었습니다!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0577B2]" />
            <span>밥 매칭 (학우 밥친구 구하기)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              모집중 {campusMatches.filter((m) => m.status === 'open').length}건
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            학생식당 혼밥이 어색하거나 학교 앞 맛집 함께 갈 식사 친구를 모집하세요!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-[#0A174C] hover:bg-[#0577B2] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>밥 매칭 글쓰기</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['전체', '모집중', '점심', '저녁', '야식'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterType === cat
                ? 'bg-[#0A174C] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Match Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {campusMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-700 font-bold text-sm">현재 등록된 밥 매칭 글이 없습니다.</p>
          </div>
        ) : (
          campusMatches
            .filter((m) => {
              if (filterType === '모집중') return m.status === 'open';
              if (filterType !== '전체') return m.mealType === filterType;
              return true;
            })
            .map((match) => {
              const isFull = match.currentPeople >= match.maxPeople;
              const hasJoined = match.participants.includes(currentUser.nickname);

              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                    match.status === 'closed'
                      ? 'border-slate-200 bg-slate-50/70'
                      : 'border-slate-200/80 hover:border-[#0577B2]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-[#0577B2]/10 text-[#0577B2] text-[11px] font-extrabold">
                          {match.mealType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {match.createdAt}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          match.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {match.status === 'open'
                          ? `모집중 (${match.currentPeople}/${match.maxPeople}명)`
                          : '마감완료'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {match.title}
                    </h3>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Utensils className="w-3.5 h-3.5 text-[#0577B2]" />
                        <span>{match.menuOrLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>약속시간: {match.targetTime}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{match.description}</p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                        {match.authorName.charAt(0)}
                      </span>
                      <span className="font-bold text-slate-800">{match.authorName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenMealChat(match.id, match.title)}
                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0577B2] font-bold rounded-lg transition-colors flex items-center gap-1"
                        title="이 밥약속 그룹채팅 참여"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>그룹채팅</span>
                      </button>

                      <button
                        onClick={() =>
                          onOpenSendNote(match.authorId, match.authorName, match.title)
                        }
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                        title="작성자에게 1:1 채팅"
                      >
                        <Send className="w-3 h-3 text-[#0577B2]" />
                        <span>1:1</span>
                      </button>

                      <button
                        onClick={() => handleJoinMatch(match.id)}
                        disabled={isFull || hasJoined}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          hasJoined
                            ? 'bg-emerald-500 text-white cursor-default'
                            : isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-[#0A174C] hover:bg-[#0577B2] text-white shadow-xs'
                        }`}
                      >
                        {hasJoined ? '참여완료' : isFull ? '마감' : '참여하기'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Create Meal Match Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#0577B2]" />
                <span>새 밥 매칭 모집글 작성</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 오늘 점심 학식 같이 드실 분 구해요!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">식사 종류</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealMatch['mealType'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  >
                    <option value="점심">점심</option>
                    <option value="저녁">저녁</option>
                    <option value="야식">야식</option>
                    <option value="간식">간식</option>
                    <option value="카페">카페</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">약속 시간</label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">식사 장소 / 메뉴 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 학생식당 2층 / 정문 엄마손떡볶이"
                  value={menuOrLocation}
                  onChange={(e) => setMenuOrLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">모집 인원 (본인 포함)</label>
                <select
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                >
                  <option value={2}>2명 (1:1)</option>
                  <option value={3}>3명</option>
                  <option value={4}>4명</option>
                  <option value={5}>5명 이상</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상세 설명 메모</label>
                <textarea
                  rows={2}
                  placeholder="메뉴 선호도나 만날 장소를 간단히 적어주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              {/* Anonymous vs Nickname toggle */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">작성자 명의</span>
                <div className="flex items-center gap-1.5 p-0.5 bg-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsAnonPost(true)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      isAnonPost ? 'bg-slate-800 text-white' : 'text-slate-600'
                    }`}
                  >
                    익명
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnonPost(false)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      !isAnonPost ? 'bg-[#0577B2] text-white' : 'text-slate-600'
                    }`}
                  >
                    {currentUser.nickname}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A174C] text-white font-bold rounded-xl hover:bg-[#0577B2] transition-colors"
                >
                  밥매칭 모집 시작
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
