import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserData } from '../types';
import { Button } from '../components/ui/Button';
import { User, LogOut, Coins, ChevronRight, Settings, CreditCard, Bell } from 'lucide-react';

const { useNavigate, Link } = ReactRouterDOM as any;

export const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
      return;
    }
    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
             setTokens((snap.data() as UserData).tokens || 0);
          }
        } catch (e) {
          console.error("Error fetching user tokens", e);
        }
      }
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (authLoading || !user) return null;

  return (
    <div className="pb-24 pt-8 px-6 md:px-10 max-w-2xl mx-auto min-h-screen animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">마이페이지</h1>

      {/* User Card */}
      <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/5 flex items-center gap-4 mb-6">
         <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden border-2 border-white/10">
           {user.photoURL ? (
             <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-gray-700 to-gray-600">
               <User size={32} />
             </div>
           )}
         </div>
         <div>
            <h2 className="text-xl font-bold text-white">{user.displayName || '이름 없음'}</h2>
            <p className="text-sm text-ios-gray">{user.email}</p>
         </div>
      </div>

      {/* Token Card */}
      <div className="bg-gradient-to-br from-ios-blue/20 to-purple-600/20 p-6 rounded-3xl border border-ios-blue/20 mb-8 relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-center">
            <div>
               <p className="text-ios-blue font-medium text-sm mb-1">보유 토큰</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold text-white">{tokens}</span>
                 <span className="text-lg text-white/60">T</span>
               </div>
            </div>
            <Link to="/shop">
               <Button size="sm" className="bg-white text-black hover:bg-gray-200 shadow-none border-0">충전하기</Button>
            </Link>
         </div>
         <Coins className="absolute -bottom-4 -right-4 text-ios-blue/10 w-32 h-32" />
      </div>

      {/* Settings List */}
      <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden mb-8">
         <MenuItem icon={<User size={20} />} label="프로필 수정" />
         <MenuItem icon={<Bell size={20} />} label="알림 설정" />
         <MenuItem icon={<CreditCard size={20} />} label="결제 내역" />
         <MenuItem icon={<Settings size={20} />} label="앱 설정" />
      </div>

      <Button variant="secondary" className="w-full py-4 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleLogout}>
        <LogOut size={20} className="mr-2" /> 로그아웃
      </Button>
    </div>
  );
};

const MenuItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3 text-white">
      <span className="text-ios-gray">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-600" />
  </button>
);