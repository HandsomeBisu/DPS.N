import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Novel, Chapter, UserData } from '../types';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Book, Heart, Share2, Star, List } from 'lucide-react';
import { DEMO_NOVELS, DEMO_CHAPTERS } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

const { useParams, Link, useNavigate } = ReactRouterDOM as any;

export const NovelDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        // Fetch Novel
        if (id.startsWith('demo_')) {
          const demo = DEMO_NOVELS.find(n => n.id === id);
          if (demo) setNovel(demo);
          const demoCh = DEMO_CHAPTERS[id] || [];
          setChapters(demoCh.sort((a,b) => a.order - b.order));
        } else {
          const docRef = await getDoc(doc(db, "novels", id));
          if (docRef.exists()) {
             setNovel({ id: docRef.id, ...docRef.data() } as Novel);
             const q = query(collection(db, `novels/${id}/chapters`));
             const chSnap = await getDocs(q);
             const chData = chSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
             setChapters(chData.sort((a, b) => a.order - b.order));
          }
        }

        // Check Library Status
        if (user) {
           const uDoc = await getDoc(doc(db, 'users', user.uid));
           if (uDoc.exists()) {
              const uData = uDoc.data() as UserData;
              if (uData.library?.includes(id)) setIsSaved(true);
           }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const toggleLibrary = async () => {
    if (!user) {
      if(window.confirm('보관함 기능은 로그인이 필요합니다. 로그인하시겠습니까?')) navigate('/auth');
      return;
    }
    if (!id) return;

    try {
       const ref = doc(db, 'users', user.uid);
       if (isSaved) {
          await setDoc(ref, { library: arrayRemove(id) }, { merge: true });
          setIsSaved(false);
       } else {
          await setDoc(ref, { library: arrayUnion(id) }, { merge: true });
          setIsSaved(true);
       }
    } catch(e) {
       console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"/></div>;
  if (!novel) return <div className="p-10 text-center">작품을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen pb-20 bg-black">
       {/* Sticky Header */}
       <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 h-14 flex items-center px-4">
          <Link to="/" className="p-2 -ml-2 text-ios-gray hover:text-white transition-colors"><ChevronLeft size={24} /></Link>
          <span className="font-bold ml-2 text-sm opacity-0 animate-fade-in md:opacity-100">{novel.title}</span>
       </div>

       <div className="max-w-4xl mx-auto px-6 pt-6 animate-fade-in">
          {/* Top Section: Cover & Info */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
             {/* Cover */}
             <div className="w-48 mx-auto md:mx-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                {novel.coverUrl ? (
                   <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Book size={40} className="text-white/20"/></div>
                )}
             </div>

             {/* Info */}
             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col h-full justify-center">
                   <div className="mb-4">
                      <span className="text-xs font-bold text-ios-blue bg-ios-blue/10 px-2 py-1 rounded-md mb-2 inline-block">
                         {novel.category || '장르 없음'}
                      </span>
                      <h1 className="text-3xl font-bold text-white mb-2">{novel.title}</h1>
                      <p className="text-ios-gray font-medium">{novel.authorName}</p>
                   </div>

                   <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                      <div className="flex items-center gap-1 text-yellow-500">
                         <Star fill="currentColor" size={16} />
                         <span className="font-bold">{novel.rating || '0.0'}</span>
                      </div>
                      <span className="text-white/20">|</span>
                      <div className="text-sm text-ios-gray">총 {novel.chapterCount}화</div>
                      <span className="text-white/20">|</span>
                      <div className="text-sm text-ios-gray">조회수 1.2M</div>
                   </div>

                   <div className="flex gap-3 justify-center md:justify-start">
                      {chapters.length > 0 && (
                         <Link to={`/read/${novel.id}/${chapters[0].id}`} className="flex-1 md:flex-none">
                            <Button className="w-full md:w-auto px-8">첫화보기</Button>
                         </Link>
                      )}
                      <Button variant="secondary" onClick={toggleLibrary} className={`px-4 ${isSaved ? 'text-ios-red bg-ios-red/10 border-ios-red/20' : ''}`}>
                         <Heart fill={isSaved ? "currentColor" : "none"} size={20} />
                      </Button>
                   </div>
                </div>
             </div>
          </div>

          {/* Description */}
          <div className="mb-12">
             <h3 className="font-bold text-lg text-white mb-3">작품 소개</h3>
             <p className="text-gray-400 leading-relaxed text-sm md:text-base">{novel.description}</p>
             <div className="flex gap-2 mt-4">
                {novel.tags.map(tag => (
                   <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-full text-ios-gray border border-white/5">#{tag}</span>
                ))}
             </div>
          </div>

          {/* Chapter List */}
          <div>
             <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                   <List size={20} /> 회차 목록
                </h3>
                <span className="text-xs text-ios-gray">최신순</span>
             </div>
             
             <div className="space-y-2">
                {chapters.length > 0 ? (
                   chapters.map((chapter, idx) => (
                      <Link 
                         key={chapter.id} 
                         to={`/read/${novel.id}/${chapter.id}`}
                         className="block p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-medium group-hover:text-ios-blue transition-colors">{chapter.title}</span>
                            <span className="text-xs text-ios-gray">{new Date(chapter.lastUpdated).toLocaleDateString()}</span>
                         </div>
                         <div className="text-xs text-ios-gray line-clamp-1 opacity-50">
                            {idx + 1}화
                         </div>
                      </Link>
                   ))
                ) : (
                   <div className="py-10 text-center text-ios-gray bg-[#1C1C1E] rounded-xl border border-white/5">
                      등록된 회차가 없습니다.
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};