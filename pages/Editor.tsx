import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { Novel, Chapter, DevicePreview } from '../types';
import { Plus, Save, Smartphone, Monitor, ChevronLeft, ChevronRight, Settings, Image as ImageIcon, BookOpen, LayoutTemplate, ArrowLeft, Type } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

// Predefined Categories
const CATEGORIES = ['판타지', '로맨스', '무협', 'SF', '미스터리', '공포', '라이트노벨', '드라마'];

// Predefined Covers for Demo
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
];

export const Editor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Modes: 'dashboard', 'wizard', 'editor'
  const [mode, setMode] = useState<'dashboard' | 'wizard' | 'editor'>('dashboard');
  
  // Dashboard State
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loadingNovels, setLoadingNovels] = useState(true);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(0); // 0: Title, 1: Cover, 2: Category
  const [newNovelData, setNewNovelData] = useState<{title: string, desc: string, cover: string, category: string}>({
    title: '', desc: '', cover: '', category: ''
  });

  // Editor State
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  
  // Multi-page Editor State
  const [pages, setPages] = useState<string[]>(['']);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  
  const [previewMode, setPreviewMode] = useState<DevicePreview>('mobile');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default font size

  // Fetch Novels on Mount
  useEffect(() => {
    if (!user) return;
    const fetchNovels = async () => {
      try {
        const q = query(collection(db, "novels"), where("authorId", "==", user.uid));
        const snapshot = await getDocs(q);
        setNovels(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Novel)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingNovels(false);
      }
    };
    fetchNovels();
  }, [user]);

  // Fetch Chapters when Active Novel Changes
  useEffect(() => {
    if (!activeNovel) return;
    const fetchChapters = async () => {
      try {
        const q = query(collection(db, `novels/${activeNovel.id}/chapters`));
        const snapshot = await getDocs(q);
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
        setChapters(loaded.sort((a,b) => a.order - b.order));
      } catch (e) { console.error(e); }
    };
    fetchChapters();
  }, [activeNovel]);

  // Load Chapter into Editor
  useEffect(() => {
    if (activeChapter) {
      setChapterTitle(activeChapter.title);
      // Handle legacy single content vs new pages array
      if (activeChapter.pages && activeChapter.pages.length > 0) {
        setPages(activeChapter.pages);
      } else if ((activeChapter as any).content) {
        setPages([(activeChapter as any).content]);
      } else {
        setPages(['']);
      }
      setCurrentPageIdx(0);
    } else {
      setChapterTitle('');
      setPages(['']);
      setCurrentPageIdx(0);
    }
  }, [activeChapter]);

  // --- Wizard Logic ---
  const startWizard = () => {
    setNewNovelData({ title: '', desc: '', cover: DEFAULT_COVERS[0], category: '' });
    setWizardStep(0);
    setMode('wizard');
  };

  const finishWizard = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const payload = {
        authorId: user.uid,
        authorName: user.displayName || 'Author',
        title: newNovelData.title,
        description: newNovelData.desc,
        coverUrl: newNovelData.cover,
        category: newNovelData.category,
        tags: [newNovelData.category],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: false,
        chapterCount: 0
      };
      const ref = await addDoc(collection(db, 'novels'), payload);
      const created = { id: ref.id, ...payload } as Novel;
      setNovels([...novels, created]);
      setActiveNovel(created);
      setMode('editor');
    } catch (e) {
      console.error(e);
      alert('생성 실패');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Editor Logic ---
  const handlePageChange = (val: string) => {
    const newPages = [...pages];
    newPages[currentPageIdx] = val;
    setPages(newPages);
  };

  const addPage = () => {
    setPages([...pages, '']);
    setCurrentPageIdx(pages.length); // go to new page
  };

  const deletePage = () => {
    if (pages.length <= 1) {
      handlePageChange('');
      return;
    }
    const newPages = pages.filter((_, i) => i !== currentPageIdx);
    setPages(newPages);
    setCurrentPageIdx(Math.max(0, currentPageIdx - 1));
  };

  const saveChapter = async () => {
    if (!activeNovel || !user) return;
    setIsSaving(true);
    try {
      const data = {
        title: chapterTitle || '무제',
        pages: pages,
        lastUpdated: Date.now()
      };
      
      if (activeChapter) {
        await updateDoc(doc(db, `novels/${activeNovel.id}/chapters`, activeChapter.id), data);
        setChapters(prev => prev.map(c => c.id === activeChapter.id ? { ...c, ...data } : c));
      } else {
        const order = chapters.length + 1;
        const newCh = { ...data, order };
        const ref = await addDoc(collection(db, `novels/${activeNovel.id}/chapters`), newCh);
        setChapters([...chapters, { id: ref.id, ...newCh } as Chapter]);
        setActiveChapter({ id: ref.id, ...newCh } as Chapter);
        // update count
        await updateDoc(doc(db, 'novels', activeNovel.id), { chapterCount: order });
      }
    } catch(e) {
       console.error(e);
       alert('저장 실패');
    } finally {
       setIsSaving(false);
    }
  };

  // --- Renderers ---

  if (!user) return <div className="p-10 text-center">로그인이 필요합니다.</div>;

  // 1. Wizard View
  if (mode === 'wizard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-lg bg-ios-card rounded-3xl border border-white/10 p-8 animate-slide-up">
           {/* Progress Dots */}
           <div className="flex justify-center gap-2 mb-8">
              {[0, 1, 2].map(s => (
                 <div key={s} className={`w-2 h-2 rounded-full ${s === wizardStep ? 'bg-ios-blue' : 'bg-white/20'}`} />
              ))}
           </div>

           {wizardStep === 0 && (
              <div className="space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-bold text-center">작품의 제목은 무엇인가요?</h2>
                 <Input label="제목" value={newNovelData.title} onChange={e => setNewNovelData({...newNovelData, title: e.target.value})} placeholder="멋진 제목을 입력하세요" autoFocus />
                 <TextArea label="줄거리 (선택)" value={newNovelData.desc} onChange={e => setNewNovelData({...newNovelData, desc: e.target.value})} rows={4} />
                 <Button className="w-full" disabled={!newNovelData.title} onClick={() => setWizardStep(1)}>다음</Button>
              </div>
           )}

           {wizardStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-bold text-center">표지를 선택해주세요</h2>
                 <div className="grid grid-cols-2 gap-4">
                    {DEFAULT_COVERS.map((url) => (
                       <button key={url} onClick={() => setNewNovelData({...newNovelData, cover: url})} className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${newNovelData.cover === url ? 'border-ios-blue scale-95' : 'border-transparent hover:border-white/20'}`}>
                          <img src={url} className="w-full h-full object-cover" alt="cover option" />
                          {newNovelData.cover === url && <div className="absolute inset-0 bg-ios-blue/20 flex items-center justify-center text-white font-bold">V</div>}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-3">
                   <Button variant="secondary" onClick={() => setWizardStep(0)}>이전</Button>
                   <Button className="flex-1" disabled={!newNovelData.cover} onClick={() => setWizardStep(2)}>다음</Button>
                 </div>
              </div>
           )}

           {wizardStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-bold text-center">장르를 선택해주세요</h2>
                 <div className="flex flex-wrap gap-2 justify-center">
                    {CATEGORIES.map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setNewNovelData({...newNovelData, category: cat})}
                         className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${newNovelData.category === cat ? 'bg-ios-blue border-ios-blue text-white' : 'bg-transparent border-white/20 text-ios-gray hover:border-white'}`}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-3 mt-8">
                   <Button variant="secondary" onClick={() => setWizardStep(1)}>이전</Button>
                   <Button className="flex-1" disabled={!newNovelData.category} onClick={finishWizard} isLoading={isSaving}>작품 생성 완료</Button>
                 </div>
              </div>
           )}
           
           <button onClick={() => setMode('dashboard')} className="mt-6 w-full text-center text-xs text-ios-gray hover:text-white">취소하고 나가기</button>
        </div>
      </div>
    )
  }

  // 2. Editor View
  if (mode === 'editor' && activeNovel) {
    return (
      <div className="h-screen flex flex-col bg-black">
         {/* Editor Header */}
         <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#111]">
            <div className="flex items-center gap-3">
               <button onClick={() => setMode('dashboard')} className="text-ios-gray hover:text-white"><ArrowLeft size={20}/></button>
               <span className="font-bold hidden md:inline">{activeNovel.title}</span>
               <span className="text-white/20 mx-2">/</span>
               <Input 
                 value={chapterTitle} 
                 onChange={e => setChapterTitle(e.target.value)} 
                 placeholder="챕터 제목 입력"
                 className="!bg-transparent !border-transparent !p-0 !h-auto !w-48 !text-sm focus:!ring-0"
               />
            </div>
            <div className="flex items-center gap-2">
               {/* Font Size Control */}
               <div className="flex items-center bg-white/5 rounded-lg mr-2">
                  <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 text-gray-400 hover:text-white border-r border-white/10"><Type size={12}/></button>
                  <span className="w-8 text-center text-xs text-gray-300 font-mono">{fontSize}</span>
                  <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-2 text-gray-400 hover:text-white border-l border-white/10"><Type size={16}/></button>
               </div>

               <div className="hidden md:flex bg-white/5 rounded-lg p-1 mr-2">
                  <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><Smartphone size={16}/></button>
                  <button onClick={() => setPreviewMode('pc')} className={`p-1.5 rounded ${previewMode === 'pc' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><Monitor size={16}/></button>
               </div>
               <Button size="sm" onClick={saveChapter} isLoading={isSaving} className="gap-2"><Save size={14}/> 저장</Button>
            </div>
         </div>

         <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Chapter List */}
            <div className={`w-64 bg-[#111] border-r border-white/5 flex flex-col transition-all ${isSidebarOpen ? '' : '-ml-64'}`}>
               <div className="p-3 border-b border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-ios-gray">회차 목록</span>
                  <button onClick={() => { setActiveChapter(null); setChapterTitle(''); setPages(['']); }}><Plus size={16} className="text-ios-blue"/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {chapters.map((ch, idx) => (
                     <button 
                       key={ch.id} 
                       onClick={() => setActiveChapter(ch)}
                       className={`w-full text-left p-2 rounded-lg text-xs truncate ${activeChapter?.id === ch.id ? 'bg-ios-blue text-white' : 'text-gray-400 hover:bg-white/5'}`}
                     >
                        {idx+1}화. {ch.title}
                     </button>
                  ))}
               </div>
            </div>

            {/* Main Writing Area */}
            <div className="flex-1 flex flex-col h-full bg-[#000] relative">
               {/* Page Navigation Toolbar */}
               <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]">
                  <div className="flex items-center gap-2">
                     <button onClick={() => setSidebarOpen(!isSidebarOpen)}><LayoutTemplate size={16} className="text-gray-500"/></button>
                     <span className="text-xs text-gray-500 ml-2">Page {currentPageIdx + 1} / {pages.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <button disabled={currentPageIdx===0} onClick={() => setCurrentPageIdx(p => p-1)} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16}/></button>
                     <button disabled={currentPageIdx===pages.length-1} onClick={() => setCurrentPageIdx(p => p+1)} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={16}/></button>
                     <div className="w-px h-3 bg-white/20 mx-2"></div>
                     <button onClick={addPage} className="text-xs text-ios-blue flex items-center gap-1 hover:underline"><Plus size={12}/> 페이지 추가</button>
                  </div>
               </div>

               <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 p-8 overflow-y-auto flex justify-center">
                     <textarea
                        className="w-full max-w-3xl h-full bg-transparent resize-none outline-none leading-loose font-serif text-gray-200 placeholder-gray-700"
                        style={{ fontSize: `${fontSize}px` }}
                        placeholder="이곳에 내용을 작성하세요..."
                        value={pages[currentPageIdx]}
                        onChange={e => handlePageChange(e.target.value)}
                     />
                  </div>

                  {/* Preview Pane */}
                  <div className={`hidden lg:flex flex-col border-l border-white/5 bg-[#050505] items-center py-8 transition-all duration-300 ${previewMode === 'pc' ? 'w-1/2' : 'w-[400px]'}`}>
                     <div className={`bg-white text-black overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${previewMode === 'mobile' ? 'w-[320px] h-[640px] rounded-[30px]' : 'w-[90%] h-[80%] rounded-lg'}`}>
                        <div className="bg-gray-100 h-6 w-full flex items-center justify-center border-b border-gray-200">
                           <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto font-serif leading-loose text-sm" style={{ fontSize: `${Math.max(12, fontSize - 4)}px` }}>
                           <h3 className="font-bold text-lg mb-4">{chapterTitle}</h3>
                           <p className="whitespace-pre-wrap">{pages[currentPageIdx]}</p>
                        </div>
                        <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4 text-[10px] text-gray-400">
                           <span>{currentPageIdx+1}/{pages.length}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // 3. Dashboard View (Default)
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen">
       <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">작가 스튜디오</h1>
          <Button onClick={startWizard} className="gap-2"><Plus size={18}/> 새 작품 만들기</Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map(novel => (
             <div key={novel.id} className="bg-ios-card border border-white/5 rounded-2xl overflow-hidden group hover:border-ios-blue/50 transition-all">
                <div className="flex h-32">
                   <div className="w-24 bg-gray-800 shrink-0">
                      {novel.coverUrl ? <img src={novel.coverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><BookOpen/></div>}
                   </div>
                   <div className="flex-1 p-4 flex flex-col justify-center">
                      <h3 className="font-bold text-lg text-white mb-1 truncate">{novel.title}</h3>
                      <p className="text-xs text-ios-gray mb-3 line-clamp-2">{novel.description}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{novel.category || '장르없음'}</span>
                         <span className="text-[10px] text-gray-500">{novel.chapterCount}화 연재중</span>
                      </div>
                   </div>
                </div>
                <div className="border-t border-white/5 p-3 flex justify-between bg-black/20">
                   <button className="text-xs text-ios-gray hover:text-white">통계 보기</button>
                   <button onClick={() => { setActiveNovel(novel); setMode('editor'); }} className="text-xs text-ios-blue font-bold hover:underline">에디터 열기</button>
                </div>
             </div>
          ))}
          
          <button onClick={startWizard} className="flex flex-col items-center justify-center h-32 md:h-auto rounded-2xl border-2 border-dashed border-white/10 hover:border-ios-blue/50 hover:bg-white/5 transition-all group">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-ios-blue group-hover:text-white transition-colors">
                <Plus size={20} />
             </div>
             <span className="text-sm text-gray-500 font-medium">새 작품 추가</span>
          </button>
       </div>
    </div>
  );
};