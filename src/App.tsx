import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Home from './pages/Home';
import LibraryWeixin from './pages/library/Weixin';
import TextRewrite from './pages/text/Rewrite';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />

        {/* 唯二的两个真功能 */}
        <Route path="/library" element={<Navigate to="/library/weixin" replace />} />
        <Route path="/library/weixin" element={<LibraryWeixin />} />

        <Route path="/text" element={<Navigate to="/text/rewrite" replace />} />
        <Route path="/text/rewrite" element={<TextRewrite />} />

        {/* 其他全部回首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
