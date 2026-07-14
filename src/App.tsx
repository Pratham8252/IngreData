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

