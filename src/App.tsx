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
  // 1. Your Existing Auth State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. The New Theme State
  const [isDark, setIsDark] = useState(false);

  // 3. Theme Hydration Lifecycle (Runs once on mount)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 4. Your Existing Auth Observer Lifecycle
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 5. Theme Toggle Mutator Function
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 6. Updated Loading State (Prevents flashing by using the dynamic background)
  if (loading) return <div className="min-h-screen bg-[#e8e5d9] dark:bg-[#020617]" />;

  // 7. Main Render Payload
  return (
    // The outermost container orchestrates the background color transition globally
    <div className="min-h-screen transition-colors duration-500 bg-[#e8e5d9] text-slate-900 dark:bg-[#020617] dark:text-slate-50">

      {/* Floating Action Button (FAB) placed outside the Router so it exists on every page */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white text-slate-900 dark:bg-[#0f172a] dark:text-white border border-[#c5c8bd] dark:border-slate-700 hover:scale-105 transition-transform"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* Your Exact Existing Router Architecture */}
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

    </div>
  );
}