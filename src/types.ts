export type CampusType = 'seoul';

export type PostTab = 'all' | 'meal' | 'lecture' | 'notice' | 'event';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
  avatarUrl: string;
  department: string;
}

export interface BusRoute {
  id: string;
  campus: CampusType;
  busNumber: string;
  routeType: 'shuttle' | 'city' | 'express' | 'village';
  destination: string;
  nextArrivalMinutes: number;
  stopsAway: number;
  crowdedness: '여유' | '보통' | '혼잡';
  operatingHours: string;
  stops: string[];
  // 서울시 버스도착정보 API로 실시간 도착정보를 조회할 수 있는 노선만 채워둔다.
  // (학교 자체 셔틀버스처럼 공공 API에 없는 노선은 undefined로 두고 시뮬레이션 값을 그대로 쓴다.)
  seoulBusStop?: {
    stId: string; // 정류소 고유 ID
    busRouteId: string; // 노선 ID
    ord: number; // 정류소 순번
  };
}

export interface FoodSpot {
  id: string;
  campus: CampusType;
  name: string;
  category: '한식' | '양식/일식' | '중식' | '카페/디저트' | '술집/야식' | '분식';
  address: string;
  lat: number; // percentage offset for custom interactive map (0-100)
  lng: number; // percentage offset for custom interactive map (0-100)
  rating: number;
  phone: string;
  images: string[];
  description: string;
  popularMenus: { name: string; price: string }[];
  reviewsCount: number;
}

export interface ClassItem {
  id: string;
  name: string;
  professor: string;
  room: string;
  dayOfWeek: '월' | '화' | '수' | '목' | '금' | '토';
  startTime: string; // e.g., "10:30"
  endTime: string;   // e.g., "12:00"
  color: string;     // Hex color code
}

export interface AssignmentItem {
  id: string;
  title: string;
  courseName: string;
  dueDate: string; // YYYY-MM-DD format
  dueTime: string; // HH:mm format
  completed: boolean;
  memo?: string;
}

export interface MealMatch {
  id: string;
  campus: CampusType;
  title: string;
  menuOrLocation: string;
  mealType: '점심' | '저녁' | '야식' | '간식' | '카페';
  targetTime: string;
  maxPeople: number;
  currentPeople: number;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  status: 'open' | 'closed';
  participants: string[];
  description: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  reportsCount: number;
}

export interface CommunityPost {
  id: string;
  campus: CampusType;
  tab: PostTab;
  title: string;
  content: string;
  images: string[]; // 1 to 3 images
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  comments: PostComment[];
  reportsCount: number;
  isNotice?: boolean;
}

export interface NoteMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  relatedPostTitle?: string;
}

export interface ContentReport {
  id: string;
  contentType: 'post' | 'comment';
  targetId: string;
  targetTitleOrContent: string;
  authorName: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'deleted';
  createdAt: string;
}
