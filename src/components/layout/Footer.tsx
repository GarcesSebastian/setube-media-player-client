"use client";

import Link from "next/link";
import { Github, Twitter, Disc as Discord } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-black/60 backdrop-blur-xl z-[100]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <span className="text-sm font-bold tracking-tighter text-white/90">SETUBE</span>
                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            © {currentYear} High fidelity media extraction
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-5">
                        <Link href="#" className="text-white/30 hover:text-accent transition-colors">
                            <Twitter size={16} />
                        </Link>
                        <Link href="#" className="text-white/30 hover:text-accent transition-colors">
                            <Github size={16} />
                        </Link>
                        <Link href="#" className="text-white/30 hover:text-accent transition-colors">
                            <Discord size={16} />
                        </Link>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 border-l border-white/10 pl-6">
                        <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
