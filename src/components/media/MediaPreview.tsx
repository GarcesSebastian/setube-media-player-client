"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Clock,
    User,
    Youtube,
    Zap,
    Share2,
    Info,
    ExternalLink
} from "lucide-react";
import { MediaInfo } from "@/controllers/media.controller";

interface MediaPreviewProps {
    info: MediaInfo;
}

export default function MediaPreview({ info }: MediaPreviewProps) {
    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 min-w-0"
                >
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-6 h-full flex flex-col gap-6">
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
                            <img
                                src={info.thumbnail}
                                alt={info.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                <Youtube className="text-red-500" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">YouTube Original</span>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
                                {info.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <User size={12} className="text-white/40" />
                                    <span className="text-[11px] font-bold text-white/60">{info.author.name}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <Clock size={12} className="text-white/40" />
                                    <span className="text-[11px] font-bold text-white/60">{formatDuration(info.duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-[400px] flex flex-col gap-6"
                >
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 h-full">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-accent">
                                <Zap size={20} fill="currentColor" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Listo para Exportar</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Opciones de Conversión</h3>
                            <p className="text-sm text-white/30 leading-relaxed">
                                Selecciona el formato y la resolución que prefieras. El proceso se realiza en tiempo real.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                                <Info size={16} className="text-white/20" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estado</span>
                                <span className="text-xs font-bold text-green-500">Disponible</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                                <Share2 size={16} className="text-white/20" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Origen</span>
                                <span className="text-xs font-bold text-white/60">YouTube</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
                            <a
                                href={info.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink size={18} className="text-white/40 group-hover:text-accent transition-colors" />
                                    <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Ver en YouTube</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
