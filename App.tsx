import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AuthPage } from './pages/Auth';
import { Editor } from './pages/Editor';
import { Reader } from './pages/Reader';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { Shop } from './pages/Shop';
import { NovelDetail } from './pages/NovelDetail';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM as any;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/editor" element={<Editor />} />
            
            {/* Novel Detail Page */}
            <Route path="/novel/:id" element={<NovelDetail />} />
            
            {/* Reader: Needs both Novel ID and Chapter ID */}
            <Route path="/read/:novelId/:chapterId" element={<Reader />} />
            
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;