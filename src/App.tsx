import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/store/auth';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Landing from './pages/Landing';

import AppLayout from './pages/AppLayout';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Asset from './pages/Asset';
import Simulator from './pages/Simulator';
import Traders from './pages/Traders';
import Forecasts from './pages/Forecasts';
import News from './pages/News';
import Learn from './pages/Education/Learn';
import Brokers from './pages/Education/Brokers';
import Blockchain from './pages/Education/Blockchain';
import Glossary from './pages/Education/Glossary';
import { Forum } from './pages/Forum';
import { Community } from './pages/Community';
import { Messages } from './pages/Messages';
import Creator from './pages/Creator';
import Rules from './pages/Rules';
import Settings from './pages/Settings';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  const loc = useLocation();
  if (loading)
    return (
      <div className="h-full grid place-items-center text-text-muted">Chargement…</div>
    );
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="h-full bg-app subtle-grid">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          <Route path="markets/:kind/:id" element={<Asset />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="traders" element={<Traders />} />
          <Route path="forecasts" element={<Forecasts />} />
          <Route path="news" element={<News />} />
          <Route path="learn" element={<Learn />} />
          <Route path="brokers" element={<Brokers />} />
          <Route path="blockchain" element={<Blockchain />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="forum" element={<Forum />} />
          <Route path="community" element={<Community />} />
          <Route path="messages" element={<Messages />} />
          <Route path="creator" element={<Creator />} />
          <Route path="rules" element={<Rules />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
