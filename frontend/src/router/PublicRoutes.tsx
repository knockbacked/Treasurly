import { Routes, Route } from 'react-router-dom';
import HelloPage from '../pages/HelloPage';
import SigninPage from '../pages/SigninPage';
import SignupPage from '../pages/SignupPage';

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HelloPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
    

    </Routes>
  );
}
