import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircleQuestion } from 'lucide-react';

export default function FAQ() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8 pt-20">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[#00f2fe] hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <MessageCircleQuestion className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h1>
                </div>

                <div className="space-y-6">

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-white font-bold text-xl mb-2">Can I rely on this for my severe food allergies?</h3>
                        <p className="text-slate-400 leading-relaxed">No. IngreData AI is an educational dictionary, not a medical safety device. While it helps translate complex chemical names into plain English, AI vision can occasionally misread a blurry or folded label. If you have a severe or life-threatening allergy, you must manually read the label yourself and consult your doctor.</p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-white font-bold text-xl mb-2">Do you save the photos I take?</h3>
                        <p className="text-slate-400 leading-relaxed">The images you upload are processed securely in real-time to extract the text. The final text summary and identified ingredients are saved to your account's private history so you can review them later, but we do not use your data for advertising.</p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-white font-bold text-xl mb-2">What if the label is in another language?</h3>
                        <p className="text-slate-400 leading-relaxed">Our underlying AI model is capable of understanding multiple global languages. However, for the most accurate definitions and translations, scanning English-language ingredient labels will yield the best results.</p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-white font-bold text-xl mb-2">How accurate is the dictionary?</h3>
                        <p className="text-slate-400 leading-relaxed">We cross-reference ingredients against broad, general-knowledge databases regarding food additives, preservatives, and emulsifiers. However, formulations change, and manufacturers use varying terms (e.g., "Natural Flavors"). We provide the standard industry definition for the term detected.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}