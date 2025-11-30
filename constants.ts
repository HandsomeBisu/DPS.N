import { Novel } from './types';

export const MOCK_NOVELS: Novel[] = [
  {
    id: '1',
    title: '침묵의 별',
    author: '엘레나 피셔',
    coverUrl: 'https://picsum.photos/300/450?random=1',
    description: '소리가 화폐인 세상에서, 침묵뿐인 소녀가 발견한 비밀. 소통의 본질을 묻는 SF 스릴러.',
    rating: 4.8,
    views: 125000,
    tags: ['SF', '디스토피아', '스릴러'],
    status: '연재중'
  },
  {
    id: '2',
    title: '붉은 지평선',
    author: '마커스 밴스',
    coverUrl: 'https://picsum.photos/300/450?random=2',
    description: '3년 전 해가 지지 않게 되었다. 영원한 황혼 속에서 뱀파이어와 인류의 마지막 전쟁이 시작된다.',
    rating: 4.5,
    views: 89000,
    tags: ['판타지', '뱀파이어', '액션'],
    status: '완결'
  },
  {
    id: '3',
    title: '공허의 코드',
    author: '사라 젠킨스',
    coverUrl: 'https://picsum.photos/300/450?random=3',
    description: '천재 프로그래머가 발견한 숨겨진 서버. 로그아웃을 시도하는 순간, 관리자가 그녀를 주목한다.',
    rating: 4.9,
    views: 210000,
    tags: ['사이버펑크', '미스터리', '테크'],
    status: '연재중'
  },
  {
    id: '4',
    title: '아이비 덩굴 아래',
    author: '익명의 작가',
    coverUrl: 'https://picsum.photos/300/450?random=4',
    description: '오래된 대학 캠퍼스 지하에 요정의 세계로 통하는 문이 있다. 신입생의 파란만장한 모험기.',
    rating: 4.2,
    views: 54000,
    tags: ['판타지', '로맨스', '학원물'],
    status: '연재중'
  },
  {
    id: '5',
    title: '퀀텀 하트',
    author: '닥터 러브',
    coverUrl: 'https://picsum.photos/300/450?random=5',
    description: '평행 우주를 넘어선 사랑. 두 세계를 하나로 합치기 위한 연인들의 사투.',
    rating: 4.7,
    views: 15000,
    tags: ['로맨스', 'SF', '드라마'],
    status: '완결'
  },
  {
    id: '6',
    title: '연금술사의 딸',
    author: '클라라 오스왈드',
    coverUrl: 'https://picsum.photos/300/450?random=6',
    description: '납을 금으로 바꿀 순 있지만, 아버지의 차가운 마음은 녹일 수 없었다. 마법과 가족의 이야기.',
    rating: 4.6,
    views: 67000,
    tags: ['시대극', '마법', '드라마'],
    status: '완결'
  }
];

export const CATEGORIES = ['전체', '판타지', '로맨스', 'SF', '미스터리', '공포', '무협'];