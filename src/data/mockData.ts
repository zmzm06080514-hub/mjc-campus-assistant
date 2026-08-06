import { BusRoute, FoodSpot, ClassItem, AssignmentItem, MealMatch, CommunityPost, NoteMessage, ContentReport, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_mju_01',
  username: 'mju_student24',
  nickname: '명지백호24',
  role: 'user',
  department: '컴퓨터공학과',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

export const INITIAL_BUS_ROUTES: BusRoute[] = [
  {
    id: 'bus_seoul_shuttle_2',
    campus: 'seoul',
    busNumber: '명지전문대 직행 셔틀',
    routeType: 'shuttle',
    destination: '신촌역(2호선) ↔ 명지전문대 본관',
    nextArrivalMinutes: 7,
    stopsAway: 3,
    crowdedness: '여유',
    operatingHours: '08:20 - 17:50 (15분 간격)',
    stops: ['명지전문대 본관', '모래내시장', '신촌역 1번출구']
  },
  {
    id: 'bus_seoul_7019',
    campus: 'seoul',
    busNumber: '7019번 시내버스',
    routeType: 'city',
    destination: '시청 / 광화문 방향',
    nextArrivalMinutes: 4,
    stopsAway: 2,
    crowdedness: '혼잡',
    operatingHours: '05:00 - 23:20',
    stops: ['명지대사거리', '남가좌동', '서대문구청', '신촌역', '광화문']
  },
  {
    id: 'bus_seoul_7611',
    campus: 'seoul',
    busNumber: '7611번 시내버스',
    routeType: 'city',
    destination: '홍대입구역 / 여의도 방향',
    nextArrivalMinutes: 8,
    stopsAway: 4,
    crowdedness: '보통',
    operatingHours: '05:15 - 23:40',
    stops: ['명지대 정문', '연희동', '홍대입구역', '국회의사당']
  }
];

export const INITIAL_FOOD_SPOTS: FoodSpot[] = [
  {
    id: 'food_1',
    campus: 'seoul',
    name: '엄마손떡볶이',
    category: '분식',
    address: '서울 서대문구 증가로10길 16-20',
    lat: 38,
    lng: 42,
    rating: 4.8,
    phone: '02-304-0089',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'
    ],
    description: '명지전문대 학생들의 소울푸드! 카레향 나는 달콤매콤 떡볶이와 바삭한 김말이 튀김이 일품입니다.',
    popularMenus: [
      { name: '카레 떡볶이 1인분', price: '4,500원' },
      { name: '모듬튀김 (4개)', price: '3,500원' },
      { name: '찰순대', price: '4,000원' }
    ],
    reviewsCount: 128
  },
  {
    id: 'food_2',
    campus: 'seoul',
    name: '거북골 돈까스&우동',
    category: '양식/일식',
    address: '서울 서대문구 거북골로 33-1 1층',
    lat: 55,
    lng: 60,
    rating: 4.7,
    phone: '02-372-9921',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80'
    ],
    description: '수제 등심 돈까스와 얼큰한 김치나베 우동. 점심시간 줄 서는 대표 맛집입니다.',
    popularMenus: [
      { name: '수제 등심돈까스 정식', price: '9,500원' },
      { name: '김치치즈나베', price: '10,500원' }
    ],
    reviewsCount: 94
  },
  {
    id: 'food_3',
    campus: 'seoul',
    name: '명지 브라운 로스터리',
    category: '카페/디저트',
    address: '서울 서대문구 거북골로 21-4 2층',
    lat: 25,
    lng: 70,
    rating: 4.9,
    phone: '02-302-1209',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
    ],
    description: '아늑한 인스타 감성의 조용한 카공 카페. 시그니처 크림라떼와 수제 에그타르트 추천!',
    popularMenus: [
      { name: '명지 크림라떼', price: '5,500원' },
      { name: '수제 에그타르트', price: '3,200원' }
    ],
    reviewsCount: 210
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls_1',
    name: '웹프레임워크실습',
    professor: '김명지 교수님',
    room: 'S405 (컴퓨터관)',
    dayOfWeek: '월',
    startTime: '10:30',
    endTime: '12:00',
    color: '#0577B2'
  },
  {
    id: 'cls_2',
    name: '인공지능 개론',
    professor: '이창조 교수님',
    room: 'C302 (학생회관)',
    dayOfWeek: '월',
    startTime: '13:30',
    endTime: '15:00',
    color: '#0A174C'
  },
  {
    id: 'cls_3',
    name: '데이터베이스 시스템',
    professor: '박기술 교수님',
    room: 'S201 (컴퓨터관)',
    dayOfWeek: '화',
    startTime: '09:00',
    endTime: '10:30',
    color: '#10B981'
  },
  {
    id: 'cls_4',
    name: '모바일 앱 개발',
    professor: '최스마트 교수님',
    room: 'S405 (컴퓨터관)',
    dayOfWeek: '수',
    startTime: '10:30',
    endTime: '12:00',
    color: '#8B5CF6'
  },
  {
    id: 'cls_5',
    name: '소프트웨어 공학',
    professor: '정시스템 교수님',
    room: 'S308 (컴퓨터관)',
    dayOfWeek: '목',
    startTime: '14:00',
    endTime: '16:00',
    color: '#F59E0B'
  }
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg_1',
    title: 'React 기반 개인비서 서비스 앱 개발 제출',
    courseName: '웹프레임워크실습',
    dueDate: '2026-08-08',
    dueTime: '23:59',
    completed: false,
    memo: '컴포넌트 구조화 및 API 에러 핸들링 필수 포함'
  },
  {
    id: 'asg_2',
    title: '데이터베이스 릴레이션 스키마 설계서',
    courseName: '데이터베이스 시스템',
    dueDate: '2026-08-06',
    dueTime: '18:00',
    completed: false,
    memo: '3차 정규화 및 ERD 다이어그램 첨부'
  },
  {
    id: 'asg_3',
    title: '머신러닝 분류 알고리즘 성능 비교 보고서',
    courseName: '인공지능 개론',
    dueDate: '2026-08-12',
    dueTime: '23:59',
    completed: false,
    memo: 'Jupyter Notebook 파일 함께 압축하여 e-class 제출'
  },
  {
    id: 'asg_4',
    title: '소프트웨어 요구사항 정의서 1차 검토',
    courseName: '소프트웨어 공학',
    dueDate: '2026-08-02',
    dueTime: '12:00',
    completed: true,
    memo: '팀원 피드백반영 완료'
  }
];

export const INITIAL_MEAL_MATCHES: MealMatch[] = [
  {
    id: 'meal_1',
    campus: 'seoul',
    title: '오늘 점심 학식 같이 드실 분!!',
    menuOrLocation: '학생식당 2층 (제육볶음 정식)',
    mealType: '점심',
    targetTime: '12:30',
    maxPeople: 4,
    currentPeople: 3,
    authorId: 'usr_02',
    authorName: '백호99',
    isAnonymous: false,
    createdAt: '10분 전',
    status: 'open',
    participants: ['백호99', '명지스마트', '컴공22'],
    description: '학식 혼밥 심심해서 올려요! MBTI E/I 상관없이 환영합니다~'
  },
  {
    id: 'meal_2',
    campus: 'seoul',
    title: '수업 끝나고 엄마손떡볶이 가실 분 떡볶이팟 2명 모집',
    menuOrLocation: '엄마손떡볶이 정문점',
    mealType: '점심',
    targetTime: '13:10',
    maxPeople: 3,
    currentPeople: 1,
    authorId: 'usr_03',
    authorName: '익명의 명지인',
    isAnonymous: true,
    createdAt: '25분 전',
    status: 'open',
    participants: ['익명의 명지인'],
    description: '튀김이랑 순대까지 나눠서 푸짐하게 먹어요!'
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    campus: 'seoul',
    tab: 'notice',
    title: '📢 [공지] 2026학년도 2학기 명지전문대 셔틀버스 운행 시간표 안내',
    content: '학우 여러분 안녕하세요! 학생복지처입니다. 개강을 맞아 증산역/신촌역 셔틀버스 노선 운행 시간이 조정되었으니 참고하시길 바랍니다.',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'admin_mju',
    authorName: '명지전문대 학생복지처 (관리자)',
    isAnonymous: false,
    createdAt: '1시간 전',
    likesCount: 54,
    isLiked: false,
    reportsCount: 0,
    isNotice: true,
    comments: [
      {
        id: 'cmt_1',
        postId: 'post_1',
        authorId: 'usr_05',
        authorName: '익명1',
        isAnonymous: true,
        content: '증산역 막차 시간 10분 늘어나서 정말 다행이네요!',
        createdAt: '45분 전',
        reportsCount: 0
      }
    ]
  },
  {
    id: 'post_2',
    campus: 'seoul',
    tab: 'event',
    title: '🎉 [이벤트] 총학생회 주관 명지 백호 축제 야시장 폰부스 이벤트!',
    content: '학교 중앙광장에서 진행되는 2026 백호 가을축제! 다양한 푸드트럭과 동아리 공연, 굿즈 증정 이벤트가 준비되어 있습니다.',
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'admin_mju',
    authorName: '총학생회 (관리자)',
    isAnonymous: false,
    createdAt: '3시간 전',
    likesCount: 120,
    isLiked: true,
    reportsCount: 0,
    comments: [
      {
        id: 'cmt_2',
        postId: 'post_2',
        authorId: 'usr_06',
        authorName: 'mju_fresher',
        isAnonymous: false,
        content: '축제 라인업 대박이네요 ㄷㄷ 너무 기대됩니다!',
        createdAt: '2시간 전',
        reportsCount: 0
      }
    ]
  },
  {
    id: 'post_3',
    campus: 'seoul',
    tab: 'meal',
    title: '학교 앞 새로 생긴 돈까스집 후기 (사진 3장 첨부)',
    content: '거북골로 쪽에 생긴 수제 돈까스집 다녀왔는데 등심이 진짜 두껍고 겉바속촉 끝판왕입니다. 학생증 보여주면 음료수 서비스도 줘요!',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'usr_mju_01',
    authorName: '명지백호24',
    isAnonymous: false,
    createdAt: '4시간 전',
    likesCount: 38,
    isLiked: false,
    reportsCount: 0,
    comments: [
      {
        id: 'cmt_3',
        postId: 'post_3',
        authorId: 'usr_07',
        authorName: '익명의 명지인',
        isAnonymous: true,
        content: '여기 진짜 맛있어요 ㅋㅋㅋ 특히 겨자 소스 조합 강추',
        createdAt: '3시간 전',
        reportsCount: 0
      }
    ]
  },
  {
    id: 'post_4',
    campus: 'seoul',
    tab: 'lecture',
    title: '웹프레임워크실습 중간고사 족보나 공부 팁 공유해주실 분 있으신가요?',
    content: '컴공 3학년 과목인데 리액트 컴포넌트 생명주기랑 상태 관리 위주로 많이 나오나요? 같이 스터디하실 분 쪽지 주세요!',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'usr_08',
    authorName: '익명의 명지인',
    isAnonymous: true,
    createdAt: '6시간 전',
    likesCount: 15,
    isLiked: false,
    reportsCount: 0,
    comments: []
  }
];

export const INITIAL_NOTES: NoteMessage[] = [
  {
    id: 'note_1',
    senderId: 'usr_02',
    senderName: '백호99',
    receiverId: 'usr_mju_01',
    receiverName: '명지백호24',
    content: '안녕하세요! 학식 밥매칭글 보고 쪽지 드립니다. 12시 30분 학생식당 2층 계단 앞에서 뵈어요!',
    sentAt: '오늘 12:15',
    isRead: false,
    relatedPostTitle: '오늘 점심 학식 같이 드실 분!!'
  },
  {
    id: 'note_2',
    senderId: 'admin_mju',
    senderName: '관리자',
    receiverId: 'usr_mju_01',
    receiverName: '명지백호24',
    content: '작성하신 주변 맛집 후기 게시글이 우수 포스트로 선정되어 학생회 포인트 500p가 적립되었습니다.',
    sentAt: '어제 16:40',
    isRead: true,
    relatedPostTitle: '학교 앞 새로 생긴 돈까스집 후기'
  }
];

export const INITIAL_REPORTS: ContentReport[] = [
  {
    id: 'rep_1',
    contentType: 'post',
    targetId: 'post_999',
    targetTitleOrContent: '광고) 불법 도박 사이트 가입 시 쿠폰 지급',
    authorName: '익명 스팸',
    reporterName: '명지백호24',
    reason: '부적절한 광고 및 유해 게시물',
    status: 'pending',
    createdAt: '30분 전'
  }
];
