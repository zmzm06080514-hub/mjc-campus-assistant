import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Users, X, ChevronLeft, Search, Radio } from 'lucide-react';
import {
  ChatMessage,
  ChatSummary,
  DirectoryUser,
  ensureDmChat,
  ensureMealChat,
  findRealUser,
  sendMessage,
  subscribeMessages,
  subscribeMyChats,
  subscribeUserDirectory,
} from '../data/chat';

interface ChatDrawerProps {
  uid: string;
  myNickname: string;
  /** 게시글/댓글의 "쪽지" 버튼에서 넘어온 대상. 실제 채팅 사용자가 아니면(목업 데이터)
   * 안내만 하고 사용자 목록으로 대체한다. */
  initialDmTarget?: { uid: string; name: string } | null;
  /** 밥매칭 카드의 "그룹채팅" 버튼에서 넘어온 대상. */
  initialMealChat?: { mealMatchId: string; title: string } | null;
  onClose: () => void;
}

function otherMember(chat: ChatSummary, myUid: string): string {
  const otherUid = chat.memberUids.find((u) => u !== myUid);
  if (!otherUid) return '(알 수 없음)';
  return chat.memberNicknames?.[otherUid] ?? '(알 수 없음)';
}

function chatTitle(chat: ChatSummary, myUid: string): string {
  if (chat.type === 'meal') return `🍚 ${chat.title ?? '밥매칭 그룹채팅'}`;
  return otherMember(chat, myUid);
}

function formatTime(ts?: { toDate: () => Date }): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  uid,
  myNickname,
  initialDmTarget,
  initialMealChat,
  onClose,
}) => {
  const [view, setView] = useState<'list' | 'thread'>('list');
  const [listTab, setListTab] = useState<'chats' | 'users'>('chats');
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 내 대화 목록 + 접속자 목록 실시간 구독
  useEffect(() => {
    const unsubChats = subscribeMyChats(uid, setChats);
    const unsubUsers = subscribeUserDirectory(uid, setDirectory);
    return () => {
      unsubChats();
      unsubUsers();
    };
  }, [uid]);

  // 활성화된 채팅방의 메시지 실시간 구독
  useEffect(() => {
    if (!activeChat) return;
    const unsub = subscribeMessages(activeChat.id, setMessages);
    return unsub;
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChat = (chat: ChatSummary) => {
    setActiveChat(chat);
    setView('thread');
    setNotice(null);
  };

  // "쪽지" 버튼 등에서 특정 대상과의 1:1 채팅을 요청받은 경우
  useEffect(() => {
    if (!initialDmTarget) return;
    (async () => {
      const peer = await findRealUser(initialDmTarget.uid);
      if (!peer) {
        setNotice(
          `"${initialDmTarget.name}"님은 아직 이 실시간 채팅에 접속한 적이 없어요 (데모 게시글 작성자). 아래 접속자 목록에서 실제 대화를 시작해보세요!`
        );
        setListTab('users');
        return;
      }
      const chatId = await ensureDmChat(uid, myNickname, peer);
      if (chatId) {
        openChat({
          id: chatId,
          type: 'dm',
          memberUids: [uid, peer.uid],
          memberNicknames: { [uid]: myNickname, [peer.uid]: peer.nickname },
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDmTarget]);

  // 밥매칭 카드의 "그룹채팅" 버튼에서 넘어온 경우
  useEffect(() => {
    if (!initialMealChat) return;
    (async () => {
      const chatId = await ensureMealChat(
        initialMealChat.mealMatchId,
        initialMealChat.title,
        uid,
        myNickname
      );
      if (chatId) {
        openChat({
          id: chatId,
          type: 'meal',
          mealMatchId: initialMealChat.mealMatchId,
          title: initialMealChat.title,
          memberUids: [uid],
          memberNicknames: { [uid]: myNickname },
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMealChat]);

  const handleStartDm = async (peer: DirectoryUser) => {
    const chatId = await ensureDmChat(uid, myNickname, peer);
    if (chatId) {
      openChat({
        id: chatId,
        type: 'dm',
        memberUids: [uid, peer.uid],
        memberNicknames: { [uid]: myNickname, [peer.uid]: peer.nickname },
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !input.trim()) return;
    const text = input;
    setInput('');
    await sendMessage(activeChat.id, uid, myNickname, text);
  };

  const filteredDirectory = directory.filter((u) =>
    u.nickname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#0A174C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {view === 'thread' ? (
              <button
                onClick={() => setView('list')}
                className="p-1 -ml-1 text-white/80 hover:text-white"
                aria-label="목록으로"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <MessageCircle className="w-5 h-5 text-sky-300 shrink-0" />
            )}
            <h3 className="font-extrabold text-base truncate">
              {view === 'thread' && activeChat ? chatTitle(activeChat, uid) : '실시간 채팅'}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold flex items-center gap-0.5 shrink-0">
              <Radio className="w-2.5 h-2.5" />
              LIVE
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold p-1 text-lg">
            ✕
          </button>
        </div>

        {view === 'list' && (
          <>
            <div className="p-2 bg-slate-100 flex items-center gap-2 border-b border-slate-200/80 text-xs font-bold">
              <button
                onClick={() => setListTab('chats')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  listTab === 'chats' ? 'bg-[#0577B2] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                대화 ({chats.length})
              </button>
              <button
                onClick={() => setListTab('users')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  listTab === 'users' ? 'bg-[#0577B2] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                접속자 ({directory.length})
              </button>
            </div>

            {notice && (
              <div className="m-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                {notice}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {listTab === 'chats' &&
                (chats.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">아직 대화가 없어요.</p>
                    <p className="text-xs mt-1">접속자 탭에서 실제 사용자와 채팅을 시작해보세요.</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => openChat(chat)}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-2xl hover:border-[#0577B2] transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                        {chat.type === 'meal' ? '🍚' : chatTitle(chat, uid).slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {chatTitle(chat, uid)}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTime(chat.updatedAt as unknown as { toDate: () => Date })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {chat.lastMessage ?? '대화를 시작해보세요'}
                        </p>
                      </div>
                    </button>
                  ))
                ))}

              {listTab === 'users' && (
                <>
                  <div className="relative mb-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="닉네임 검색..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0577B2]"
                    />
                  </div>
                  {filteredDirectory.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-sm">
                        {directory.length === 0
                          ? '아직 접속한 다른 사용자가 없어요.'
                          : '검색 결과가 없어요.'}
                      </p>
                    </div>
                  ) : (
                    filteredDirectory.map((u) => (
                      <button
                        key={u.uid}
                        onClick={() => handleStartDm(u)}
                        className="w-full text-left p-3 bg-white border border-slate-200 rounded-2xl hover:border-[#0577B2] transition-all flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sm font-bold text-[#0577B2] shrink-0">
                          {u.nickname.slice(0, 1)}
                        </div>
                        <span className="font-bold text-sm text-slate-900">{u.nickname}</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </>
        )}

        {view === 'thread' && activeChat && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-sm font-bold">첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderUid === uid;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        {!isMine && (
                          <span className="text-[10px] font-bold text-slate-500 px-1">
                            {msg.senderNickname}
                          </span>
                        )}
                        <div className="flex items-end gap-1.5">
                          {isMine && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(msg.createdAt as unknown as { toDate: () => Date })}
                            </span>
                          )}
                          <div
                            className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                              isMine
                                ? 'bg-[#0577B2] text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                            }`}
                          >
                            {msg.text}
                          </div>
                          {!isMine && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(msg.createdAt as unknown as { toDate: () => Date })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0577B2]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-[#0A174C] hover:bg-[#0577B2] disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
                aria-label="전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
