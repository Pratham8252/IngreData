import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8 pt-20">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[#00f2fe] hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Scale className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
                </div>

                <div className="space-y-8 text-slate-400 leading-relaxed bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                    <p className="text-sm font-semibold text-slate-300">Effective Date: {new Date().toLocaleDateString()}</p>

                    <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
                        <h2 className="text-lg font-bold text-red-400 mb-2">MEDICAL DISCLAIMER (PLEASE READ CAREFULLY)</h2>
                        <p className="text-sm text-red-200/80">
                            INGREDATA AI IS AN EDUCATIONAL REFERENCE TOOL. IT IS NOT A MEDICAL DEVICE. THE CONTENT PROVIDED BY THIS SERVICE DOES NOT CONSTITUTE MEDICAL, DIETARY, OR NUTRITIONAL ADVICE. YOU MUST NOT RELY ON THIS SERVICE TO PREVENT ALLERGIC REACTIONS, ANAPHYLAXIS, OR TO MANAGE ANY MEDICAL CONDITION. ALWAYS CONSULT A QUALIFIED MEDICAL PROFESSIONAL OR DIETITIAN BEFORE MAKING HEALTH DECISIONS.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using the IngreData AI web application, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from using or accessing this site.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Accuracy of Materials</h2>
                        <p>The definitions and text extractions appearing on IngreData AI are generated using Optical Character Recognition (OCR) and Generative AI. While we strive for accuracy, the application may occasionally misread blurry text, curved packaging, or rare chemical names. IngreData AI makes no warranties, expressed or implied, regarding the absolute accuracy, reliability, or completeness of the definitions provided. Users must manually verify critical ingredient information on the physical package.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Limitations of Liability</h2>
                        <p>In no event shall IngreData AI or its creators be liable for any damages (including, without limitation, health complications, allergic reactions, or data loss) arising out of the use or inability to use the materials on the application. The user assumes 100% of the risk associated with consuming any food product scanned by this tool.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
                        <p>The IngreData AI logo, branding, custom code, UI design, and underlying architecture are protected by copyright and intellectual property laws. You may not copy, reverse-engineer, or distribute our proprietary code without explicit permission.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}