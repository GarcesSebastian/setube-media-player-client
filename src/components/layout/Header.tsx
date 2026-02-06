"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { History } from "lucide-react";

interface HeaderProps {
    onHistoryClick: () => void;
}

export default function Header({ onHistoryClick }: HeaderProps) {
    const currentYear = new Date().getFullYear();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10"
        >
            <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/" className="text-lg md:text-xl font-black tracking-tighter text-white">
                        SETUBE
                    </Link>
                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            © {currentYear} Extracción de medios de alta fidelidad
                        </p>
                    </div>
                </div>

                <button
                    onClick={onHistoryClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                    <History size={18} className="text-white/60 group-hover:text-white transition-colors" />
                    <span className="hidden md:block text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                        Historial
                    </span>
                </button>
            </nav>
        </motion.header>
    );
}
