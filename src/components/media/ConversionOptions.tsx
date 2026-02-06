"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music,
    Video,
    CheckCircle2,
    Loader2,
    DownloadCloud,
    Sparkles
} from "lucide-react";

const FORMATS = [
    { id: "mp3-320", label: "Master Audio", sub: "320kbps / MP3", quality: "high", type: "audio", icon: Music, color: "text-purple-400" },
    { id: "mp3-128", label: "Estándar Audio", sub: "128kbps / MP3", quality: "medium", type: "audio", icon: Music, color: "text-purple-300" },
    { id: "mp4-1080", label: "Ultra Video", sub: "1080p / High-Res", quality: "1080", type: "video", icon: Video, color: "text-blue-400" },
    { id: "mp4-720", label: "HD Video", sub: "720p / Smooth", quality: "720", type: "video", icon: Video, color: "text-blue-300" },
];

interface ConversionOptionsProps {
    url: string;
    title: string;
    duration: number;
    onConversionComplete?: (format: string, quality: string) => void;
}

export default function ConversionOptions({ url, title, duration, onConversionComplete }: ConversionOptionsProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");

    const handleDownload = async (id: string) => {
        if (downloadingId) return;

        setDownloadingId(id);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const downloadUrl = `${apiUrl}/media/download`;

            const format = FORMATS.find(f => f.id === id);
            if (!format) throw new Error("Formato no encontrado");

            const response = await fetch(downloadUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                    format: format.type === "audio" ? "mp3" : "mp4",
                    quality: format.quality,
                }),
            });

            if (!response.ok) throw new Error("Error en la descarga");

            const blob = await response.blob();
            const localUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = localUrl;
            const extension = format.type === "audio" ? "m4a" : "mp4";
            link.setAttribute("download", `${title}.${extension}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(localUrl);

            setCompletedIds(prev => [...prev, id]);
            onConversionComplete?.(format.type === "audio" ? "mp3" : "mp4", format.quality);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredFormats = FORMATS.filter(f => f.type === activeTab);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 pb-24">
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative">

                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="w-full lg:w-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-accent/10 rounded-xl">
                                <DownloadCloud className="text-accent" size={24} />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter italic">
                                EXPORTAR CONTENIDO
                            </h2>
                        </div>
                        <p className="text-white/30 text-xs md:text-sm font-medium line-clamp-1">Conversión master en tiempo real para {title}</p>
                    </div>

                    <div className="flex w-full lg:w-auto bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("audio")}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "audio" ? "bg-accent text-black shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]" : "text-white/40 hover:text-white"
                                }`}
                        >
                            <Music size={14} /> <span className="hidden sm:inline">Solo</span> Audio
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "video" ? "bg-accent text-black shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]" : "text-white/40 hover:text-white"
                                }`}
                        >
                            <Video size={14} /> <span className="hidden sm:inline">Video</span> Full
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {filteredFormats.map((format, index) => {
                            const isDownloading = downloadingId === format.id;
                            const isCompleted = completedIds.includes(format.id);

                            return (
                                <motion.div
                                    key={format.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div
                                        className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${isDownloading
                                            ? "bg-accent/5 border-accent/30"
                                            : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 relative z-10 mb-5 sm:mb-0">
                                            <div className={`p-4 md:p-5 rounded-[1.2rem] bg-white/5 ${format.color} group-hover:scale-110 transition-transform duration-500`}>
                                                <format.icon size={28} strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-white text-[9px] uppercase tracking-[0.2em] mb-1 opacity-40">{format.type}</h3>
                                                <h4 className="font-bold text-white text-base md:text-lg tracking-tight mb-0.5 truncate">{format.label}</h4>
                                                <p className="text-[10px] md:text-[11px] font-bold text-white/30 truncate">{format.sub}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(format.id)}
                                            disabled={isDownloading}
                                            className={`relative h-12 md:h-14 w-full sm:w-auto min-w-0 sm:min-w-[140px] rounded-2xl flex items-center justify-center gap-2 px-6 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${isCompleted
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                                : isDownloading
                                                    ? "bg-accent/10 text-accent"
                                                    : "bg-white text-black hover:scale-105 active:scale-95 shadow-xl"
                                                }`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isDownloading ? (
                                                    <motion.div key="loader" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        <span>Syncing</span>
                                                    </motion.div>
                                                ) : isCompleted ? (
                                                    <motion.div key="done" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <CheckCircle2 size={14} />
                                                        <span>Listo</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="get" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <Sparkles size={14} fill="currentColor" />
                                                        <span>Obtener</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>

                                        <div className="absolute bottom-0 left-0 h-1 bg-accent/0 group-hover:bg-accent/20 transition-all w-full" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
