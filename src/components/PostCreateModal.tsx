import React, { useState } from 'react';
import { CommunityPost, PostTab, CampusType, UserProfile, UserRole } from '../types';
import { Image as ImageIcon, Plus, Trash2, Shield, User, Sparkles, X } from 'lucide-react';

interface PostCreateModalProps {
  campus: CampusType;
  currentUser: UserProfile;
  userRole: UserRole;
  isGlobalAnonymous: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: CommunityPost) => void;
  onShowToast: (msg: string) => void;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({
  campus,
  currentUser,
  userRole,
  isGlobalAnonymous,
  onClose,
  onSubmitPost,
  onShowToast,
}) => {
  const [tab, setTab] = useState<PostTab>('meal');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isAnon, setIsAnon] = useState<boolean>(isGlobalAnonymous);

  // Images state (2 to 3 images)
  const [image1, setImage1] = useState<string>('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
  const [image2, setImage2] = useState<string>('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80');
  const [image3, setImage3] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if ((tab === 'notice' || tab === 'event') && userRole !== 'admin') {
      onShowToast('공지 및 이벤트 탭은 관리자 권한만 작성 가능합니다.');
      return;
    }

    const imagesList = [image1.trim(), image2.trim(), image3.trim()].filter(Boolean);

    if (imagesList.length === 0) {
      onShowToast('이미지를 최소 1장 이상 입력해주세요 (2~3장 권장).');
      return;
    }

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      campus,
      tab,
      title: title.trim(),
      content: content.trim(),
      images: imagesList,
      authorId: currentUser.id,
      authorName: isAnon ? '익명의 명지인' : currentUser.nickname,
      isAnonymous: isAnon,
      createdAt: '방금 전',
      likesCount: 0,
      isLiked: false,
      comments: [],
      reportsCount: 0,
      isNotice: tab === 'notice',
    };

    onSubmitPost(newPost);
    onClose();
    onShowToast(`🎉 [${tab.toUpperCase()}] 게시물이 등록되었습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0577B2]" />
            <span>새 게시글 작성</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Post Category Tab Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">게시판 카테고리 선택 *</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTab('meal')}
                className={`py-2 rounded-lg font-extrabold transition-all ${
                  tab === 'meal' ? 'bg-[#0A174C] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                🍱 밥
              </button>
              <button
                type="button"
                onClick={() => setTab('lecture')}
                className={`py-2 rounded-lg font-extrabold transition-all ${
                  tab === 'lecture' ? 'bg-[#0A174C] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                📚 강의
              </button>
              <button
                type="button"
                onClick={() => setTab('notice')}
                className={`py-2 rounded-lg font-extrabold transition-all relative ${
                  tab === 'notice'
                    ? 'bg-[#0577B2] text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                📢 공지
                {userRole !== 'admin' && <span className="text-[8px] text-amber-500 block">관리자 전용</span>}
              </button>
              <button
                type="button"
                onClick={() => setTab('event')}
                className={`py-2 rounded-lg font-extrabold transition-all relative ${
                  tab === 'event'
                    ? 'bg-[#0577B2] text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                🎉 이벤트
                {userRole !== 'admin' && <span className="text-[8px] text-amber-500 block">관리자 전용</span>}
              </button>
            </div>
          </div>

          {/* Author Identity Selector: Anonymous vs Nickname */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-800 block">작성자 명의 선택</span>
              <span className="text-[10px] text-slate-500">익명 또는 등록된 아이디로 설정</span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setIsAnon(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isAnon ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                익명
              </button>
              <button
                type="button"
                onClick={() => setIsAnon(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  !isAnon ? 'bg-[#0577B2] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                ID: {currentUser.nickname}
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">제목 *</label>
            <input
              type="text"
              required
              placeholder="게시글 제목을 입력하세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">내용 *</label>
            <textarea
              rows={4}
              required
              placeholder="명지전문대 학우들과 공유할 내용을 자유롭게 작성하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
            />
          </div>

          {/* Image Input URLs (2-3 Images required for Instagram style post) */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-[#0577B2]" />
                <span>이미지 첨부 (2~3장)</span>
              </label>
              <span className="text-[10px] text-[#0577B2] font-bold">인스타그램 스타일 캐러셀</span>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="첫 번째 이미지 URL (기본 제공)"
                value={image1}
                onChange={(e) => setImage1(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="두 번째 이미지 URL"
                value={image2}
                onChange={(e) => setImage2(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="세 번째 이미지 URL (선택)"
                value={image3}
                onChange={(e) => setImage3(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#0A174C] text-white font-bold rounded-xl hover:bg-[#0577B2] transition-colors"
            >
              게시글 게시
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
