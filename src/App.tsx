import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Home from './pages/Home';
import LibraryWeixin from './pages/library/Weixin';
import LibraryXhs from './pages/library/Xhs';
import TextRewrite from './pages/text/Rewrite';
import MmImage from './pages/multimodal/Image';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />

        {/* 已上线的真功能 */}
        <Route path="/library" element={<Navigate to="/library/weixin" replace />} />
        <Route path="/library/weixin" element={<LibraryWeixin />} />
        <Route path="/library/xhs" element={<LibraryXhs />} />

        <Route path="/text" element={<Navigate to="/text/rewrite" replace />} />
        <Route path="/text/rewrite" element={<TextRewrite />} />

        <Route path="/multimodal" element={<Navigate to="/multimodal/image" replace />} />
        <Route path="/multimodal/image" element={<MmImage />} />

        {/* 其他全部回首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
