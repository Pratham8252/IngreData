import { Link } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';

export default function HowToScan() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8 pt-20">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[#00f2fe] hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Camera className="w-6 h-6 text-orange-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">How to Scan Properly</h1>
                </div>

                <div className="space-y-8 text-slate-400 leading-relaxed bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                    <p className="text-lg">To get the most accurate translations from our AI, the quality of your photo is incredibly important. Follow these guidelines for the best results.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">✓ Do This</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li><strong className="text-white">Flatten the package:</strong> Smooth out crinkles in wrappers before taking the photo.</li>
                                <li><strong className="text-white">Good Lighting:</strong> Ensure you are in a well-lit room or grocery store aisle.</li>
                                <li><strong className="text-white">Focus:</strong> Tap your phone screen to force the camera to focus on the small text before snapping.</li>
                                <li><strong className="text-white">Isolate:</strong> Try to fill the frame mostly with the "Ingredients:" block rather than the whole box.</li>
                            </ul>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">✕ Avoid This</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li><strong className="text-white">Heavy Glare:</strong> Shiny chip bags can reflect overhead lights, hiding words. Tilt the bag to reduce glare.</li>
                                <li><strong className="text-white">Curved Bottles:</strong> If scanning a can or bottle, take two separate pictures rather than one wildly distorted curved picture.</li>
                                <li><strong className="text-white">Blurry Hands:</strong> If the text is blurry to your own eyes in the photo, the AI will not be able to read it either.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}