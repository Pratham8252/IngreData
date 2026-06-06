import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, BookOpen, BookText, ChevronRight, HelpCircle, Mail, FileText, Zap, ShieldCheck, Database } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-[#00f2fe] selection:text-black overflow-x-hidden">

            {/* --- HEADER --- */}
            <nav className="w-full absolute top-0 z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" alt="IngreData Logo" className="w-8 h-8 rounded-md object-contain" />
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-white tracking-tight">IngreData</span>
                        {/* Glowing AI Badge */}
                        <div className="relative group flex items-center">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#007bff] to-[#42f5c2] rounded flex blur opacity-40"></div>
                            <span className="relative px-2 py-0.5 bg-slate-900 rounded-md text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#42f5c2] flex items-center gap-1 border border-slate-700/50 uppercase tracking-wider">
                                <span className="text-[10px]">✨</span> AI
                            </span>
                        </div>
                    </div>
                </div>
                <Link to="/app">
                    <button className="px-6 py-2 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors">
                        Login
                    </button>
                </Link>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-24 flex flex-col items-center justify-center text-center px-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full mix-blend-screen filter blur-[150px] opacity-30 bg-indigo-600 pointer-events-none" />
                <div className="absolute top-20 right-0 w-96 h-96 rounded-full mix-blend-screen filter blur-[120px] opacity-20 bg-[#00f2fe] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="z-10 flex flex-col items-center max-w-4xl"
                >
                    <div className="mb-6 px-4 py-1.5 rounded-full border border-[#00f2fe]/30 bg-[#00f2fe]/10 text-[#00f2fe] text-xs font-bold tracking-widest uppercase animate-pulse shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                        The Ultimate Ingredient Dictionary
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Decode Complex <br className="hidden md:block" /> Labels <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42f5c2] to-[#007bff]">Instantly.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                        IngreData AI is an educational reference tool. Snap a photo of any food label to instantly translate complicated chemical names and manufacturing additives into simple, plain English definitions.
                    </p>
                    <Link to="/app">
                        <button className="group px-8 py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#007bff] to-[#42f5c2] shadow-[0_0_30px_rgba(66,245,194,0.3)] hover:shadow-[0_0_50px_rgba(66,245,194,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                            Open Dictionary <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </motion.div>
            </section>

            {/* --- NEW: CORE FEATURES GRID --- */}
            <section className="py-16 max-w-6xl mx-auto px-6 relative z-10 border-t border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                        <Zap className="w-8 h-8 text-[#00f2fe] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Lightning Fast Vision</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Advanced OCR technology reads crinkled, curved, or small text on packaging in milliseconds without manual typing.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                        <Database className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Extensive Knowledge</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Cross-references thousands of chemical additives, emulsifiers, and preservatives with established scientific definitions.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                        <ShieldCheck className="w-8 h-8 text-[#42f5c2] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Unbiased & Educational</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Strictly a reference tool. We provide the definitions; you make the empowered choices for your lifestyle.</p>
                    </motion.div>
                </div>
            </section>

            {/* --- HOW IT WORKS (TUTORIAL) --- */}
            <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">How It Works</h2>
                    <p className="mt-4 text-slate-400 text-lg">Three simple steps to look up what is in your food.</p>
                </div>
                <div className="flex flex-col gap-32">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="md:w-1/2 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Scan className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">1. Snap the Label</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">Take a quick photo of the ingredients list on the back of any package. Our vision model reads the text instantly, saving you from manually typing out long, unpronounceable chemical names.</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:w-1/2 flex justify-center">
                            <div className="w-[280px] h-[580px] rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-[0_0_60px_rgba(99,102,241,0.2)] relative overflow-hidden flex flex-col items-center justify-center">
                                <div className="absolute top-0 w-1/2 h-6 bg-slate-800 rounded-b-xl" />
                                <Scan className="w-20 h-20 text-indigo-500/50 animate-pulse" />
                                <p className="mt-4 font-semibold text-slate-500">Camera Viewfinder</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="md:w-1/2 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#00f2fe]/20 flex items-center justify-center border border-[#00f2fe]/30">
                                <BookOpen className="w-7 h-7 text-[#00f2fe]" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">2. Dictionary Lookup</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">The app acts as an automated encyclopedia. It cross-references every identified additive and preservative against public databases to find its standard definition and primary function.</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:w-1/2 flex justify-center">
                            <div className="w-[280px] h-[580px] rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-[0_0_60px_rgba(0,242,254,0.15)] relative overflow-hidden flex flex-col items-center justify-center">
                                <div className="absolute top-0 w-1/2 h-6 bg-slate-800 rounded-b-xl" />
                                <div className="w-16 h-16 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin" />
                                <p className="mt-6 font-semibold text-[#00f2fe]">Looking up definitions...</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="md:w-1/2 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <BookText className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">3. Read the Facts</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">Receive a clear, unbiased summary of what each ingredient actually is. By translating industry jargon into everyday language, you gain the knowledge to make informed dietary choices.</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:w-1/2 flex justify-center">
                            <div className="w-[280px] h-[580px] rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col p-6 pt-12">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-slate-800 rounded-b-xl" />
                                <div className="w-full h-24 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4 p-4">
                                    <div className="w-1/2 h-4 bg-slate-600 rounded mb-2" />
                                    <div className="w-3/4 h-3 bg-slate-700 rounded" />
                                </div>
                                <div className="w-full h-32 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                                    <div className="w-1/3 h-4 bg-slate-600 rounded mb-2" />
                                    <div className="w-full h-3 bg-slate-700 rounded mb-2" />
                                    <div className="w-4/5 h-3 bg-slate-700 rounded" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER & HELP SECTION --- */}
            <footer className="border-t border-slate-800 bg-slate-950/50 pt-16 pb-8 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/favicon.png" alt="IngreData Logo" className="w-6 h-6 rounded object-contain grayscale" />
                            <span className="text-xl font-bold text-white">IngreData AI</span>
                        </div>
                        <p className="text-slate-500 text-sm">An educational reference tool for translating complex food ingredients into plain language.</p>
                        <div className="p-4 mt-2 bg-slate-900 border border-slate-700 rounded-lg">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-slate-200">Legal Disclaimer:</strong> IngreData AI is strictly an educational dictionary and reference tool. It does not provide medical advice, diagnosis, or dietary recommendations. Always consult with a qualified healthcare professional regarding allergies, dietary needs, or health conditions.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Reference Guide</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link to="/how-to-scan" className="hover:text-[#00f2fe] cursor-pointer transition-colors">How to use the scanner</Link></li>
                            <li><Link to="/faq" className="hover:text-[#00f2fe] cursor-pointer transition-colors">Frequently Asked Questions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Legal & Contact</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link to="/privacy-policy" className="hover:text-[#00f2fe] cursor-pointer transition-colors flex items-center gap-2"><FileText className="w-3 h-3" /> Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[#00f2fe] cursor-pointer transition-colors flex items-center gap-2"><FileText className="w-3 h-3" /> Terms of Service</Link></li>

                            <li className="mt-6">
                                <a href="mailto:support@ingredataai.in" className="inline-block px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-[#00f2fe] hover:border-[#00f2fe]/50 transition-all font-mono text-sm">
                                    support@ingredataai.in
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto border-t border-slate-800 pt-8 flex flex-col items-center justify-center gap-3 text-slate-600 text-sm text-center">
          <span>&copy; {new Date().getFullYear()} IngreData AI. All rights reserved.</span>
          <span className="flex items-center gap-2 font-medium">
            Powered by 
            <span className="relative group flex items-center cursor-default">
              {/* The glowing aura behind the text */}
              <span className="absolute -inset-1 bg-[linear-gradient(to_right,#EA4335,#FBBC05,#34A853,#4285F4)] blur opacity-40 group-hover:opacity-70 transition duration-500 rounded-lg"></span>
              
              {/* The Google Gemini text in classic Google colors */}
              <span className="relative text-transparent bg-clip-text bg-[linear-gradient(to_right,#EA4335,#FBBC05,#34A853,#4285F4)] font-extrabold tracking-wide drop-shadow-sm pr-1">
                Google Gemini
              </span>

              {/* The Authentic Gemini Star SVG Logo */}
              <svg className="w-5 h-5 relative z-10 animate-pulse drop-shadow-[0_0_10px_rgba(141,84,255,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="url(#gemini-logo-grad)"/>
                <defs>
                  {/* The official cosmic Blue -> Purple -> Pink -> Peach gradient */}
                  <linearGradient id="gemini-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2b66ff"/>
                    <stop offset="33%" stopColor="#8d54ff"/>
                    <stop offset="66%" stopColor="#ff708d"/>
                    <stop offset="100%" stopColor="#ffc187"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </span>
        </div>
            </footer>
        </div>
    );
}