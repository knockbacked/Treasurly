import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicRoutes from './router/PublicRoutes';
import PrivateRoutes from './router/PrivateRoutes';

// ✅ Keep only these for now

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/app/*" element={<PrivateRoutes />} />
      </Routes>
    </Router>
  );
}
