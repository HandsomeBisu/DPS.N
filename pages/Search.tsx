import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Novel } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { Search as SearchIcon, X, Book, Star } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { DEMO_NOVELS } from '../mockData';

const { Link } = ReactRouterDOM as any;

export const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Cache all novels for client-side filtering (better for small datasets & demo)
  const [allNovels, setAllNovels] = useState<Novel[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "novels"));
        const snapshot = await getDocs(q);
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel));
        
        // Merge with Demo data for better experience if DB is empty
        if (fetched.length === 0) {
           fetched = DEMO_NOVELS;
        } else {
           // Also include demo novels that aren't in DB just for search completeness in this environment
           const dbIds = new Set(fetched.map(n => n.id));
           DEMO_NOVELS.forEach(demo => {
              if (!dbIds.has(demo.id)) fetched.push(demo);
           });
        }
        
        setAllNovels(fetched);
        setNovels(fetched); // Initial display
      } catch (e) {
        console.error(e);
        setAllNovels(DEMO_NOVELS);
        setNovels(DEMO_NOVELS);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setNovels(allNovels);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = allNovels.filter(n => 
      n.title.toLowerCase().includes(lower) || 
      n.authorName.toLowerCase().includes(lower) ||
      n.tags.some(t => t.toLowerCase().includes(lower))
    );
    setNovels(filtered);
  }, [searchTerm, allNovels]);

  return (
    <div className="pb-24 pt-8 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">검색</h1>
        <div className="relative">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목, 작가, 또는 태그로 검색..."
            className="pl-12 !bg-[#1C1C1E] !border-transparent focus:!bg-[#2C2C2E]"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray" size={20} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-gray hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-ios-gray">로딩 중...</div>
        ) : novels.length > 0 ? (
          novels.map(novel => (
            <Link 
              to={`/read/${novel.id}`} 
              key={novel.id} 
              className="flex gap-4 p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 hover:bg-white/10 transition-all animate-fade-in group"
            >
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-800 shrink-0 relative">
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={novel.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/20"><Book size={20}/></div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white group-hover:text-ios-blue transition-colors mb-1">{novel.title}</h3>
                    {novel.rating && (
                      <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">
                        <Star size={10} fill="currentColor" />
                        <span>{novel.rating}</span>
                      </div>
                    )}
                 </div>
                 <p className="text-sm text-ios-gray mb-2">{novel.authorName}</p>
                 <p className="text-xs text-gray-500 line-clamp-2 mb-3">{novel.description}</p>
                 <div className="flex gap-2">
                    {novel.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-ios-gray border border-white/5">#{tag}</span>
                    ))}
                 </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-ios-gray">
             <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
             <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};