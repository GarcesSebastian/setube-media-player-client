"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
    const currentYear = new Date().getFullYear();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5"
        >
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-bold tracking-tighter text-white/90">SETUBE</Link>
                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            © {currentYear} Extracción de medios de alta fidelidad
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-8">
                    <a href="/history" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Historial</a>
                </nav>
            </nav>
        </motion.header>
    );
}
