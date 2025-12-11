import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Novel } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { Book, AlertTriangle, Star, ChevronRight } from 'lucide-react';
import { DEMO_NOVELS } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

const { Link } = ReactRouterDOM as any;

const FILTERS = ['전체', '판타지', '로맨스', 'SF', '미스터리', '공포', '모험'];

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('전체');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const q = query(collection(db, "novels"), limit(10)); 
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel));
        setFeaturedNovels(data);
      } catch (e: any) {
        console.error("Error fetching novels", e);
        if (e.code === 'permission-denied' || e.code === 'unavailable') {
          setPermissionError(true);
          setFeaturedNovels(DEMO_NOVELS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Pick the first one as Hero, rest as trending/new
  const heroNovel = featuredNovels[0];
  const trendingNovels = featuredNovels.slice(1, 4);
  const newNovels = featuredNovels.slice(0, 5); // Just reuse for demo

  return (
    <div className="pb-24 pt-8 px-6 md:px-10 max-w-[1600px] mx-auto">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
           <p className="text-sm text-ios-gray font-medium mb-1">환영합니다</p>
           <h1 className="text-3xl font-bold text-white">추천 작품</h1>
        </div>
        <Link to={user ? "/profile" : "/auth"} className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10 block hover:border-ios-blue transition-colors">
           {user?.photoURL ? (
             <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-600"></div>
           )}
        </Link>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-yellow-500 font-bold text-sm">데모 모드 활성화</h3>
            <p className="text-yellow-500/80 text-xs mt-1">
              로컬 데모 데이터를 사용 중입니다. Firestore를 연결하여 실시간 데이터를 확인하세요.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeFilter === filter 
                ? 'bg-white text-black' 
                : 'bg-[#1C1C1E] text-ios-gray hover:bg-white/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Split Layout: Hero + Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Hero Section (Left 2/3) */}
        <div className="lg:col-span-2 group relative rounded-[32px] overflow-hidden aspect-[16/9] lg:aspect-[2/1] shadow-2xl animate-fade-in">
          {loading ? (
             <div className="w-full h-full bg-white/5 animate-pulse" />
          ) : heroNovel ? (
            <Link to={`/novel/${heroNovel.id}`} className="block w-full h-full relative">
               <img 
                 src={heroNovel.coverUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"} 
                 alt={heroNovel.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               
               {/* Content */}
               <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-3/4">
                 <span className="inline-block px-3 py-1 bg-ios-blue text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-4">
                   오늘의 추천작
                 </span>
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{heroNovel.title}</h2>
                 <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-2 max-w-xl">
                   {heroNovel.description}
                 </p>
               </div>
            </Link>
          ) : (
            <div className="flex items-center justify-center h-full bg-white/5 text-gray-500">콘텐츠 없음</div>
          )}
        </div>

        {/* Trending Section (Right 1/3) */}
        <div className="flex flex-col h-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-bold text-white mb-4">지금 뜨는 작품</h3>
          <div className="flex-1 bg-[#1C1C1E] rounded-3xl p-4 border border-white/5 overflow-hidden flex flex-col gap-4">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)
            ) : trendingNovels.length > 0 ? (
               trendingNovels.map((novel) => (
                 <Link to={`/novel/${novel.id}`} key={novel.id} className="flex gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                      {novel.coverUrl ? (
                         <img src={novel.coverUrl} className="w-full h-full object-cover" alt={novel.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/20"><Book size={16}/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <h4 className="text-white font-medium truncate group-hover:text-ios-blue transition-colors">{novel.title}</h4>
                       <p className="text-xs text-ios-gray truncate mb-2">{novel.authorName}</p>
                       <div className="flex items-center gap-1 text-yellow-500 text-xs">
                         <Star size={12} fill="currentColor" />
                         <span className="font-medium">{novel.rating || '4.5'}</span>
                       </div>
                    </div>
                 </Link>
               ))
            ) : (
               <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">인기 작품 없음</div>
            )}
          </div>
        </div>
      </div>

      {/* New Releases Section */}
      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">신규 연재</h2>
          <Link to="/search" className="text-xs text-ios-blue font-medium flex items-center gap-1 hover:underline">
            전체보기 <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {loading ? (
              [1,2,3,4,5].map(i => <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse"/>)
           ) : (
              newNovels.map((novel) => (
                <Link to={`/novel/${novel.id}`} key={novel.id} className="group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative shadow-lg bg-gray-900 border border-white/5">
                    {novel.coverUrl ? (
                      <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-black">
                        <span className="font-serif text-3xl font-bold text-white/20">{novel.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-ios-blue transition-colors">{novel.title}</h3>
                  <p className="text-xs text-ios-gray truncate">{novel.authorName}</p>
                </Link>
              ))
           )}
        </div>
      </section>

    </div>
  );
};