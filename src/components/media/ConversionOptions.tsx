"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music,
    Video,
    CheckCircle2,
    Loader2,
    ArrowDownToLine,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui";

const FORMATS = [
    { id: "mp3-320", label: "MP3 Maestro", quality: "high", type: "audio", icon: Music, color: "text-purple-400" },
    { id: "mp3-128", label: "MP3 Estándar", quality: "medium", type: "audio", icon: Music, color: "text-purple-300" },
    { id: "mp4-1080", label: "Video Ultra", quality: "1080", type: "video", icon: Video, color: "text-blue-400" },
    { id: "mp4-720", label: "Video HD", quality: "720", type: "video", icon: Video, color: "text-blue-300" },
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
        <div className="w-full max-w-5xl mx-auto px-4 pb-24">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 border-t border-white/5 pt-12">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ArrowDownToLine className="text-accent" size={24} />
                        Opciones de Exportación
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Descarga sincronizada de alta fidelidad.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab("audio")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "audio" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"
                            }`}
                    >
                        <Music size={16} /> Audio
                    </button>
                    <button
                        onClick={() => setActiveTab("video")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "video" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"
                            }`}
                    >
                        <Video size={16} /> Video
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFormats.map((format, index) => {
                    const isDownloading = downloadingId === format.id;
                    const isCompleted = completedIds.includes(format.id);

                    return (
                        <motion.div
                            key={format.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div
                                className={`relative group flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${isDownloading
                                    ? "bg-white/5 border-accent/20"
                                    : "bg-[#0c0c0c] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                    }`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl bg-white/5 ${format.color}`}>
                                        <format.icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg tracking-tight">{format.label}</h3>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleDownload(format.id)}
                                    disabled={isDownloading}
                                    variant={isCompleted ? "ghost" : "primary"}
                                    className={`min-w-[140px] h-12 rounded-2xl overflow-hidden relative ${isCompleted ? "text-green-400 group-hover:bg-green-400/5 transition-colors" : ""
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isDownloading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Loader2 size={18} className="animate-spin text-accent" />
                                                <span className="text-accent">Descargando</span>
                                            </motion.div>
                                        ) : isCompleted ? (
                                            <motion.div
                                                key="ready"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={18} />
                                                <span>Completado</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="download"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Zap size={18} fill="currentColor" />
                                                <span>Obtener</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
