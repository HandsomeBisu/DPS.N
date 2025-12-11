import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { BookOpen, Edit3, User, LogOut, Search, Library, ArrowRight, Coins } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const { Link, useLocation } = ReactRouterDOM as any;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = () => signOut(auth);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col py-8 px-4 bg-black border-r border-white/10 z-50">
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center text-white font-bold">
            <BookOpen size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight">Nocturne</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 w-full">
          <NavItem to="/" icon={<BookOpen size={20} />} active={isActive('/')} label="홈" />
          <NavItem to="/search" icon={<Search size={20} />} active={isActive('/search')} label="검색" />
          <NavItem to="/library" icon={<Library size={20} />} active={isActive('/library')} label="보관함" />
          {user && (
            <NavItem to="/editor" icon={<Edit3 size={20} />} active={isActive('/editor')} label="스튜디오" />
          )}
          <NavItem to={user ? "/profile" : "/auth"} icon={<User size={20} />} active={isActive('/auth') || isActive('/profile')} label={user ? "마이페이지" : "로그인"} />
        </div>

        {/* Token Shop Promo Card */}
        <div className="mt-auto mb-6 p-4 rounded-2xl bg-[#1C1C1E] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg text-yellow-500">
              <Coins size={14} />
            </div>
            <h4 className="font-bold text-sm text-white">토큰 충전소</h4>
          </div>
          <p className="text-[10px] text-ios-gray mb-3 leading-relaxed">작가를 후원하고 최신화를 감상하세요.</p>
          <Link to="/shop" className="text-xs text-ios-blue font-medium flex items-center gap-1 hover:underline">
            충전하기 <ArrowRight size={12} />
          </Link>
        </div>

        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-ios-gray hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        )}
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-6 z-50 pb-4">
        <NavItemMobile to="/" icon={<BookOpen size={24} />} active={isActive('/')} label="홈" />
        <NavItemMobile to="/search" icon={<Search size={24} />} active={isActive('/search')} label="검색" />
        <NavItemMobile to="/library" icon={<Library size={24} />} active={isActive('/library')} label="보관함" />
        <NavItemMobile to={user ? "/profile" : "/auth"} icon={<User size={24} />} active={isActive('/auth') || isActive('/profile')} label={user ? "MY" : "로그인"} />
      </nav>

      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, active, label }: { to: string, icon: React.ReactNode, active: boolean, label: string }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-ios-blue text-white shadow-lg shadow-blue-900/20' : 'text-ios-gray hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const NavItemMobile = ({ to, icon, active, label }: { to: string, icon: React.ReactNode, active: boolean, label: string }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center gap-1 transition-colors duration-200 ${active ? 'text-ios-blue' : 'text-ios-gray'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);