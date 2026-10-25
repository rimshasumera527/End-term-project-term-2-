import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Tutors from './pages/Tutors.jsx';
import TutorDetail from './pages/TutorDetail.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Guide from './pages/Guide.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tutors" element={<Tutors />} />
      <Route path="/tutors/:id" element={<TutorDetail />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="/guide" element={<Guide />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
