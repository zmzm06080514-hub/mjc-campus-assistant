import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

export interface ChatIdentity {
  uid: string | null;
  nickname: string | null;
  /** Firebase 설정이 없거나(.env.local 미설정) 로그인 처리 중이면 true */
  loading: boolean;
  /** 채팅 기능을 쓸 수 있는 상태인지 (Firebase 설정 + 로그인 완료) */
  ready: boolean;
  setNickname: (name: string) => Promise<void>;
}

/**
 * 앱 진입 시 Firebase 익명 로그인으로 브라우저별 고유 uid를 발급받고,
 * Firestore users/{uid} 문서에 저장된 닉네임을 함께 관리한다.
 * (닉네임이 없으면 최초 1회 입력받아야 한다 — NicknameModal에서 처리)
 */
export function useChatIdentity(): ChatIdentity {
  const [uid, setUid] = useState<string | null>(null);
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        signInAnonymously(auth).catch((err) => {
          console.error('[chat] 익명 로그인 실패:', err);
          setLoading(false);
        });
        return;
      }

      setUid(user.uid);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setNicknameState(snap.exists() ? ((snap.data().nickname as string) ?? null) : null);
      } catch (err) {
        console.error('[chat] 사용자 프로필 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const setNickname = async (name: string) => {
    if (!db || !uid) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    await setDoc(
      doc(db, 'users', uid),
      { nickname: trimmed, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setNicknameState(trimmed);
  };

  return {
    uid,
    nickname,
    loading,
    ready: isFirebaseConfigured && !loading && !!uid,
    setNickname,
  };
}
