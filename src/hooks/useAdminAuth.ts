import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * 이메일/비밀번호 회원가입·로그인은 누구나 가능하지만, 로그인한 계정의 이메일이
 * VITE_ADMIN_EMAIL과 일치할 때만 관리자 기능(isAdmin)에 접근할 수 있다.
 * 채팅용 익명 로그인(useChatIdentity)과 같은 Firebase Auth 인스턴스를 공유하므로,
 * 이메일 로그인 시 채팅 아이덴티티(uid)도 함께 바뀐다 — 설계 문서의 트레이드오프 참고.
 */
export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      // 익명 세션은 관리자 후보가 아니므로 이메일 계정일 때만 user로 취급한다.
      setUser(u && !u.isAnonymous ? u : null);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    if (db) {
      await setDoc(
        doc(db, 'users', newUser.uid),
        { email, createdAt: serverTimestamp() },
        { merge: true }
      );
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return {
    user,
    isAdmin: Boolean(user?.email && ADMIN_EMAIL && user.email === ADMIN_EMAIL),
    loading,
    login,
    signup,
    logout,
  };
}
