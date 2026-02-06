import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaFormats } from "@/controllers/media.controller";
import {
    Music,
    Video,
    CheckCircle2,
    Loader2,
    DownloadCloud,
    Sparkles
} from "lucide-react";

interface ConversionOptionsProps {
    url: string;
    title: string;
    duration: number;
    formats?: any[];
    onConversionComplete?: (format: string, quality: string) => void;
}

export default function ConversionOptions({ url, title, duration, formats: initialFormats, onConversionComplete }: ConversionOptionsProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"audio" | "video">("video");
    const [currentFormats, setCurrentFormats] = useState<any[]>(initialFormats || []);
    const [isSyncing, setIsSyncing] = useState(false);
    const isFetchingRef = React.useRef(false);
    const lastFetchedUrl = React.useRef<string | null>(null);

    useEffect(() => {
        if (initialFormats && initialFormats.length > 0) {
            setCurrentFormats(initialFormats);
        }

        const initialHasDynamic = (initialFormats || []).some(f => f.isDynamic === true);
        if (isFetchingRef.current || lastFetchedUrl.current === url || initialHasDynamic) {
            if (initialHasDynamic) lastFetchedUrl.current = url;
            return;
        }

        const fetchRealFormats = async () => {
            isFetchingRef.current = true;
            setIsSyncing(true);
            try {
                const data = await getMediaFormats(url);
                if (data && data.formats) {
                    setCurrentFormats(data.formats);
                    lastFetchedUrl.current = url;
                }
            } catch (error) {
                console.error("Format sync error:", error);
                lastFetchedUrl.current = null;
            } finally {
                setIsSyncing(false);
                isFetchingRef.current = false;
            }
        };

        fetchRealFormats();
    }, [url]);

    const dynamicFormats = (currentFormats || []).map(f => {
        const isAudio = f.ext === 'm4a' || f.format_id === 'high' || f.format_id === 'medium';
        return {
            id: f.format_id,
            label: f.resolution,
            sub: isAudio ? (f.format_id === 'high' ? '320kbps / MP3' : '128kbps / MP3') : `${f.resolution.split('p')[0]}p / Master Video`,
            quality: f.format_id,
            type: isAudio ? 'audio' : 'video' as "audio" | "video",
            icon: isAudio ? Music : Video,
            color: isAudio ? 'text-purple-400' : 'text-blue-400',
            isDynamic: f.isDynamic ?? false
        };
    });

    const handleDownload = async (id: string, type: "audio" | "video", quality: string) => {
        if (downloadingId) return;
        setDownloadingId(id);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const response = await fetch(`${apiUrl}/media/download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, format: type === "audio" ? "mp3" : "mp4", quality }),
            });
            if (!response.ok) throw new Error("Error en la descarga");
            const blob = await response.blob();
            const localUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = localUrl;
            link.setAttribute("download", `${title}.${type === "audio" ? "mp3" : "mp4"}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(localUrl);
            setCompletedIds(prev => [...prev, id]);
            onConversionComplete?.(type === "audio" ? "mp3" : "mp4", quality);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setDownloadingId(null);
        }
    };

    const isVideo = activeTab === 'video';
    const tabFormats = dynamicFormats.filter(f => f.type === activeTab);
    const baseFormat = tabFormats[0];
    const discoveredFormats = tabFormats.slice(1);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-24">
            <div className="bg-[#0c0c0c]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-5 md:p-12 overflow-hidden relative shadow-2xl">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12 relative z-10">
                    <div className="w-full lg:w-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-accent/10 rounded-xl">
                                <DownloadCloud className="text-accent" size={20} />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter italic uppercase">Exportar Contenido</h2>
                        </div>
                        <p className="text-white/30 text-[10px] md:text-sm font-medium line-clamp-1">Calidad Master en tiempo real para {title}</p>
                    </div>

                    <div className="flex w-full lg:w-auto bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("audio")}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "audio" ? "bg-accent text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            <Music size={14} /> Solo Audio
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "video" ? "bg-accent text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            <Video size={14} /> Video Full
                        </button>
                    </div>
                </div>

                <div className="space-y-12 relative z-10">
                    {baseFormat && (
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 px-2">
                                <Sparkles size={14} className="text-accent animate-pulse" />
                                <h3 className="text-[9px] md:text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Opción Recomendada</h3>
                            </div>
                            <FormatCard
                                format={baseFormat}
                                isDownloading={downloadingId === baseFormat.id}
                                isCompleted={completedIds.includes(baseFormat.id)}
                                onDownload={() => handleDownload(baseFormat.id, baseFormat.type, baseFormat.quality)}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-8 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Formatos Adicionales</h3>
                            {isSyncing && (
                                <div className="flex items-center gap-2 text-accent/80">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <AnimatePresence mode="popLayout">
                                {discoveredFormats.map((format) => (
                                    <motion.div key={format.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                        <div
                                            onClick={() => handleDownload(format.id, format.type, format.quality)}
                                            className="group cursor-pointer bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-accent/40 hover:bg-accent/5 p-5 md:p-6 rounded-[1.4rem] transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg bg-white/5 ${format.color} group-hover:scale-110 transition-transform`}>
                                                    <format.icon size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-white text-sm md:text-base tracking-tight truncate">{format.label}</h4>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest">{format.sub}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isSyncing && (
                                <div className="col-span-full py-16 md:py-20 flex flex-col items-center justify-center gap-5 bg-white/[0.01] backdrop-blur-md border border-dashed border-white/10 rounded-[2rem]">
                                    <Loader2 size={36} className="text-white animate-spin mb-1" />
                                    <div className="text-center px-4">
                                        <p className="text-sm md:text-base font-black text-white uppercase tracking-[0.2em] mb-2">
                                            {isVideo ? "Buscando calidades Master" : "Buscando audio de alta fidelidad"}
                                        </p>
                                        <p className="text-[10px] md:text-xs font-medium text-white/30 italic max-w-sm mx-auto">
                                            {isVideo
                                                ? "Estamos analizando el servidor para ofrecerte 4K, 2K y opciones premium..."
                                                : "Sincronizando con los servidores de medios para obtener el bitrate más alto..."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormatCard({ format, isDownloading, isCompleted, onDownload }: any) {
    return (
        <div
            className={`group relative flex flex-col sm:flex-row items-center justify-between p-5 md:p-8 rounded-[1.8rem] border transition-all duration-500 overflow-hidden backdrop-blur-xl ${isDownloading
                ? "bg-accent/5 border-accent/40 shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)]"
                : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
        >
            <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 relative z-10 mb-6 sm:mb-0 w-full sm:w-auto text-center sm:text-left">
                <div className={`p-4 md:p-6 rounded-[1.2rem] bg-white/5 ${format.color} group-hover:scale-110 transition-transform duration-500`}>
                    <format.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h3 className="font-black text-accent text-[9px] md:text-[11px] uppercase tracking-[0.4em] mb-1.5 opacity-80">Master Quality</h3>
                    <h4 className="font-black text-white text-xl md:text-3xl tracking-tight mb-1 truncate">{format.label}</h4>
                    <p className="text-xs md:text-base font-medium text-white/30 truncate">{format.sub}</p>
                </div>
            </div>

            <button
                onClick={onDownload}
                disabled={isDownloading}
                className={`relative h-14 md:h-18 w-full sm:w-auto min-w-[180px] md:min-w-[220px] rounded-xl flex items-center justify-center gap-3 px-8 md:px-12 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${isCompleted
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : isDownloading
                        ? "bg-accent/10 text-accent"
                        : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isDownloading ? (
                        <motion.div key="loader" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Procesando</span>
                        </motion.div>
                    ) : isCompleted ? (
                        <motion.div key="done" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CheckCircle2 size={16} />
                            <span>Completado</span>
                        </motion.div>
                    ) : (
                        <motion.div key="get" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Sparkles size={16} fill="currentColor" />
                            <span>Descargar</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
