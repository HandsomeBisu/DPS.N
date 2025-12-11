import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Novel, UserData } from '../types';
import { Book, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DEMO_NOVELS } from '../mockData';

const { useNavigate, Link } = ReactRouterDOM as any;

export const Library: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [savedNovels, setSavedNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchLibrary = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let libraryIds: string[] = [];
        
        if (userDoc.exists()) {
           const userData = userDoc.data() as UserData;
           libraryIds = userData.library || [];
        } else {
           // For demo purposes, keep library empty if no user doc yet
           libraryIds = [];
        }

        if (libraryIds.length > 0) {
           // Fetch novels. For demo optimization, check DEMO_NOVELS first or fetch from DB
           const novelsData: Novel[] = [];
           for (const id of libraryIds) {
             const demo = DEMO_NOVELS.find(n => n.id === id);
             if (demo) {
                novelsData.push(demo);
             } else {
                try {
                  const nSnap = await getDoc(doc(db, 'novels', id));
                  if (nSnap.exists()) {
                    novelsData.push({ id: nSnap.id, ...nSnap.data() } as Novel);
                  }
                } catch(e) {
                   console.error("Failed to load novel", id);
                }
             }
           }
           setSavedNovels(novelsData);
        } else {
           setSavedNovels([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user, authLoading, navigate]);

  if (authLoading || (!user && loading)) return null;

  return (
    <div className="pb-24 pt-8 px-6 md:px-10 max-w-[1600px] mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">보관함</h1>

      {loading ? (
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1,2,3].map(i => <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />)}
         </div>
      ) : savedNovels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
          {savedNovels.map(novel => (
             <Link to={`/novel/${novel.id}`} key={novel.id} className="group relative">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative shadow-lg bg-gray-900 border border-white/5">
                  {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-black">
                      <Book size={32} className="text-white/20 mb-2"/>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-ios-blue transition-colors">{novel.title}</h3>
                <p className="text-xs text-ios-gray truncate">{novel.authorName}</p>
             </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#1C1C1E] rounded-3xl border border-white/5">
           <Book size={48} className="text-ios-gray opacity-30 mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">보관함이 비어있습니다</h3>
           <p className="text-sm text-ios-gray mb-6">마음에 드는 작품을 찾아 보관함에 담아보세요.</p>
           <Button onClick={() => navigate('/')}>작품 둘러보기</Button>
        </div>
      )}
    </div>
  );
};