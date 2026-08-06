import React, { useState } from 'react';
import { NoteMessage, UserProfile } from '../types';
import { Mail, Send, CheckCircle2, Clock, User, X, Inbox } from 'lucide-react';

interface NoteDrawerProps {
  currentUser: UserProfile;
  notes: NoteMessage[];
  setNotes: React.Dispatch<React.SetStateAction<NoteMessage[]>>;
  initialSendTarget?: { receiverId: string; receiverName: string; relatedTitle?: string } | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NoteDrawer: React.FC<NoteDrawerProps> = ({
  currentUser,
  notes,
  setNotes,
  initialSendTarget,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>(
    initialSendTarget ? 'compose' : 'inbox'
  );

  // Send Note Form State
  const [receiverName, setReceiverName] = useState<string>(
    initialSendTarget?.receiverName || ''
  );
  const [receiverId, setReceiverId] = useState<string>(
    initialSendTarget?.receiverId || ''
  );
  const [content, setContent] = useState<string>('');
  const [relatedTitle, setRelatedTitle] = useState<string>(
    initialSendTarget?.relatedTitle || ''
  );

  const inboxNotes = notes.filter((n) => n.receiverId === currentUser.id);
  const sentNotes = notes.filter((n) => n.senderId === currentUser.id);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim() || !content.trim()) return;

    const newNote: NoteMessage = {
      id: `note_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      receiverId: receiverId || 'usr_target',
      receiverName: receiverName.trim(),
      content: content.trim(),
      sentAt: '방금 전',
      isRead: false,
      relatedPostTitle: relatedTitle,
    };

    setNotes([newNote, ...notes]);
    setContent('');
    setActiveTab('sent');
    onShowToast(`✉️ "${receiverName}" 님에게 쪽지가 발송되었습니다!`);
  };

  const handleMarkAsRead = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#0A174C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-300" />
            <h3 className="font-extrabold text-base">명지전문대 쪽지함 (DM)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="p-2 bg-slate-100 flex items-center justify-around border-b border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-[#0577B2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>받은 쪽지 ({inboxNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'sent'
                ? 'bg-[#0577B2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>보낸 쪽지 ({sentNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'compose'
                ? 'bg-[#0A174C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>쪽지 쓰기</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'inbox' && (
            <div className="space-y-3">
              {inboxNotes.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-sm">받은 쪽지가 없습니다.</p>
                </div>
              ) : (
                inboxNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleMarkAsRead(note.id)}
                    className={`p-3.5 rounded-2xl border transition-all space-y-1.5 cursor-pointer ${
                      !note.isRead
                        ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#0A174C] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#0577B2]" />
                        보낸이: {note.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {note.sentAt}
                      </span>
                    </div>

                    {note.relatedPostTitle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold block truncate">
                        관련글: {note.relatedPostTitle}
                      </span>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-3">
              {sentNotes.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Send className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-sm">보낸 쪽지가 없습니다.</p>
                </div>
              ) : (
                sentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">
                        받는이: {note.receiverName}
                      </span>
                      <span className="text-[10px] text-slate-400">{note.sentAt}</span>
                    </div>

                    {note.relatedPostTitle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold block truncate">
                        관련글: {note.relatedPostTitle}
                      </span>
                    )}

                    <p className="text-slate-700 leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'compose' && (
            <form onSubmit={handleSendNote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">받는 사람 (닉네임/아이디) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 백호99 또는 익명의 명지인"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              {relatedTitle && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">관련 게시글</label>
                  <input
                    type="text"
                    disabled
                    value={relatedTitle}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">쪽지 내용 *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="매너있고 따뜻한 쪽지를 작성해주세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0A174C] hover:bg-[#0577B2] text-white font-extrabold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>쪽지 전송하기</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
