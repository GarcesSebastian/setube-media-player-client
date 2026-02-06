"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Search, Video, Music, Clock } from "lucide-react";
import { db, SearchHistory, MediaMetadata, ConversionHistory } from "@/utils/database.utils";

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
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

    const handleDeleteSearch = async (id: number) => {
        await db.deleteSearch(id);
        loadData();
    };

    const handleDeleteMetadata = async (id: number) => {
        await db.deleteMetadata(id);
        loadData();
    };

    const handleDeleteConversion = async (id: number) => {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed left-0 top-0 h-full w-full md:w-[480px] bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white">Historial</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                <X size={24} className="text-white/60" />
                            </button>
                        </div>

                        <div className="flex gap-2 p-4 border-b border-white/5">
                            <button
                                onClick={() => setActiveTab("searches")}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "searches"
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Search size={16} className="inline mr-2" />
                                Búsquedas
                            </button>
                            <button
                                onClick={() => setActiveTab("metadata")}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "metadata"
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Video size={16} className="inline mr-2" />
                                Vistos
                            </button>
                            <button
                                onClick={() => setActiveTab("conversions")}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "conversions"
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Music size={16} className="inline mr-2" />
                                Descargas
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === "searches" && (
                                <div className="space-y-3">
                                    {searches.length === 0 ? (
                                        <p className="text-center text-white/40 py-12">No hay búsquedas recientes</p>
                                    ) : (
                                        searches.map((search) => (
                                            <motion.div
                                                key={search.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">{search.query}</p>
                                                        <p className="text-white/40 text-xs mt-1">
                                                            <Clock size={12} className="inline mr-1" />
                                                            {formatDate(search.timestamp)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteSearch(search.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "metadata" && (
                                <div className="space-y-3">
                                    {metadata.length === 0 ? (
                                        <p className="text-center text-white/40 py-12">No hay videos vistos</p>
                                    ) : (
                                        metadata.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                <div className="flex gap-3">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="w-24 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium line-clamp-2">{item.title}</p>
                                                        <p className="text-white/40 text-xs mt-1">{item.author.name}</p>
                                                        <p className="text-white/40 text-xs mt-1">
                                                            <Clock size={12} className="inline mr-1" />
                                                            {formatDate(item.timestamp)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMetadata(item.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all self-start"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "conversions" && (
                                <div className="space-y-3">
                                    {conversions.length === 0 ? (
                                        <p className="text-center text-white/40 py-12">No hay descargas recientes</p>
                                    ) : (
                                        conversions.map((conversion) => (
                                            <motion.div
                                                key={conversion.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">{conversion.title}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-bold">
                                                                {conversion.format.toUpperCase()}
                                                            </span>
                                                            <span className="px-2 py-1 rounded-md bg-white/10 text-white/60 text-xs font-bold">
                                                                {conversion.quality}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/40 text-xs mt-2">
                                                            <Clock size={12} className="inline mr-1" />
                                                            {formatDate(conversion.timestamp)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteConversion(conversion.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleClearAll}
                                className="w-full px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Limpiar {activeTab === "searches" ? "búsquedas" : activeTab === "metadata" ? "vistos" : "descargas"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
