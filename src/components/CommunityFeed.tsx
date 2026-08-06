import React, { useState } from 'react';
import { CommunityPost, PostTab, UserProfile, CampusType, PostComment, UserRole } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  AlertTriangle,
  Send,
  Plus,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  Sparkles,
  Megaphone,
  SparkleIcon,
  BookOpen,
  Utensils,
  Maximize2,
} from 'lucide-react';

interface CommunityFeedProps {
  campus: CampusType;
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  currentUser: UserProfile;
  userRole: UserRole;
  onOpenCreateModal: () => void;
  onOpenSendNote: (receiverId: string, receiverName: string, relatedTitle?: string) => void;
  onReportContent: (type: 'post' | 'comment', id: string, titleOrContent: string, authorName: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  campus,
  posts,
  setPosts,
  currentUser,
  userRole,
  onOpenCreateModal,
  onOpenSendNote,
  onReportContent,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<PostTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [commentIsAnon, setCommentIsAnon] = useState<{ [postId: string]: boolean }>({});
  const [activeImageIndices, setActiveImageIndices] = useState<{ [postId: string]: number }>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Filter posts by campus and active tab
  const filteredPosts = posts.filter((post) => {
    if (post.campus !== campus) return false;
    if (activeTab !== 'all' && post.tab !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          return { ...p, isLiked, likesCount };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const isAnon = commentIsAnon[postId] ?? true;

    const newComment: PostComment = {
      id: `cmt_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: isAnon ? '익명의 명지인' : currentUser.nickname,
      isAnonymous: isAnon,
      content: text,
      createdAt: '방금 전',
      reportsCount: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });
    onShowToast('💬 댓글이 등록되었습니다.');
  };

  const tabsConfig = [
    { id: 'all', label: '전체', icon: Sparkles },
    { id: 'meal', label: '밥', icon: Utensils },
    { id: 'lecture', label: '강의', icon: BookOpen },
    { id: 'notice', label: '공지', icon: Megaphone },
    { id: 'event', label: '이벤트', icon: SparkleIcon },
  ] as const;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Top Instagram / App Style Tabs Menu Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PostTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#0A174C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Post Creation Trigger */}
        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-2 bg-[#0577B2] text-white rounded-xl text-xs font-extrabold hover:bg-[#0A174C] transition-colors flex items-center gap-1 shrink-0 shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>글쓰기</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="게시글 제목, 내용, 작성자 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0577B2] shadow-2xs"
        />
      </div>

      {/* Feed Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <MessageCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-700 font-bold text-sm">해당 탭의 게시글이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">첫번째 소식을 등록해보세요!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const currentImgIdx = activeImageIndices[post.id] || 0;

            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Instagram Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A174C] to-[#0577B2] p-0.5 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {post.isNotice ? (
                        <Megaphone className="w-4 h-4 text-amber-300" />
                      ) : (
                        post.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {post.authorName}
                        </span>
                        {post.isNotice && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black">
                            공지사항
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold">
                          {post.tab === 'meal'
                            ? '밥'
                            : post.tab === 'lecture'
                            ? '강의'
                            : post.tab === 'notice'
                            ? '공지'
                            : '이벤트'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {post.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown / Direct Note Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onOpenSendNote(post.authorId, post.authorName, post.title)
                      }
                      className="px-2.5 py-1 bg-sky-50 text-[#0577B2] hover:bg-sky-100 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      title="작성자에게 1:1 채팅"
                    >
                      <Send className="w-3 h-3" />
                      <span>1:1 채팅</span>
                    </button>

                    <button
                      onClick={() =>
                        onReportContent('post', post.id, post.title, post.authorName)
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="게시글 신고하기"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Instagram Image Carousel (2-3 Images) */}
                {post.images && post.images.length > 0 && (
                  <div className="relative bg-slate-900 group">
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden flex items-center justify-center">
                      <img
                        src={post.images[currentImgIdx]}
                        alt={`post-img-${currentImgIdx}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setExpandedImage(post.images[currentImgIdx])}
                      />

                      <button
                        onClick={() => setExpandedImage(post.images[currentImgIdx])}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors opacity-80 group-hover:opacity-100"
                        title="크게 보기"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {post.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setActiveImageIndices((prev) => ({
                                ...prev,
                                [post.id]:
                                  currentImgIdx === 0
                                    ? post.images.length - 1
                                    : currentImgIdx - 1,
                              }))
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setActiveImageIndices((prev) => ({
                                ...prev,
                                [post.id]:
                                  currentImgIdx === post.images.length - 1
                                    ? 0
                                    : currentImgIdx + 1,
                              }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full">
                            {post.images.map((_, idx) => (
                              <span
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  currentImgIdx === idx ? 'bg-white w-4' : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-4">
                    {post.isNotice ? (
                      // 공지사항은 좋아요를 누를 수 없다 (공식 공지에 대한 감정표현 방지).
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Heart className="w-4 h-4" />
                        <span>좋아요 {post.likesCount}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-transform active:scale-125 ${
                          post.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`}
                        />
                        <span>좋아요 {post.likesCount}</span>
                      </button>
                    )}

                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MessageCircle className="w-4 h-4" />
                      <span>댓글 {post.comments.length}개</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      onShowToast('🔗 게시글 링크가 복사되었습니다!');
                    }}
                    className="p-1 hover:text-[#0577B2] transition-colors"
                    title="공유"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment Section */}
                <div className="bg-slate-50/70 p-3.5 border-t border-slate-100 space-y-3">
                  {post.comments.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {comment.createdAt}
                              </span>
                            </div>
                            <p className="text-slate-700 mt-0.5">{comment.content}</p>
                          </div>

                          <button
                            onClick={() =>
                              onReportContent(
                                'comment',
                                comment.id,
                                comment.content,
                                comment.authorName
                              )
                            }
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                            title="댓글 신고"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input Form */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>댓글 작성하기</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">작성 명의:</span>
                        <button
                          onClick={() =>
                            setCommentIsAnon({
                              ...commentIsAnon,
                              [post.id]: !(commentIsAnon[post.id] ?? true),
                            })
                          }
                          className={`px-2 py-0.5 rounded-md font-extrabold transition-all ${
                            (commentIsAnon[post.id] ?? true)
                              ? 'bg-slate-800 text-white'
                              : 'bg-[#0577B2] text-white'
                          }`}
                        >
                          {(commentIsAnon[post.id] ?? true)
                            ? '익명'
                            : currentUser.nickname}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="따뜻한 댓글을 남겨주세요..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0577B2]"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 bg-[#0A174C] text-white text-xs font-bold rounded-xl hover:bg-[#0577B2] transition-colors shrink-0"
                      >
                        등록
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Enlarged"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
