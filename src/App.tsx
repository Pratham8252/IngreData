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
  const [isDark, setIsDark] = useState(false);

  // Component Hydration: Checks LocalStorage so the app remembers the theme
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

  // Firebase Auth Observer
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // DOM Mutator Function
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

  if (loading) return <div className="min-h-screen bg-[#FDF6F0] dark:bg-[#020617]" />;

  return (
    // THE GLOBAL WALL: Peach in light mode, Navy in dark mode
    <div className="min-h-screen transition-colors duration-500 bg-[#FDF6F0] text-slate-900 dark:bg-[#020617] dark:text-slate-50">

      {/* THE TOGGLE BUTTON */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white text-slate-900 dark:bg-[#0f172a] dark:text-white border border-gray-200 dark:border-slate-700 hover:scale-105 transition-transform"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
          <Route path="/app" element={<ScannerApp />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/how-to-scan" element={<HowToScan />} />
        </Routes>
      </Router>

    </div>
  );
}