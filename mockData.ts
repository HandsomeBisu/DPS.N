import { Novel, Chapter } from './types';

export const DEMO_NOVELS: Novel[] = [
  {
    id: 'demo_1',
    authorId: 'demo_author',
    authorName: '침묵의 작가',
    title: '침묵의 별',
    description: '소리가 화폐인 세상에서, 침묵뿐인 소녀가 발견한 비밀. 소통의 본질을 묻는 SF 스릴러.',
    tags: ['SF', '미스터리'],
    category: 'SF',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPublished: true,
    chapterCount: 2,
    rating: 4.8,
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'demo_2',
    authorId: 'demo_author',
    authorName: '마커스 밴스',
    title: '붉은 지평선',
    description: '신호가 끊긴 후, 침묵은 소음보다 더 컸다. 침묵을 되찾으려는 포스트 아포칼립스 여정.',
    tags: ['판타지', '모험'],
    category: '판타지',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPublished: true,
    chapterCount: 12,
    rating: 4.5,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'demo_3',
    authorId: 'demo_author',
    authorName: '사라 젠킨스',
    title: '공허의 코드',
    description: '2084년 네오 도쿄의 뒷골목에서 펼쳐지는 사이버펑크 느와르.',
    tags: ['사이버펑크', '스릴러'],
    category: 'SF',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPublished: true,
    chapterCount: 5,
    rating: 4.9,
    coverUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'demo_4',
    authorId: 'demo_author',
    authorName: '익명의 작가',
    title: '아이비 덩굴 아래',
    description: '천 년 동안 별들 사이를 떠돌던 유리병 속의 편지들.',
    tags: ['로맨스', 'SF'],
    category: '로맨스',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPublished: true,
    chapterCount: 8,
    rating: 4.2,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'
  }
];

export const DEMO_CHAPTERS: Record<string, Chapter[]> = {
  'demo_1': [
    {
      id: 'c1',
      title: '설계도',
      pages: [
        "도시의 유리 첨탑들은 잿더미 속의 다이아몬드처럼 스모그 층을 뚫고 반짝였다. 카엘은 햅틱 장갑을 조정하며 손끝에 느껴지는 인터페이스의 미세한 진동을 느꼈다.\n\n'구조 무결성 98%,' AI가 귓가에 속삭였다. 거짓말이었다.",
        "카엘도 알고 있었고, 건물도 알고 있었다. 기초는 울고 있었다. 지각의 이 높은 곳에서는 존재해서는 안 될 지열 압력을 피 흘리듯 쏟아내고 있었다.\n\n그는 도면을 불러왔다. 어두운 정비 통로에서 푸른 홀로그램 선들이 빛났다. 또 그것이 있었다. 데이터 속의 공허. 존재하지 않는 기둥들이 떠받치고 있는, 존재하지 않는 방."
      ],
      order: 1,
      lastUpdated: Date.now()
    },
    {
      id: 'c2',
      title: '표면 아래',
      pages: [
        "엘리베이터가 내려가는 데는 10분이 걸렸다. 비상 브레이크 오버라이드의 깜박이는 빨간색 LED를 제외하고는 절대적인 어둠 속에서의 10분이었다.",
        "카엘은 안전 프로토콜을 비활성화했다. 내려가야 한다면 '위험 환경' 경고 때문에 시스템이 그를 멈추게 하고 싶지 않았다.\n\n그는 이미 그곳이 위험하다는 것을 알고 있었다.\n\n문이 쉿 소리를 내며 열리자 공기에서 오존과 고대의 먼지 냄새가 났다."
      ],
      order: 2,
      lastUpdated: Date.now()
    }
  ]
};