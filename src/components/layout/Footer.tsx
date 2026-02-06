"use client";

import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-black/80 backdrop-blur-xl z-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-sm font-bold tracking-tighter text-white/90">SETUBE</span>
                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            © {currentYear} High fidelity media extraction
                        </p>
                    </div>
                </div>

                <Link
                    href="https://github.com/GarcesSebastian"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <Github size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:block text-xs font-bold">GitHub</span>
                </Link>
            </div>
        </footer>
    );
}
