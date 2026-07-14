import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Beaker, Activity, Zap, CheckCircle2, User, History, LogOut, Trash2, Scale, AlertOctagon, Home, Shield, BookOpen, Save } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';

// FIREBASE IMPORTS
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const googleProvider = new GoogleAuthProvider();

const dropletSpring = { type: "spring", stiffness: 260, damping: 20, mass: 1, bounce: 0.4 };

export default function ScannerApp() {
    const [appState, setAppState] = useState<'loading' | 'auth' | 'main'>('loading');
    const [activeTab, setActiveTab] = useState<'home' | 'history' | 'scan' | 'compare' | 'profile'>('scan');

    // AUTH & SAFETY GATE
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // SCANNER
    const [language, setLanguage] = useState('English');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [results, setResults] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // COMPARE TAB
    const [imgA, setImgA] = useState<{ url: string, base64: string } | null>(null);
    const [imgB, setImgB] = useState<{ url: string, base64: string } | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [compareResults, setCompareResults] = useState<any | null>(null);
    const fileRefA = useRef<HTMLInputElement>(null);
    const fileRefB = useRef<HTMLInputElement>(null);

    // HISTORY
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- AUTO-LOGIN & FETCH ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAppState('main');
                fetchHistory(user.uid);
            } else {
                setAppState('auth');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchHistory = async (userId: string) => {
        try {
            const q = query(collection(db, "scans"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            historyData.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setScanHistory(historyData);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {

        }
    };

    // --- MATH: PANTRY GRADE LOGIC ---
    const calculateGrades = () => {
        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();
        const lastMonth = curMonth === 0 ? 11 : curMonth - 1;
        const lastYear = curMonth === 0 ? curYear - 1 : curYear;

        let curTotal = 0, curCount = 0, lastTotal = 0, lastCount = 0;
        const toxins: string[] = [];

        scanHistory.forEach(scan => {
            if (!scan.timestamp) return;
            const d = new Date(scan.timestamp.seconds * 1000);
            const intensity = scan.processingIntensity || 0;

            if (d.getMonth() === curMonth && d.getFullYear() === curYear) { curTotal += intensity; curCount++; }
            if (d.getMonth() === lastMonth && d.getFullYear() === lastYear) { lastTotal += intensity; lastCount++; }

            if (scan.healthSummary?.acute?.status === 'danger' || scan.healthSummary?.chronic?.status === 'danger') {
                if (scan.productName && !toxins.includes(scan.productName)) toxins.push(scan.productName);
            }
        });

        const getLetter = (avg: number) => {
            if (avg === 0) return { letter: "N/A", color: "text-slate-500 border-slate-500" };
            if (avg <= 20) return { letter: "A+", color: "text-emerald-400 border-emerald-400" };
            if (avg <= 40) return { letter: "B", color: "text-blue-400 border-blue-400" };
            if (avg <= 70) return { letter: "C", color: "text-amber-400 border-amber-400" };
            return { letter: "F", color: "text-red-500 border-red-500" };
        };

        const curAvg = curCount > 0 ? Math.round(curTotal / curCount) : 0;
        const lastAvg = lastCount > 0 ? Math.round(lastTotal / lastCount) : 0;

        return { current: getLetter(curAvg), last: getLetter(lastAvg), count: curCount, toxins };
    };

    
    const grades = calculateGrades();

    // --- PRIVACY & DELETION LOGIC ---
    const deleteSingleScan = async (id: string) => {
        if (!confirm("Delete this scan?")) return;
        await deleteDoc(doc(db, "scans", id));
        setScanHistory(prev => prev.filter(scan => scan.id !== id));
    };

    const deleteAllHistory = async () => {
        if (!confirm("WARNING: This will permanently delete all your saved scans. Continue?")) return;
        for (const scan of scanHistory) {
            await deleteDoc(doc(db, "scans", scan.id));
        }
        setScanHistory([]);
        alert("History cleared.");
    };

    const handleDeleteAccount = async () => {
        if (!confirm("CRITICAL WARNING: This deletes your entire account and all data. This cannot be undone. Type OK to confirm.")) return;
        try {
            await deleteAllHistory();
            await deleteUser(auth.currentUser!);
            setAppState('auth');
        } catch (error: any) {
            alert("Error deleting account. Please log out and log back in, then try again.");
        }
    };

    // --- AI LOGIC (SCAN & COMPARE) ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any, base64Setter: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setter(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => base64Setter((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageBase64) return;
        setIsAnalyzing(true);
        setResults(null);
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { temperature: 0, topK: 1 }
            });

            // Prompt includes Gatekeeper Rule AND strict NOVA classification penalty
            const prompt = `
        CRITICAL GATEKEEPER RULE: You are an ingredient parser, not a product guesser. First, verify that the image explicitly contains a readable, printed list of ingredients. If the image is the front of a package, a logo, or does not clearly show written ingredients, you MUST NOT guess the ingredients. You MUST immediately abort and return exactly this JSON and nothing else: { "error": "InvalidImage" }
        
        If and ONLY if a clear ingredient list is present, analyze these ingredients. Return ONLY raw JSON. Do not include markdown codeblocks.

        TRANSLATION INSTRUCTION: Translate all output string VALUES (descriptions, names, summaries) into ${language}. DO NOT translate the JSON keys. The JSON keys MUST remain exactly as written below in English.
        
        STRICT SCORING RUBRIC (0-100):
        - 0-10: Single whole ingredient.
        - 11-30: Minimally processed.
        - 31-70: Moderately processed.
        - 71-100: Ultra-processed.
        
        CRITICAL PENALTY OVERRIDE: You must strictly evaluate ALL ingredients. Do not give a low/healthy score just because the primary ingredient is healthy. If there are ANY artificial flavors, colors, artificial sweeteners, or harmful preservatives, the processingIntensity MUST automatically be 75 or higher.
        
        {
          "productName": "Guess generic name",
          "processingIntensity": (Number 0-100),
          "synergyAnalysis": { "text": "...", "status": "'safe'|'caution'|'danger'" },
          "regulatorySummary": {
            "acute": { "text": "...", "status": "'safe'|'caution'|'danger'" },
            "chronic": { "text": "...", "status": "'safe'|'caution'|'danger'" },
            "sources": "Name official food databases used like FDA, FSSAI, WHO, EFSA"
          },
          "ingredients": [
            { "name": "...", "function": "...", "desc": "..." }
          ]
        }
      `;
            const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }]);
            const cleanedText = result.response.text().replace(/```json|```/g, '').trim();
            const parsedData = JSON.parse(cleanedText);

            // --- THE SAFETY CATCH ---
            if (parsedData.error === "InvalidImage") {
                throw new Error("No ingredient list found. Front of package scanned.");
            }

            setResults(parsedData);

        } catch (err) {
            console.error(err);
            // Triggers the animated vector tutorial modal
            setShowErrorModal(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCompare = async () => {
        if (!imgA?.base64 || !imgB?.base64) return alert("Upload both images.");
        setIsComparing(true);
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { temperature: 0, topK: 1 }
            });
            const prompt = `Analyze these two food labels. Translate to ${language}. Apply strict health penalties for artificial dyes, sweeteners, and preservatives. Return ONLY raw JSON: { "winner": "Product A or Product B", "reason": "...", "productA": [{name, function, desc}], "productB": [{name, function, desc}] }. CRITICAL RULE: If the ingredients of Product A and Product B are identical (even if the photos look different), do NOT generate a comparison. You MUST return exactly this JSON and nothing else: { "isIdentical": true, "winner": "None", "reason": "Identical" }`;

            const result = await model.generateContent([prompt, { inlineData: { data: imgA.base64, mimeType: "image/jpeg" } }, { inlineData: { data: imgB.base64, mimeType: "image/jpeg" } }]);

            const cleanedText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanedText);

            // --- ZERO-RISK SAFETY SHIELD ---
            if (parsedData?.isIdentical === true) {
                setIsComparing(false);
                alert("These products have identical ingredient lists. We cannot compare the same item against itself. Please switch to Scan Mode for a complete nutritional breakdown of this product.");
                return;
            }
            // -------------------------------

            setCompareResults(parsedData);
        } catch (err) { alert("Comparison failed."); }
        finally { setIsComparing(false); }
    };

    const handleSaveToVault = async () => {
        if (!results || !auth.currentUser) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, "scans"), { userId: auth.currentUser.uid, timestamp: serverTimestamp(), ...results });
            setSaveSuccess(true);
            fetchHistory(auth.currentUser.uid);
        } catch (error) {
            console.error("FIREBASE REJECTION DATA:", error);
            alert("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    // ==============================
    // UI THEMES
    // ==============================
    const getIntensityColor = (score: number) => {
        if (score < 30) return "text-emerald-400 stroke-emerald-400";
        if (score < 70) return "text-amber-400 stroke-amber-400";
        return "text-red-500 stroke-red-500";
    };

    const getOverallTheme = () => {
        if (activeTab !== 'scan' || !results) return { topOrb: "bg-indigo-600", bottomOrb: "bg-rose-600" };
        if (results.processingIntensity < 30) return { topOrb: "bg-emerald-600", bottomOrb: "bg-emerald-500" };
        if (results.processingIntensity < 70) return { topOrb: "bg-amber-600", bottomOrb: "bg-amber-500" };
        return { topOrb: "bg-red-600", bottomOrb: "bg-red-500" };
    };

    const getBoxTheme = (status: string) => {
        if (status === 'safe') return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
        if (status === 'caution') return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
        return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
    };

    const theme = getOverallTheme();

    // ==============================
    // RENDERS
    // ==============================
    if (appState === 'loading') return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;

    if (appState === 'auth') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 fixed"></div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md bg-white/[0.08] backdrop-blur-[40px] border border-white/20 p-8 rounded-[2.5rem] shadow-2xl my-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-indigo-500/50">
                            <img src="/favicon.png" alt="IngreData Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">IngreData</h1>
                        <p className="text-white/50 text-sm mt-2">{isLogin ? "Welcome Back" : "Create Account"}</p>
                    </div>

                    <div className="space-y-4">
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 rounded-xl p-4 text-white outline-none border border-white/10" />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/30 rounded-xl p-4 text-white outline-none border border-white/10" />

                        {/* RESTORED MANDATORY TERMS SAFETY GATE */}
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                <Shield className="w-4 h-4" /> Safety Agreement
                            </div>
                            <p className="text-white/40 text-[11px] leading-relaxed">
                                By ticking below, you acknowledge that IngreData provides AI-powered analysis for educational insights only. It does not replace medical or certified health advice.
                            </p>
                            <label className="flex items-start gap-3 select-none cursor-pointer mt-2 pt-2 border-t border-white/5">
                                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 accent-indigo-500" />
                                <span className="text-white/70 text-xs font-medium">I accept the Terms and Conditions to proceed.</span>
                            </label>
                        </div>

                        <button
                            disabled={!agreedToTerms}
                            onClick={async () => {
                                try { isLogin ? await signInWithEmailAndPassword(auth, email, password) : await createUserWithEmailAndPassword(auth, email, password); }
                                catch (e: any) { alert(e.message); }
                            }}
                            className={`w-full font-bold py-4 rounded-xl transition-all ${agreedToTerms ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        >
                            {isLogin ? "Secure Login" : "Create Account"}
                        </button>

                        <button
                            disabled={!agreedToTerms}
                            onClick={async () => { try { await signInWithPopup(auth, googleProvider); } catch (e: any) { alert(e.message) } }}
                            className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-3 transition-all ${agreedToTerms ? 'bg-white text-slate-900' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                        <p onClick={() => setIsLogin(!isLogin)} className="text-center text-white/50 text-sm cursor-pointer mt-4">{isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center relative overflow-hidden pb-24">
            {/* BACKGROUND ORBS */}
            <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-40 fixed transition-colors duration-1000 ${theme.topOrb}`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[120px] opacity-30 fixed transition-colors duration-1000 ${theme.bottomOrb}`}></div>

            {/* HEADER */}
            <div className="w-full max-w-md p-4 flex justify-between items-center z-10 sticky top-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                    {/* Standard Logo/Favicon and Text */}
                    <img src="/favicon.png" alt="IngreData" className="w-10 h-10 rounded-md object-contain shadow-sm" />
                    <span className="font-extrabold tracking-tight text-white text-3xl select-none">IngreData</span>

                    {/* Exact SVG matching the requested image layout */}
                    <span
                        className="flex items-center justify-center animate-pulse drop-shadow-2xl ml-1"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(66, 245, 194, 0.4))' }}
                    >
                        <svg viewBox="0 0 100 100" className="w-[55px] h-[55px]">
                            <defs>
                                {/* Cyan to Blue Gradient for Text and Border */}
                                <linearGradient id="ai-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#42f5c2" />
                                    <stop offset="100%" stopColor="#007bff" />
                                </linearGradient>

                                {/* Pink to Purple Gradient for Stars */}
                                <linearGradient id="star-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ff99cc" />
                                    <stop offset="100%" stopColor="#9933ff" />
                                </linearGradient>

                                {/* The reusable four-pointed curved star shape */}
                                <g id="sparkle">
                                    <path d="M0,-14 C0,-2 2,0 14,0 C2,0 0,2 0,14 C0,2 -2,0 -14,0 C-2,0 0,-2 0,-14 Z" fill="url(#star-grad)" />
                                </g>
                            </defs>

                            {/* Glowing Border Track */}
                            <path
                                d="M 45 18 L 75 18 A 18 18 0 0 1 93 36 L 93 74 A 18 18 0 0 1 75 92 L 35 92 A 18 18 0 0 1 17 74 L 17 55"
                                fill="none"
                                stroke="url(#ai-grad)"
                                strokeWidth="6.5"
                                strokeLinecap="round"
                            />

                            {/* AI Text */}
                            <text
                                x="55"
                                y="71"
                                fontFamily="system-ui, -apple-system, sans-serif"
                                fontWeight="900"
                                fontSize="38"
                                fill="url(#ai-grad)"
                                textAnchor="middle"
                            >
                                AI
                            </text>

                            {/* Sparkles positioned exactly like the image */}
                            <g transform="translate(32, 22) scale(1.1)">
                                <use href="#sparkle" />
                            </g>
                            <g transform="translate(18, 48) scale(0.9)">
                                <use href="#sparkle" />
                            </g>
                            <g transform="translate(10, 22) scale(0.55)">
                                <use href="#sparkle" />
                            </g>
                        </svg>
                    </span>
                </h1>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-black/40 text-white text-xs font-bold border border-white/20 rounded-full px-2 sm:px-3 py-1.5 outline-none max-w-[70px] sm:max-w-[110px] truncate cursor-pointer hover:bg-white/10 transition-colors">
                    <option value="English">English</option>
                    <option value="Mandarin Chinese">Chinese</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Russian">Russian</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Urdu">Urdu</option>
                </select>
            </div>

            <div className="w-full max-w-md p-4 z-10 flex-1">

                {/* TAB: HOME (DASHBOARD) */}
                {activeTab === 'home' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-white/[0.05] border border-white/10 p-6 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
                            <h2 className="text-white/60 font-bold uppercase tracking-widest text-xs mb-4">Current Month Grade</h2>
                            <div className={`mx-auto w-32 h-32 rounded-full border-4 flex items-center justify-center bg-black/40 shadow-2xl ${grades.current.color}`}>
                                <span className="text-5xl font-black text-white">{grades.current.letter}</span>
                            </div>
                            <p className="text-white/40 text-xs mt-4">Based on {grades.count} saved scans this month.</p>
                        </div>
                        {grades.toxins.length > 0 && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
                                <h3 className="text-rose-400 font-bold flex items-center gap-2 mb-2"><AlertOctagon className="w-4 h-4" /> Toxin Tracker</h3>
                                <div className="flex flex-wrap gap-2">
                                    {grades.toxins.map(t => <span key={t} className="bg-rose-500/20 text-rose-300 text-xs px-2 py-1 rounded border border-rose-500/30">{t}</span>)}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB: HISTORY */}
                {activeTab === 'history' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-white font-bold flex items-center gap-2 mb-4"><History className="w-5 h-5 text-indigo-400" /> Vault History</h3>
                        {scanHistory.length === 0 ? (
                            <div className="bg-white/5 border border-dashed border-white/20 p-6 rounded-2xl text-center text-white/50 text-sm">
                                No scans found in your vault.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scanHistory.map((scan) => (
                                    <div key={scan.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <div>
                                            <h4 className="text-white font-bold">{scan.productName || "Legacy Scan (Old Version)"}</h4>
                                            <p className="text-white/40 text-[10px] mt-1">{scan.timestamp ? new Date(scan.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-1 rounded-lg border font-black text-sm ${getBoxTheme(scan.processingIntensity < 30 ? 'safe' : scan.processingIntensity < 70 ? 'caution' : 'danger').bg} ${getBoxTheme(scan.processingIntensity < 30 ? 'safe' : scan.processingIntensity < 70 ? 'caution' : 'danger').text}`}>
                                                {scan.processingIntensity !== undefined ? scan.processingIntensity : "N/A"}
                                            </div>
                                            <button onClick={() => deleteSingleScan(scan.id)} className="p-2 text-white/30 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB: SCAN */}
                {activeTab === 'scan' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="bg-white/[0.08] backdrop-blur-[40px] border border-white/20 p-6 rounded-[2.5rem] shadow-[inset_0_0_20px_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.5)]">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { handleImageUpload(e, setSelectedImage, setImageBase64); setResults(null); setSaveSuccess(false); }} className="hidden" />
                            {!selectedImage ? (
                                <div onClick={() => fileInputRef.current?.click()} className="bg-white/5 border-2 border-dashed border-white/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                                    <div className="bg-white/10 p-4 rounded-full mb-4"><Camera className="w-10 h-10 text-white" /></div>
                                    <p className="text-white font-semibold text-lg">Scan Label</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img src={selectedImage} alt="Label" className="w-full h-48 object-cover rounded-[1.25rem] opacity-90" />
                                    <button onClick={() => { setSelectedImage(null); setResults(null); }} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white"><X className="w-5 h-5" /></button>
                                    {!results && (
                                        <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 border border-white/20">
                                            {isAnalyzing ? <><Loader2 className="animate-spin" /> Analyzing Matrix...</> : <><Activity /> Analyze</>}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {results && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={dropletSpring as any} className="space-y-4">
                                <div className="bg-white/[0.08] backdrop-blur-[40px] border border-white/20 p-6 rounded-[2rem] flex flex-col items-center relative overflow-hidden">
                                    <h3 className="text-white font-bold text-lg mb-1 text-center">{results.productName || "Processing Level"}</h3>

                                    {/* Container for Centered Speedometer & Right-Aligned Legend */}
                                    <div className="relative w-full flex justify-center items-center mt-4 mb-4">

                                        {/* CENTER: The Speedometer */}
                                        <div className="relative w-36 h-36">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="40" className="stroke-slate-800" strokeWidth="12" fill="none" />
                                                <circle cx="50" cy="50" r="40" className={`transition-all duration-1000 ease-out ${getIntensityColor(results.processingIntensity)}`} strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * results.processingIntensity) / 100} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-4xl font-black ${getIntensityColor(results.processingIntensity).split(' ')[0]}`}>{results.processingIntensity}</span>
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE: The Tiny Legend */}
                                        <div className="absolute right-0 flex flex-col gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] shrink-0"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-white/80 uppercase leading-none">Minimally</span>
                                                    <span className="text-[7px] font-bold text-white/40 uppercase">Processed</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] shrink-0"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-white/80 uppercase leading-none">Moderately</span>
                                                    <span className="text-[7px] font-bold text-white/40 uppercase">Processed</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)] shrink-0"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-white/80 uppercase leading-none">Highly</span>
                                                    <span className="text-[7px] font-bold text-white/40 uppercase">Processed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legal Shield */}
                                    <p className="text-[9px] text-slate-500 text-center leading-relaxed px-2 w-full mt-1">
                                        *This score estimates industrial processing. It is not a health rating or medical advice.
                                    </p>
                                </div>

                                <div className="bg-white/[0.08] backdrop-blur-[40px] border border-white/20 p-5 rounded-[2rem] shadow-xl">
                                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Health Summary</h3>
                                    <div className="space-y-3">
                                        <div className={`border rounded-xl p-4 ${getBoxTheme(results.synergyAnalysis?.status || 'caution').bg} ${getBoxTheme(results.synergyAnalysis?.status || 'caution').border}`}>
                                            <p className={`${getBoxTheme(results.synergyAnalysis?.status || 'caution').text} text-xs font-bold uppercase mb-1`}>Ingredient Synergy</p>
                                            <p className="text-white/80 text-sm">{results.synergyAnalysis?.text}</p>
                                        </div>
                                        <div className={`border rounded-xl p-4 ${getBoxTheme(results.regulatorySummary?.acute?.status || 'caution').bg} ${getBoxTheme(results.regulatorySummary?.acute?.status || 'caution').border}`}>
                                            <p className={`${getBoxTheme(results.regulatorySummary?.acute?.status || 'caution').text} text-xs font-bold uppercase mb-1`}>Short Term</p>
                                            <p className="text-white/80 text-sm">{results.regulatorySummary?.acute?.text}</p>
                                        </div>
                                        <div className={`border rounded-xl p-4 ${getBoxTheme(results.regulatorySummary?.chronic?.status || 'caution').bg} ${getBoxTheme(results.regulatorySummary?.chronic?.status || 'caution').border}`}>
                                            <p className={`${getBoxTheme(results.regulatorySummary?.chronic?.status || 'caution').text} text-xs font-bold uppercase mb-1`}>Long Term</p>
                                            <p className="text-white/80 text-sm">{results.regulatorySummary?.chronic?.text}</p>
                                        </div>

                                        {/* RESTORED SOURCES OF KNOWLEDGE CARD */}
                                        {results.regulatorySummary?.sources && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start mt-2">
                                                <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-indigo-300 text-xs font-bold uppercase">Sources of Ingredient Knowledge</p>
                                                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{results.regulatorySummary.sources}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/[0.08] backdrop-blur-[40px] border border-white/20 p-5 rounded-[2rem] shadow-xl">
                                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Beaker className="w-5 h-5 text-indigo-400" /> Ingredients</h3>
                                    <div className="space-y-3">
                                        {results.ingredients?.map((item: any, index: number) => (
                                            <div key={index} className="bg-black/30 border border-white/10 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-white font-bold leading-none">{item.name}</h3>
                                                    <span className="text-[9px] uppercase font-bold bg-white/10 px-2 py-1 rounded border border-white/10 text-indigo-300">{item.function}</span>
                                                </div>
                                                <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => { setSelectedImage(null); setResults(null); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold">Next</button>
                                    <button onClick={handleSaveToVault} disabled={isSaving || saveSuccess} className={`flex-1 py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg ${saveSuccess ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                                        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : (saveSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
                                        {saveSuccess ? "Saved!" : "Save to Vault"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* TAB: COMPARE */}
                {activeTab === 'compare' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h2 className="text-white font-bold text-xl mb-2"><Scale className="inline w-6 h-6 text-indigo-400 mr-2" /> Versus Mode</h2>
                        <p className="text-white/60 text-sm mb-6">Scan two products to see which is healthier.</p>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input type="file" ref={fileRefA} onChange={(e) => handleImageUpload(e, (url: string) => setImgA(prev => ({ ...prev, url } as any)), (base64: string) => setImgA(prev => ({ ...prev, base64 } as any)))} className="hidden" />
                                <div onClick={() => fileRefA.current?.click()} className="bg-white/5 border border-dashed border-white/30 h-32 rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden">
                                    {imgA?.url ? <img src={imgA.url} className="w-full h-full object-cover opacity-60" /> : <p className="text-white/50 font-bold text-xs">Product A</p>}
                                </div>
                            </div>
                            <div className="flex items-center justify-center text-white/30 font-black italic">VS</div>
                            <div className="flex-1">
                                <input type="file" ref={fileRefB} onChange={(e) => handleImageUpload(e, (url: string) => setImgB(prev => ({ ...prev, url } as any)), (base64: string) => setImgB(prev => ({ ...prev, base64 } as any)))} className="hidden" />
                                <div onClick={() => fileRefB.current?.click()} className="bg-white/5 border border-dashed border-white/30 h-32 rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden">
                                    {imgB?.url ? <img src={imgB.url} className="w-full h-full object-cover opacity-60" /> : <p className="text-white/50 font-bold text-xs">Product B</p>}
                                </div>
                            </div>
                        </div>
                        {imgA && imgB && !compareResults && (
                            <button onClick={handleCompare} disabled={isComparing} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                                {isComparing ? <Loader2 className="animate-spin" /> : "Compare Nutrition"}
                            </button>
                        )}
                        {compareResults && (
                            <div className="bg-white/[0.08] p-6 rounded-[2rem] border border-white/20 mt-6 shadow-xl">
                                <h3 className="text-center text-white/50 text-xs font-bold uppercase tracking-wider mb-2">The Winner</h3>
                                <h2 className="text-center text-3xl font-black text-emerald-400 mb-4">{compareResults.winner}</h2>
                                <p className="text-white/80 text-sm text-center mb-6">"{compareResults.reason}"</p>
                                <div className="space-y-4">
                                    {[compareResults.productA, compareResults.productB].map((prod, idx) => (
                                        <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white font-bold">{prod.name}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${prod.intensity > 50 ? 'border-rose-500 text-rose-400' : 'border-emerald-500 text-emerald-400'}`}>Score: {prod.intensity}</span>
                                            </div>
                                            <p className="text-white/50 text-[10px] uppercase">Red Flags:</p>
                                            <p className="text-white/80 text-xs">{prod.redFlags?.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setCompareResults(null); setImgA(null); setImgB(null); }} className="w-full mt-4 bg-white/10 text-white py-3 rounded-xl font-bold">New Comparison</button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="bg-white/[0.05] border border-white/10 p-6 rounded-[2rem] text-center shadow-xl">
                            <div className="w-20 h-20 bg-indigo-500/20 border-2 border-indigo-500 rounded-full mx-auto flex items-center justify-center mb-4"><User className="w-8 h-8 text-indigo-400" /></div>
                            <h2 className="text-white font-bold text-lg">{auth.currentUser?.email}</h2>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-[2rem] space-y-4 shadow-xl">
                            <h3 className="text-rose-500 font-bold mb-4">Privacy & Data</h3>
                            <button onClick={deleteAllHistory} className="w-full bg-black/40 border border-white/10 hover:border-red-500 text-white hover:text-red-500 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> Clear History</button>
                            <button onClick={handleDeleteAccount} className="w-full bg-red-600/20 border border-red-600/50 hover:bg-red-600/70 text-red-500 hover:text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"><AlertOctagon className="w-5 h-5" /> Delete Account</button>
                        </div>
                        <button onClick={() => signOut(auth)} className="w-full bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl flex justify-center gap-2"><LogOut className="w-5 h-5" /> Sign Out</button>
                    </motion.div>
                )}
            </div>

            {/* PROMINENT CENTER BOTTOM NAVIGATION */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 pb-safe z-50">
                <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center p-2 px-2">

                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'home' ? 'text-indigo-400 scale-110' : 'text-white/40'}`}>
                        <Home className="w-6 h-6" /><span className="text-[9px] font-bold">Home</span>
                    </button>

                    <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'history' ? 'text-indigo-400 scale-110' : 'text-white/40'}`}>
                        <History className="w-6 h-6" /><span className="text-[9px] font-bold">History</span>
                    </button>

                    <button onClick={() => setActiveTab('scan')} className="relative flex flex-col items-center -top-6 group z-50">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all ${activeTab === 'scan' ? 'bg-indigo-500 scale-110 border-4 border-slate-950' : 'bg-slate-800 border-4 border-slate-950 group-hover:bg-slate-700'}`}>
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                        <span className={`absolute -bottom-4 text-[10px] font-bold ${activeTab === 'scan' ? 'text-indigo-400' : 'text-white/40'}`}>Scan</span>
                    </button>

                    <button onClick={() => setActiveTab('compare')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'compare' ? 'text-indigo-400 scale-110' : 'text-white/40'}`}>
                        <Scale className="w-6 h-6" /><span className="text-[9px] font-bold">Versus</span>
                    </button>

                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'profile' ? 'text-indigo-400 scale-110' : 'text-white/40'}`}>
                        <User className="w-6 h-6" /><span className="text-[9px] font-bold">Profile</span>
                    </button>

                </div>
            </div>
            {/* ANIMATED ERROR & TUTORIAL MODAL */}
            {showErrorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-slate-900 border border-white/20 p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-full relative overflow-hidden"
                    >
                        <button onClick={() => setShowErrorModal(false)} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white/50 hover:text-white transition-colors z-10">
                            <X className="w-5 h-5" />
                        </button>````

                        <div className="text-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                                <AlertOctagon className="w-8 h-8" />
                               </div>
                            <h3 className="text-white font-bold text-xl mb-2">Analysis Failed</h3>
                            <p className="text-white/60 text-sm px-4">We couldn't read the ingredients. Take a quick photo of the ingredients list on the back of the package. Try scanning like this:</p>
                        </div>

                        {/* Minimal Vector Animation Area */}
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 h-48 flex items-center justify-center relative overflow-hidden shadow-inner mb-6">
                            <motion.div
                                animate={{ rotateY: [0, 180, 180, 0], scale: [1, 1.1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-28 bg-indigo-500/20 border-2 border-indigo-400/50 rounded-xl flex items-center justify-center absolute shadow-lg"
                            >
                                <motion.div animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col gap-2 w-full px-3">
                                    <div className="h-1.5 bg-indigo-300 rounded w-full"></div>
                                    <div className="h-1.5 bg-indigo-300 rounded w-5/6"></div>
                                    <div className="h-1.5 bg-indigo-300 rounded w-4/6"></div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                animate={{ x: [100, 0, 0, 100], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="w-24 h-36 border-[3px] border-emerald-400/80 rounded-2xl bg-slate-900/80 backdrop-blur-sm absolute flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.2)]"
                            >
                                <motion.div animate={{ y: [-40, 40, -40] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]"></motion.div>
                            </motion.div>
                        </div>

                        <button
                            onClick={() => { setShowErrorModal(false); fileInputRef.current?.click(); }}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-500 transition-all"
                        >
                            Try Scanning Again
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}