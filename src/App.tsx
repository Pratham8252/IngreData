import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './firebase'; // <-- Wakes up your database before the app loads!

// Import all your pages
import LandingPage from './LandingPage';
import ScannerApp from './ScannerApp';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import FAQ from './FAQ';
import HowToScan from './HowToScan';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show a dark screen while Firebase checks login status
  if (loading) return <div className="min-h-screen bg-slate-950" />;

  return (
    <Router>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
        <Route path="/app" element={<ScannerApp />} />

        {/* Footer Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/how-to-scan" element={<HowToScan />} />
      </Routes>
    </Router>
  );
}