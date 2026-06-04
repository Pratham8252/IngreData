import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8 pt-20">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[#00f2fe] hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#00f2fe]/10 flex items-center justify-center border border-[#00f2fe]/20">
                        <Shield className="w-6 h-6 text-[#00f2fe]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
                </div>

                <div className="space-y-8 text-slate-400 leading-relaxed bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                    <p className="text-sm font-semibold text-slate-300">Effective Date: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p>We strictly limit the data we collect to ensure your privacy. When you use IngreData AI, we process the images you capture using your device's camera or upload from your gallery. We only extract the text related to food ingredients to provide dictionary definitions. We also collect basic account information (such as your email address) when you register via our authentication provider.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Data</h2>
                        <p>Your uploaded images and extracted text are used solely for the purpose of cross-referencing ingredient databases and returning educational definitions to your screen. We allow you to save your past scans to a personal history log tied to your account for your own convenience.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. No Medical Data Collection (Non-HIPAA)</h2>
                        <p>IngreData AI is not a medical application. We do not ask for, collect, store, or process Personal Health Information (PHI) such as medical records, specific allergy diagnoses, or biometric data. Do not upload or input personal medical data into our platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing & Security</h2>
                        <p>We do not sell, rent, or trade your personal information or scan history to third-party data brokers or marketing agencies. Your data is stored securely using industry-standard cloud infrastructure (Firebase) with secure rules ensuring only you can access your personal scan history.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
                        <p>If you have any questions regarding how we handle your data, please contact our support team at <a href="mailto:support@ingredataai.in" className="text-[#00f2fe] hover:underline">support@ingredataai.in</a>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}