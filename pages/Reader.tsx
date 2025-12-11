import React, { useEffect, useState, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Novel, Chapter, UserData } from '../types';
import { ChevronLeft, ChevronRight, Menu, List, Heart, Keyboard } from 'lucide-react';
import { DEMO_NOVELS, DEMO_CHAPTERS } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

const { useParams, Link, useNavigate, useLocation } = ReactRouterDOM as any;

export const Reader: React.FC = () => {
  const { novelId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Internal page index of a chapter
  
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // PC Support State
  const [isPC, setIsPC] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Parse query params to optionally set start page (e.g. ?page=last)
  const queryParams = new URLSearchParams(location.search);
  const startAtEnd = queryParams.get('pos') === 'end';

  useEffect(() => {
    // Detect PC (Screen width > 768px or fine pointer)
    const checkPC = window.matchMedia('(min-width: 768px)').matches || window.matchMedia('(pointer: fine)').matches;
    setIsPC(checkPC);

    if (checkPC) {
      setShowGuide(true);
      const timer = setTimeout(() => setShowGuide(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!novelId || !chapterId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Novel
        let foundNovel: Novel | null = null;
        let foundChapters: Chapter[] = [];

        if (novelId.startsWith('demo_')) {
          foundNovel = DEMO_NOVELS.find(n => n.id === novelId) || null;
          foundChapters = (DEMO_CHAPTERS[novelId] || []).sort((a,b) => a.order - b.order);
        } else {
          const nDoc = await getDoc(doc(db, "novels", novelId));
          if (nDoc.exists()) foundNovel = { id: nDoc.id, ...nDoc.data() } as Novel;
          
          const q = query(collection(db, `novels/${novelId}/chapters`));
          const snap = await getDocs(q);
          foundChapters = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)).sort((a,b) => a.order - b.order);
        }

        setNovel(foundNovel);
        setChapters(foundChapters);

        const activeCh = foundChapters.find(c => c.id === chapterId);
        if (activeCh) {
           setCurrentChapter(activeCh);
           // If we came from "Previous" of the next chapter, start at the last page
           if (startAtEnd && activeCh.pages) {
              setCurrentPageIndex(activeCh.pages.length - 1);
           } else {
              setCurrentPageIndex(0);
           }
        }

        // Library check
        if (user && foundNovel) {
           const uDoc = await getDoc(doc(db, 'users', user.uid));
           if (uDoc.exists()) {
              const lib = (uDoc.data() as UserData).library;
              if (lib?.includes(novelId)) setIsSaved(true);
           }
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [novelId, chapterId, user]); // Removing startAtEnd from deps to avoid re-triggering logic unnecessarily

  // Navigation Logic
  const handleNext = useCallback(() => {
    if (!currentChapter) return;
    const pages = currentChapter.pages || [(currentChapter as any).content || ''];
    
    // If there are more pages in this chapter
    if (currentPageIndex < pages.length - 1) {
       setCurrentPageIndex(prev => prev + 1);
       window.scrollTo(0,0);
    } else {
       // Go to next chapter
       const currIdx = chapters.findIndex(c => c.id === currentChapter.id);
       if (currIdx < chapters.length - 1) {
          const nextCh = chapters[currIdx + 1];
          navigate(`/read/${novelId}/${nextCh.id}`);
       }
    }
  }, [currentChapter, currentPageIndex, chapters, novelId, navigate]);

  const handlePrev = useCallback(() => {
    if (!currentChapter) return;
    
    // If there are previous pages in this chapter
    if (currentPageIndex > 0) {
       setCurrentPageIndex(prev => prev - 1);
       window.scrollTo(0,0);
    } else {
       // Go to prev chapter
       const currIdx = chapters.findIndex(c => c.id === currentChapter.id);
       if (currIdx > 0) {
          const prevCh = chapters[currIdx - 1];
          // Navigate to the previous chapter, signaling to start at the end
          navigate(`/read/${novelId}/${prevCh.id}?pos=end`);
       }
    }
  }, [currentChapter, currentPageIndex, chapters, novelId, navigate]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Tap Zone Handler
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPC) return; // Disable click navigation on PC

    const { clientX, currentTarget } = e;
    const { width } = currentTarget.getBoundingClientRect();
    
    // Left 40% = Prev, Right 60% = Next
    if (clientX < width * 0.4) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const toggleLibrary = async () => {
     if (!user || !novelId) return;
     try {
        const ref = doc(db, 'users', user.uid);
        if (isSaved) {
           await setDoc(ref, { library: arrayRemove(novelId) }, { merge: true });
           setIsSaved(false);
        } else {
           await setDoc(ref, { library: arrayUnion(novelId) }, { merge: true });
           setIsSaved(true);
        }
     } catch(e) { console.error(e); }
  }

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"/></div>;
  if (!novel || !currentChapter) return <div className="h-screen bg-black text-white p-10 text-center">콘텐츠를 불러올 수 없습니다.</div>;

  const currentPages = currentChapter.pages || [(currentChapter as any).content || ''];
  const content = currentPages[currentPageIndex];
  const totalPagesInChapter = currentPages.length;

  const currentChapterIndex = chapters.findIndex(c => c.id === currentChapter.id);
  const hasNextChapter = currentChapterIndex !== -1 && currentChapterIndex < chapters.length - 1;
  const isLastPage = currentPageIndex === totalPagesInChapter - 1;

  return (
    <div className="min-h-screen bg-[#111] pb-20 select-none relative">
      {/* Keyboard Guide Toast */}
      {showGuide && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white/90 px-6 py-3 rounded-full text-sm border border-white/10 animate-fade-in z-50 pointer-events-none flex items-center gap-3 shadow-2xl">
           <Keyboard size={20} className="text-ios-gray" />
           <span>방향키 <span className="text-ios-blue font-bold">←</span> <span className="text-ios-blue font-bold">→</span> 로 페이지를 넘기세요</span>
        </div>
      )}

      {/* Reader Header */}
      <div className="sticky top-0 z-40 h-14 bg-[#111]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 transition-transform duration-300">
        <Link to={`/novel/${novelId}`} className="text-gray-400 hover:text-white"><ChevronLeft/></Link>
        <div className="flex flex-col items-center">
           <span className="text-xs text-gray-500">{novel.title}</span>
           <span className="text-sm font-bold text-gray-200">{currentChapter.title}</span>
        </div>
        <div className="flex gap-4 text-gray-400">
           <button onClick={toggleLibrary} className={isSaved ? "text-ios-red" : "hover:text-white"}><Heart fill={isSaved?"currentColor":"none"} size={20}/></button>
           <button onClick={() => setShowMenu(!showMenu)} className="hover:text-white"><List size={20}/></button>
        </div>
      </div>

      {/* Content Area with Tap Zones */}
      <div 
        className={`min-h-[80vh] relative ${isPC ? 'cursor-text' : 'cursor-pointer'}`}
        onClick={handleContentClick}
      >
        <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in pointer-events-none">
           <div className="prose prose-invert prose-lg md:prose-xl leading-loose font-serif text-gray-300 whitespace-pre-wrap">
              {content}
           </div>
        </div>
      </div>

      {/* Next Chapter Guide Overlay */}
      {isLastPage && hasNextChapter && (
        <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 animate-fade-in pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] text-ios-gray mb-0.5">챕터 완료</p>
                <p className="text-sm font-bold text-white">다음화로 넘어갈까요?</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-ios-blue flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/20">
                <ChevronRight size={20} className="text-white ml-0.5" />
             </div>
          </div>
        </div>
      )}

      {/* Footer / Pagination */}
      <div className="fixed bottom-0 w-full h-16 bg-[#111]/90 backdrop-blur border-t border-white/5 flex items-center justify-between px-6 z-40">
         <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="text-sm text-gray-400 hover:text-white flex items-center gap-1"><ChevronLeft size={16}/> 이전</button>
         <span className="text-xs text-gray-600 font-mono">
            {currentPageIndex + 1} / {totalPagesInChapter} <span className="mx-1 text-gray-800">|</span> {currentChapter.order}화
         </span>
         <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">다음 <ChevronRight size={16}/></button>
      </div>

      {/* Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" onClick={() => setShowMenu(false)}>
          <div className="w-80 h-full bg-ios-card border-l border-white/10 p-6 overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-white">목차</h3>
            <div className="space-y-1">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    navigate(`/read/${novelId}/${ch.id}`);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${ch.id === currentChapter.id ? 'bg-ios-blue text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  {ch.order}. {ch.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};