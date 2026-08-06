import { CommunityPost } from '../types';

// scripts/crawlNotices.ts가 public/notices.json에 쓰는 형태 (클라이언트 번들에서
// Node 전용 크롤러 스크립트를 직접 import하지 않도록 형태만 여기서 복제해 둔다).
interface CrawledNotice {
  id: string;
  title: string;
  url: string;
  author: string;
  date: string;
  views: number;
  images: string[];
}

function toCommunityPost(notice: CrawledNotice): CommunityPost {
  return {
    id: `notice_${notice.id}`,
    campus: 'seoul',
    tab: 'notice',
    title: notice.title,
    content: `명지전문대학교 공지사항입니다. 원문: ${notice.url}`,
    images: notice.images,
    authorId: 'mjc_official',
    authorName: `${notice.author} (명지전문대 공식 공지)`,
    isAnonymous: false,
    createdAt: notice.date,
    likesCount: 0,
    isLiked: false,
    comments: [],
    reportsCount: 0,
    isNotice: true,
  };
}

/**
 * GitHub Actions가 매일 크롤링해 public/notices.json에 커밋해 둔 실제
 * 명지전문대 공지사항을 읽어 CommunityPost 형태로 변환한다.
 * 파일이 없거나(첫 배포 전) 네트워크 오류가 나도 앱은 정상 동작해야 하므로 실패 시 빈 배열을 반환한다.
 */
export async function fetchLiveNotices(): Promise<CommunityPost[]> {
  try {
    const res = await fetch('/notices.json');
    if (!res.ok) return [];
    const data: CrawledNotice[] = await res.json();
    return data.map(toCommunityPost);
  } catch {
    return [];
  }
}
