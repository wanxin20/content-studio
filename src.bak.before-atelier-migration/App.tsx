import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Workbench from './pages/Workbench';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* WeChat workbench (all share one component, view derived from URL) */}
      <Route path="/wechat/feeds" element={<Workbench />} />
      <Route path="/wechat/feeds/:sourceId" element={<Workbench />} />
      <Route path="/wechat/drafts" element={<Workbench />} />
      <Route path="/wechat/published" element={<Workbench />} />
      <Route path="/settings" element={<Workbench />} />

      {/* Placeholders for future platforms */}
      <Route path="/xhs/feeds" element={<Placeholder />} />
      <Route path="/xhs/rewrite" element={<Placeholder />} />
      <Route path="/xhs/generate" element={<Placeholder />} />
      <Route path="/douyin/feeds" element={<Placeholder />} />
      <Route path="/douyin/script" element={<Placeholder />} />
      <Route path="/douyin/avatar" element={<Placeholder />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
