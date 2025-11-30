import React, { useState, useEffect } from 'react';
import { Novel, ViewState, User } from './types';
import { MOCK_NOVELS, CATEGORIES } from './constants';

// --- UI Components ---

const Icon = ({ name, className = "", filled = false }: { name: string; className?: string; filled?: boolean }) => (
  <span 
    className={`material-symbols-rounded select-none ${className}`} 
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  fullWidth = false,
  icon
}: { 
  children?: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'glass' | 'text'; 
  className?: string;
  fullWidth?: boolean;
  icon?: string;
}) => {
  const baseStyle = "px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-ios-blue text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600",
    secondary: "bg-ios-surface2 text-white hover:bg-neutral-700",
    glass: "bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20",
    text: "bg-transparent text-ios-blue hover:opacity-80 px-2",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
};

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon 
}: { 
  type?: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
}) => (
  <div className="relative w-full group">
    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-500 transition-colors group-focus-within:text-ios-blue">
      {icon && <Icon name={icon} />}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-ios-surface2/50 text-white placeholder-neutral-500 rounded-2xl py-4 ${icon ? 'pl-12' : 'pl-4'} pr-4 focus:outline-none focus:ring-2 focus:ring-ios-blue/50 transition-all border border-transparent focus:border-ios-blue/30 hover:bg-ios-surface2/80`}
    />
  </div>
);

const Navbar = ({ activeTab, onTabChange }: { activeTab: ViewState; onTabChange: (tab: ViewState) => void }) => {
  const navItems: { id: ViewState; icon: string; label: string }[] = [
    { id: 'HOME', icon: 'home', label: '홈' },
    { id: 'SEARCH', icon: 'search', label: '검색' },
    { id: 'LIBRARY', icon: 'local_library', label: '보관함' },
    { id: 'PROFILE', icon: 'person', label: '마이페이지' },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ios-surface/80 backdrop-blur-xl border-t border-ios-separator pb-safe pt-2 px-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'text-ios-blue' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Icon name={item.icon} filled={activeTab === item.id} className="text-[28px]" />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Nav */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-ios-separator z-50 flex-col py-8 px-4">
        <div className="px-4 mb-10">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ios-blue to-purple-600 flex items-center justify-center">
                <Icon name="auto_stories" className="text-white text-lg" />
             </div>
             <h1 className="text-xl font-bold text-white tracking-tight">Nocturne</h1>
           </div>
        </div>
        <div className="flex flex-col gap-2">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/20' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon name={item.icon} filled={activeTab === item.id} className={`text-[24px] ${activeTab !== item.id && 'group-hover:scale-110 transition-transform'}`} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </button>
           ))}
        </div>
        
        <div className="mt-auto px-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-ios-surface2 to-black border border-white/5 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-ios-blue/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-xs font-bold text-white mb-1 relative z-10">프리미엄 멤버십</p>
                <p className="text-[10px] text-neutral-400 mb-3 relative z-10">모든 작품을 무제한으로 감상하세요.</p>
                <div className="flex items-center text-[10px] font-bold text-ios-blue relative z-10">
                  구독하기 <Icon name="arrow_forward" className="text-[12px] ml-1" />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

// --- Page Components ---

const NovelCard: React.FC<{ novel: Novel; onClick: (n: Novel) => void; compact?: boolean; className?: string }> = ({ novel, onClick, compact = false, className = '' }) => (
  <div 
    onClick={() => onClick(novel)}
    className={`group relative flex-shrink-0 cursor-pointer transition-all duration-300 active:scale-[0.98] 
      ${compact ? 'w-36 md:w-44' : 'w-full sm:w-[48%] md:w-[31%] lg:w-[23%] xl:w-[19%]'} 
      ${className}`}
  >
    <div className={`relative overflow-hidden rounded-2xl ${compact ? 'aspect-[2/3]' : 'aspect-[16/9] sm:aspect-[2/3]'} bg-neutral-800 shadow-xl border border-white/5`}>
      <img 
        src={novel.coverUrl} 
        alt={novel.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      {!compact && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 opacity-100 transition-opacity">
          <span className="md:hidden inline-block px-2 py-1 rounded-md bg-ios-blue/80 backdrop-blur-md text-[10px] font-bold text-white w-fit mb-2 uppercase tracking-wider">
            추천
          </span>
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-ios-blue transition-colors">{novel.title}</h3>
          <p className="text-neutral-300 text-sm line-clamp-2 md:line-clamp-3">{novel.description}</p>
        </div>
      )}
      {/* Desktop Overlay for Compact or Grid View */}
      {compact && (
         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
             <Icon name="visibility" className="text-white text-3xl drop-shadow-lg" />
         </div>
      )}
    </div>
    {compact && (
      <div className="mt-3 space-y-1">
        <h4 className="font-semibold text-white text-sm line-clamp-1 leading-tight group-hover:text-ios-blue transition-colors">
          {novel.title}
        </h4>
        <p className="text-xs text-neutral-400">{novel.author}</p>
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, actionLabel = "전체보기" }: { title: string; actionLabel?: string }) => (
  <div className="flex justify-between items-end mb-4 px-4 md:px-0">
    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
    <button className="text-ios-blue text-sm font-medium hover:text-white active:opacity-60 transition-colors flex items-center gap-1">
      {actionLabel} <Icon name="chevron_right" className="text-lg" />
    </button>
  </div>
);

const HomeView = ({ onNovelClick }: { onNovelClick: (n: Novel) => void }) => {
  const featuredNovel = MOCK_NOVELS[0];
  const recentNovels = MOCK_NOVELS.slice(1, 4);
  const popularNovels = MOCK_NOVELS;

  return (
    <div className="pb-24 md:pb-10 pt-4 md:pt-10 animate-fade-in max-w-screen-2xl mx-auto md:px-8">
      {/* Header */}
      <div className="px-4 md:px-0 mb-6 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-0.5">환영합니다</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">추천 작품</h1>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ios-surface2 overflow-hidden border border-white/10 cursor-pointer hover:border-ios-blue transition-colors">
          <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 md:px-0 py-2 mb-6">
        {CATEGORIES.map((cat, i) => (
          <button 
            key={cat} 
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-white text-black' : 'bg-ios-surface2 text-neutral-300 hover:bg-neutral-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desktop: Hero Layout / Mobile: Stacked */}
      <div className="md:flex md:gap-8 mb-12">
        {/* Featured - Desktop Large Card */}
        <div className="px-4 md:px-0 md:w-2/3 lg:w-3/4 mb-8 md:mb-0">
           <div 
             onClick={() => onNovelClick(featuredNovel)}
             className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
           >
              <img src={featuredNovel.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-ios-blue text-xs font-bold text-white w-fit mb-4 shadow-lg shadow-blue-500/30">
                    오늘의 추천작
                  </span>
                  <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 max-w-2xl leading-tight">{featuredNovel.title}</h2>
                  <p className="text-neutral-300 text-sm md:text-lg line-clamp-2 md:line-clamp-2 max-w-xl">{featuredNovel.description}</p>
              </div>
           </div>
        </div>
        
        {/* Sidebar List for Desktop (Trending/Top) */}
        <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col gap-4">
             <div className="flex items-center justify-between text-white mb-2">
                <h3 className="font-bold text-lg">지금 뜨는 작품</h3>
             </div>
             {recentNovels.map((novel, idx) => (
               <div key={novel.id} onClick={() => onNovelClick(novel)} className="flex gap-4 p-3 rounded-xl bg-ios-surface2/30 hover:bg-ios-surface2 cursor-pointer transition-all group">
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                     <img src={novel.coverUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                     <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-ios-blue transition-colors">{novel.title}</h4>
                     <p className="text-xs text-neutral-400">{novel.author}</p>
                     <div className="flex items-center gap-1 mt-1 text-[10px] text-yellow-500">
                        <Icon name="star" filled className="text-[12px]" /> {novel.rating}
                     </div>
                  </div>
               </div>
             ))}
        </div>
      </div>

      {/* Recent Updates (Mobile Horizontal / Desktop Grid) */}
      <div className="mb-12">
        <SectionHeader title="신규 연재" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {recentNovels.map(novel => (
            <NovelCard key={novel.id} novel={novel} onClick={onNovelClick} compact className="flex-shrink-0" />
          ))}
          {/* Add more for desktop grid feel */}
          <div className="hidden md:block">
             <NovelCard novel={MOCK_NOVELS[3]} onClick={onNovelClick} compact />
          </div>
          <div className="hidden md:block">
             <NovelCard novel={MOCK_NOVELS[4]} onClick={onNovelClick} compact />
          </div>
        </div>
      </div>

      {/* Popular (Vertical on Mobile / Grid on Desktop) */}
      <div className="px-4 md:px-0">
        <SectionHeader title="인기 순위" />
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularNovels.map((novel, idx) => (
            <div 
              key={novel.id} 
              onClick={() => onNovelClick(novel)}
              className="flex gap-4 p-3 md:p-4 rounded-2xl bg-ios-surface/50 hover:bg-ios-surface2 border border-white/5 transition-colors cursor-pointer active:scale-[0.99] duration-200 group"
            >
              <div className="w-16 md:w-20 h-24 md:h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-md relative">
                <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    #{idx + 1}
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1 py-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-base md:text-lg line-clamp-1 group-hover:text-ios-blue transition-colors">{novel.title}</h4>
                </div>
                <p className="text-sm text-neutral-400 mb-2">{novel.author}</p>
                <div className="flex items-center gap-4 mb-2">
                    <span className="flex items-center text-xs font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        <Icon name="star" className="text-[14px] mr-0.5" filled />
                        {novel.rating}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center">
                        <Icon name="visibility" className="text-[14px] mr-1" /> {(novel.views/1000).toFixed(1)}k
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {novel.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NovelDetailView = ({ novel, onBack }: { novel: Novel; onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-black animate-slide-up md:animate-fade-in relative z-40 pb-24 md:pb-0 md:pl-0">
      {/* Mobile Sticky Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-lg flex items-center justify-center text-white active:bg-white/20 transition-colors pointer-events-auto border border-white/10"
        >
          <Icon name="arrow_back" />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-lg flex items-center justify-center text-white active:bg-white/20 border border-white/10">
            <Icon name="share" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <Icon name="arrow_back" /> <span className="font-medium">보관함으로</span>
          </button>
          <div className="flex gap-4">
              <button className="p-2 text-neutral-400 hover:text-white transition-colors"><Icon name="share" /></button>
              <button className="p-2 text-neutral-400 hover:text-white transition-colors"><Icon name="bookmark_border" /></button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-8 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-12">
            
            {/* Cover Image Section */}
            <div className="relative w-full md:w-[350px] flex-shrink-0">
                {/* Mobile Hero Image */}
                <div className="md:hidden relative w-full h-[50vh]">
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                
                {/* Desktop Cover Image */}
                <div className="hidden md:block relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                     <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                     <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                        {novel.status}
                     </div>
                </div>

                {/* Desktop Action Buttons (Below Image) */}
                <div className="hidden md:flex flex-col gap-3 mt-6">
                    <Button fullWidth className="py-4 text-lg">1화 무료보기</Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" fullWidth icon="add">보관함 추가</Button>
                        <Button variant="glass" className="px-4"><Icon name="download" /></Button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
                {/* Mobile Info Overlay */}
                <div className="md:hidden absolute top-[25vh] left-0 right-0 bottom-auto p-6 flex flex-col justify-end h-[25vh]">
                     <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${novel.status === '연재중' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {novel.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1 leading-tight drop-shadow-lg">{novel.title}</h1>
                    <p className="text-neutral-200 font-medium drop-shadow-md">{novel.author}</p>
                </div>

                {/* Desktop Title & Meta */}
                <div className="hidden md:block mb-8">
                    <div className="flex gap-2 mb-4">
                         {novel.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-ios-surface2 text-neutral-300 border border-white/5 hover:bg-neutral-700 transition-colors cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-2">{novel.title}</h1>
                    <p className="text-xl text-neutral-400">작가 <span className="text-white hover:underline cursor-pointer">{novel.author}</span></p>
                </div>

                {/* Stats Bar */}
                <div className="px-6 py-4 md:px-0 md:py-6 flex justify-between md:justify-start md:gap-16 border-b border-white/5 md:border-y md:border-white/10 my-0 md:my-8 bg-black md:bg-transparent">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-1">
                            <span className="text-xl md:text-2xl font-bold text-white">{novel.rating}</span>
                            <Icon name="star" filled className="text-yellow-500 text-sm" />
                        </div>
                        <span className="text-xs text-neutral-500 uppercase tracking-wide mt-1">별점</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start border-l border-white/10 pl-8 md:pl-0 md:border-l-0">
                        <span className="text-xl md:text-2xl font-bold text-white">{(novel.views / 1000).toFixed(1)}k</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wide mt-1">조회수</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start border-l border-white/10 pl-8 md:pl-0 md:border-l-0">
                        <span className="text-xl md:text-2xl font-bold text-white">142</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wide mt-1">전체 화수</span>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-xl md:text-2xl font-bold text-white">매주 금요일</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wide mt-1">주간 연재</span>
                    </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="md:hidden p-6 grid grid-cols-2 gap-4">
                    <Button fullWidth>바로 읽기</Button>
                    <Button variant="secondary" fullWidth>관심 등록</Button>
                </div>

                {/* Synopsis */}
                <div className="px-6 md:px-0 pb-8 md:pb-0">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">작품 소개</h3>
                    <div className="prose prose-invert prose-sm md:prose-lg max-w-none text-neutral-400 leading-relaxed">
                        <p>{novel.description}</p>
                        <p className="mt-4">
                            이야기는 예측할 수 없는 방향으로 전개되며, 동맹과 배신이 교차합니다. 모든 선택이 중요하고 그 결과가 현실이 되는 세계로 빠져보세요. 이 부분은 더 긴 설명이 들어갈 자리입니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Chapters Section (Desktop mostly, or bottom of mobile) */}
        <div className="px-6 md:px-0 mt-8 md:mt-12 border-t border-white/5 pt-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">최신 회차</h3>
                <button className="text-ios-blue text-sm font-semibold">전체보기</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[142, 141, 140, 139, 138, 137].map(num => (
                    <div key={num} className="flex items-center justify-between p-4 rounded-xl bg-ios-surface2/30 hover:bg-ios-surface2 border border-white/5 cursor-pointer transition-colors group">
                        <div className="flex flex-col">
                            <span className="text-white font-medium group-hover:text-ios-blue transition-colors">제 {num} 화</span>
                            <span className="text-xs text-neutral-500">2시간 전</span>
                        </div>
                        <Icon name="lock_open" className="text-neutral-600 text-sm" />
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

const AuthView = ({ type, onSwap, onLogin }: { type: 'LOGIN' | 'SIGNUP'; onSwap: () => void; onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-ios-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm md:max-w-md z-10 md:bg-black/40 md:backdrop-blur-xl md:p-10 md:rounded-3xl md:border md:border-white/10 md:shadow-2xl">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-ios-blue to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icon name="auto_stories" className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{type === 'LOGIN' ? '로그인' : '회원가입'}</h1>
          <p className="text-neutral-400">
            {type === 'LOGIN' ? '계정을 입력해주세요' : '새로운 이야기를 만나보세요'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {type === 'SIGNUP' && (
             <Input 
              placeholder="이름" 
              value="" 
              onChange={() => {}} 
              icon="person" 
            />
          )}
          <Input 
            type="email" 
            placeholder="이메일" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            icon="mail" 
          />
          <Input 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            icon="lock" 
          />
          {type === 'LOGIN' && (
             <div className="flex justify-end">
               <button className="text-sm text-ios-blue font-medium hover:opacity-80 transition-opacity">비밀번호를 잊으셨나요?</button>
             </div>
          )}
        </div>

        <Button fullWidth onClick={onLogin} className="mb-6 py-4 text-lg shadow-blue-500/25">
          {type === 'LOGIN' ? '로그인' : '회원가입'}
        </Button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black md:bg-transparent text-neutral-500">또는</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button variant="glass" className="py-3 hover:bg-white/10">
             <span className="text-sm font-medium">Google</span>
          </Button>
          <Button variant="glass" className="py-3 hover:bg-white/10">
            <span className="text-sm font-medium">Apple</span>
          </Button>
        </div>

        <p className="text-center text-neutral-400 text-sm">
          {type === 'LOGIN' ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <button onClick={onSwap} className="text-white font-semibold hover:underline">
            {type === 'LOGIN' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  );
};

const ProfileView = ({ onLogout }: { onLogout: () => void }) => (
  <div className="pb-24 pt-10 px-4 md:px-8 animate-fade-in max-w-4xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-800 overflow-hidden border-4 border-ios-blue shadow-xl">
        <img src="https://picsum.photos/200/200" alt="Profile" className="w-full h-full object-cover" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">김독자</h2>
        <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-ios-blue/20 text-ios-blue text-xs font-bold uppercase tracking-wider border border-ios-blue/20">프리미엄 회원</span>
             <span className="text-neutral-500 text-sm">2023년 가입</span>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
            <section>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">계정 설정</h3>
                <div className="bg-ios-surface2/50 backdrop-blur-md rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                {['개인 정보', '알림 설정', '읽기 설정', '구독 관리'].map((item) => (
                    <button key={item} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group">
                    <span className="text-white font-medium group-hover:text-ios-blue transition-colors">{item}</span>
                    <Icon name="chevron_right" className="text-neutral-500 group-hover:text-white transition-colors" />
                    </button>
                ))}
                </div>
            </section>

            <section>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">고객 지원</h3>
                <div className="bg-ios-surface2/50 backdrop-blur-md rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                {['고객센터', '이용약관', '개인정보 처리방침'].map((item) => (
                    <button key={item} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group">
                    <span className="text-white font-medium group-hover:text-ios-blue transition-colors">{item}</span>
                    <Icon name="chevron_right" className="text-neutral-500 group-hover:text-white transition-colors" />
                    </button>
                ))}
                </div>
            </section>
        </div>
        
        {/* Desktop Statistics or extra info */}
        <div className="hidden md:block bg-ios-surface2/20 rounded-3xl p-6 border border-white/5 h-fit">
            <h3 className="text-lg font-bold text-white mb-4">독서 통계</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-ios-blue">42</div>
                    <div className="text-xs text-neutral-500">읽은 작품</div>
                </div>
                <div className="bg-black/40 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-500">128h</div>
                    <div className="text-xs text-neutral-500">독서 시간</div>
                </div>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-ios-blue to-purple-500 w-[70%] h-full"></div>
            </div>
            <p className="text-xs text-neutral-400 text-center">레벨 15 • 다음 레벨까지 70%</p>
        </div>
    </div>

    <div className="mt-8 md:mt-12 md:max-w-xs">
        <Button variant="secondary" fullWidth onClick={onLogout} className="text-red-500 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10">
            로그아웃
        </Button>
    </div>
  </div>
);

const LibraryView = ({ onNovelClick }: { onNovelClick: (n: Novel) => void }) => (
    <div className="pb-24 pt-10 px-4 md:px-8 animate-fade-in max-w-screen-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">내 서재</h1>
        
        {/* Tabs */}
        <div className="flex p-1 bg-ios-surface2/50 rounded-xl mb-8 max-w-sm md:bg-neutral-900">
            <button className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-ios-surface shadow-sm text-white transition-all">읽는 중</button>
            <button className="flex-1 py-1.5 text-sm font-medium rounded-lg text-neutral-400 hover:text-white transition-all">완독</button>
            <button className="flex-1 py-1.5 text-sm font-medium rounded-lg text-neutral-400 hover:text-white transition-all">다운로드</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
             {MOCK_NOVELS.slice(0, 4).map(novel => (
                <div key={novel.id} onClick={() => onNovelClick(novel)} className="group cursor-pointer">
                    <NovelCard novel={novel} onClick={() => {}} compact className="w-full" />
                    <div className="mt-3">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">진행률</span>
                            <span className="text-[10px] text-white font-bold">85%</span>
                         </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-ios-blue group-hover:bg-purple-500 transition-colors" style={{ width: `${Math.random() * 80 + 10}%` }}></div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 group-hover:text-white transition-colors">{Math.floor(Math.random() * 50)}화 / 142화</p>
                    </div>
                </div>
            ))}
            {/* Add more placeholder items for full screen feel */}
            {MOCK_NOVELS.slice(1, 3).map(novel => (
                <div key={`dup-${novel.id}`} onClick={() => onNovelClick(novel)} className="group cursor-pointer">
                    <NovelCard novel={novel} onClick={() => {}} compact className="w-full" />
                    <div className="mt-3">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">진행률</span>
                            <span className="text-[10px] text-white font-bold">12%</span>
                         </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-ios-blue group-hover:bg-purple-500 transition-colors" style={{ width: '12%' }}></div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 group-hover:text-white transition-colors">4화 / 142화</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  
  // We can remove simple history stack for now or improve it, 
  // but for this UI demo simple state switching is cleaner for responsive adaptation.
  // Ideally, use a real router (react-router).
  
  const navigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo(0,0);
  };

  const handleNovelClick = (novel: Novel) => {
    setSelectedNovel(novel);
    navigate('NOVEL_DETAIL');
  };

  const handleLogin = () => {
    navigate('HOME');
  };

  // Views that show the navigation
  const mainViews: ViewState[] = ['HOME', 'LIBRARY', 'SEARCH', 'PROFILE'];
  const showNavbar = mainViews.includes(currentView);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-ios-blue/30 selection:text-ios-blue md:flex">
      
      {/* Navigation (Sidebar on Desktop / Bottom on Mobile) */}
      {showNavbar && (
        <Navbar 
            activeTab={currentView} 
            onTabChange={navigate} 
        />
      )}

      {/* Main Content Area */}
      {/* If navbar is shown (desktop), add left margin to content */}
      <main className={`flex-1 min-h-screen bg-black relative shadow-2xl transition-all duration-300 ${showNavbar ? 'md:ml-64' : ''}`}>
        
        {currentView === 'LOGIN' && (
          <AuthView type="LOGIN" onSwap={() => setCurrentView('SIGNUP')} onLogin={handleLogin} />
        )}
        
        {currentView === 'SIGNUP' && (
          <AuthView type="SIGNUP" onSwap={() => setCurrentView('LOGIN')} onLogin={handleLogin} />
        )}

        {currentView === 'HOME' && (
          <HomeView onNovelClick={handleNovelClick} />
        )}

        {currentView === 'SEARCH' && (
           <div className="pt-10 px-4 md:px-8 pb-24 animate-fade-in max-w-screen-2xl mx-auto">
             <h1 className="text-3xl md:text-4xl font-bold mb-6">검색</h1>
             <div className="max-w-2xl">
                <Input placeholder="작품, 작가, 태그 검색..." value="" onChange={() => {}} icon="search" />
             </div>
             
             <div className="mt-10">
                <SectionHeader title="장르별 카테고리" actionLabel="" />
                <div className="flex flex-wrap gap-3 md:gap-4">
                    {CATEGORIES.slice(1).map(cat => (
                        <div key={cat} className="w-[48%] md:w-[200px] h-24 md:h-32 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-ios-blue/50 transition-colors">
                            <span className="relative z-10 font-bold text-lg md:text-xl group-hover:scale-110 transition-transform">{cat}</span>
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
                            {/* Decorative circle */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/5 group-hover:bg-ios-blue/20 transition-colors"></div>
                        </div>
                    ))}
                </div>
             </div>

             <div className="mt-10">
                 <SectionHeader title="인기 검색어" actionLabel="" />
                 <div className="flex flex-wrap gap-2">
                     {['전지적 독자 시점', '나 혼자만 레벨업', '로맨스 판타지', '회귀', '먼치킨'].map(tag => (
                         <button key={tag} className="px-4 py-2 rounded-lg bg-ios-surface2/50 text-neutral-300 text-sm hover:bg-ios-surface2 hover:text-white transition-colors">
                             <Icon name="search" className="text-[14px] mr-2 inline" />
                             {tag}
                         </button>
                     ))}
                 </div>
             </div>
           </div>
        )}

        {currentView === 'LIBRARY' && (
             <LibraryView onNovelClick={handleNovelClick} />
        )}

        {currentView === 'PROFILE' && (
          <ProfileView onLogout={() => setCurrentView('LOGIN')} />
        )}

        {currentView === 'NOVEL_DETAIL' && selectedNovel && (
          <NovelDetailView novel={selectedNovel} onBack={() => navigate('HOME')} />
        )}

      </main>

      {/* Global Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        /* Custom Scrollbar for Desktop content areas */
        @media (min-width: 768px) {
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: #000; 
            }
            ::-webkit-scrollbar-thumb {
                background: #333; 
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555; 
            }
        }
      `}</style>
    </div>
  );
};

export default App;