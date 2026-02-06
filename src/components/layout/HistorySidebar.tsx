"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Search, Video, Music, Clock, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, SearchHistory, MediaMetadata, ConversionHistory } from "@/utils/database.utils";

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"searches" | "metadata" | "conversions">("searches");
    const [searches, setSearches] = useState<SearchHistory[]>([]);
    const [metadata, setMetadata] = useState<MediaMetadata[]>([]);
    const [conversions, setConversions] = useState<ConversionHistory[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, activeTab]);

    const loadData = async () => {
        try {
            if (activeTab === "searches") {
                const data = await db.getSearches(50);
                setSearches(data);
            } else if (activeTab === "metadata") {
                const data = await db.getMetadata(50);
                setMetadata(data);
            } else {
                const data = await db.getConversions(50);
                setConversions(data);
            }
        } catch (error) {
            console.error("Error loading history:", error);
        }
    };

    const handleJumpToSearch = (query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", query);
        params.delete("v"); // Reset video selection
        router.push(`?${params.toString()}`);
        onClose();
    };

    const handleJumpToVideo = (videoId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("v", videoId);
        router.push(`?${params.toString()}`);
        onClose();
    };

    const handleDeleteSearch = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await db.deleteSearch(id);
        loadData();
    };

    const handleDeleteMetadata = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await db.deleteMetadata(id);
        loadData();
    };

    const handleDeleteConversion = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await db.deleteConversion(id);
        loadData();
    };

    const handleClearAll = async () => {
        if (activeTab === "searches") {
            await db.clearSearches();
        } else if (activeTab === "metadata") {
            await db.clearMetadata();
        } else {
            await db.clearConversions();
        }
        loadData();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Ahora";
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        return date.toLocaleDateString();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter">HISTORIAL</h2>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Actividad Reciente</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white/60" />
                            </button>
                        </div>

                        <div className="flex gap-2 p-4 border-b border-white/5">
                            {[
                                { id: "searches", icon: Search, label: "Búsquedas" },
                                { id: "metadata", icon: Video, label: "Vistos" },
                                { id: "conversions", icon: Music, label: "Descargas" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-xl border border-white/10"
                                        : "text-white/20 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === "searches" && (
                                <div className="space-y-2">
                                    {searches.length === 0 ? (
                                        <div className="text-center py-20 opacity-20"><Search size={48} className="mx-auto mb-4" /><p>Sin búsquedas</p></div>
                                    ) : (
                                        searches.map((search) => (
                                            <motion.div
                                                key={search.id}
                                                onClick={() => handleJumpToSearch(search.query)}
                                                className="group p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-accent/20 transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between gap-3 relative z-10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-bold truncate">{search.query}</p>
                                                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                                            <Clock size={10} />
                                                            {formatDate(search.timestamp)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink size={14} className="text-white/10 group-hover:text-accent transition-colors" />
                                                        <button
                                                            onClick={(e) => handleDeleteSearch(e, search.id!)}
                                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/20 transition-all"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "metadata" && (
                                <div className="space-y-2">
                                    {metadata.length === 0 ? (
                                        <div className="text-center py-20 opacity-20"><Video size={48} className="mx-auto mb-4" /><p>Sin videos vistos</p></div>
                                    ) : (
                                        metadata.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                onClick={() => handleJumpToVideo(item.videoId)}
                                                className="group p-3 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-accent/20 transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex gap-4 relative z-10">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="w-24 h-16 object-cover rounded-2xl shadow-xl"
                                                    />
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <p className="text-white text-xs font-bold line-clamp-2 leading-tight">{item.title}</p>
                                                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1">{item.author.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteMetadata(e, item.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/20 transition-all self-center"
                                                    >
                                                        <Trash2 size={14} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "conversions" && (
                                <div className="space-y-2">
                                    {conversions.length === 0 ? (
                                        <div className="text-center py-20 opacity-20"><Music size={48} className="mx-auto mb-4" /><p>Sin descargas</p></div>
                                    ) : (
                                        conversions.map((conversion) => (
                                            <motion.div
                                                key={conversion.id}
                                                onClick={() => handleJumpToVideo(conversion.videoId)}
                                                className="group p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-accent/20 transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between gap-3 relative z-10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-bold truncate">{conversion.title}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-black tracking-widest uppercase">
                                                                {conversion.format}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/40 text-[9px] font-black tracking-widest uppercase">
                                                                {conversion.quality}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteConversion(e, conversion.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 size={14} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#070707]">
                            <button
                                onClick={handleClearAll}
                                className="w-full px-4 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
                            >
                                <Trash2 size={16} />
                                Limpiar {activeTab === "searches" ? "búsquedas" : activeTab === "metadata" ? "vistos" : "descargas"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
