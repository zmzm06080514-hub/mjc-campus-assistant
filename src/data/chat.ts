import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatSummary {
  id: string;
  type: 'dm' | 'meal';
  memberUids: string[];
  memberNicknames: Record<string, string>;
  mealMatchId?: string;
  title?: string;
  lastMessage?: string;
  lastSenderUid?: string;
  updatedAt?: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderNickname: string;
  text: string;
  createdAt?: Timestamp;
}

export interface DirectoryUser {
  uid: string;
  nickname: string;
}

/** 두 uid로부터 항상 같은 1:1 채팅방 ID를 만든다 (누가 먼저 시작하든 같은 방으로 연결). */
export function dmChatId(uidA: string, uidB: string): string {
  return 'dm_' + [uidA, uidB].sort().join('_');
}

/** 밥매칭 글 하나당 채팅방 하나 — mealMatchId는 목업 데이터에서도 모든 브라우저가
 * 공유하는 고정값이라, 실제로 서로 다른 사람이어도 "같은 글"이면 같은 방에 모인다. */
export function mealChatId(mealMatchId: string): string {
  return 'meal_' + mealMatchId;
}

async function fetchUserNickname(uid: string): Promise<string | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ((snap.data().nickname as string) ?? null) : null;
}

/** peerUid가 실제로 닉네임을 등록한(=실존하는) 사용자인지 확인한다.
 * 목업 게시글 작성자(usr_02 등)처럼 실제 Firebase 사용자가 아닌 경우 null을 반환한다. */
export async function findRealUser(uid: string): Promise<DirectoryUser | null> {
  const nickname = await fetchUserNickname(uid);
  return nickname ? { uid, nickname } : null;
}

export async function ensureDmChat(
  myUid: string,
  myNickname: string,
  peer: DirectoryUser
): Promise<string | null> {
  if (!db) return null;
  const id = dmChatId(myUid, peer.uid);
  const ref = doc(db, 'chats', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      type: 'dm',
      memberUids: [myUid, peer.uid],
      memberNicknames: { [myUid]: myNickname, [peer.uid]: peer.nickname },
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

export async function ensureMealChat(
  mealMatchId: string,
  title: string,
  myUid: string,
  myNickname: string
): Promise<string | null> {
  if (!db) return null;
  const id = mealChatId(mealMatchId);
  const ref = doc(db, 'chats', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      type: 'meal',
      mealMatchId,
      title,
      memberUids: [myUid],
      memberNicknames: { [myUid]: myNickname },
      updatedAt: serverTimestamp(),
    });
  } else if (!(snap.data().memberUids as string[]).includes(myUid)) {
    await updateDoc(ref, {
      memberUids: arrayUnion(myUid),
      [`memberNicknames.${myUid}`]: myNickname,
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

export function subscribeMyChats(
  uid: string,
  cb: (chats: ChatSummary[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'chats'), where('memberUids', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as ChatSummary[];
    list.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
    cb(list);
  });
}

export function subscribeMessages(
  chatId: string,
  cb: (messages: ChatMessage[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as ChatMessage[]);
  });
}

export async function sendMessage(
  chatId: string,
  senderUid: string,
  senderNickname: string,
  text: string
): Promise<void> {
  if (!db) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderUid,
    senderNickname,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: trimmed,
    lastSenderUid: senderUid,
    updatedAt: serverTimestamp(),
  });
}

/** 실시간 대화 상대를 고를 수 있는 "접속자 목록" (닉네임을 등록한 모든 실제 사용자). */
export function subscribeUserDirectory(
  myUid: string,
  cb: (users: DirectoryUser[]) => void
): () => void {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'users'), (snap) => {
    const users = snap.docs
      .map((d) => ({ uid: d.id, nickname: (d.data() as { nickname?: string }).nickname ?? '' }))
      .filter((u) => u.nickname && u.uid !== myUid);
    cb(users);
  });
}
