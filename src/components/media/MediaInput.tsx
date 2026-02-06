"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
    Search as SearchIcon,
    Loader2,
    PlayCircle,
    LayoutGrid,
    List,
    SlidersHorizontal,
    Clock,
    SortAsc,
    ChevronDown,
    ChevronUp,
    Zap,
    Download,
    Eye
} from "lucide-react";
import { searchMedia, MediaResult } from "@/controllers/media.controller";
import { db } from "@/utils/database.utils";

interface MediaInputProps {
    onSelect: (item: MediaResult | any) => void;
    hasSelection: boolean;
}

type ViewMode = "grid" | "list";
type SortBy = "relevance" | "duration" | "title";

export default function MediaInput({ onSelect, hasSelection }: MediaInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MediaResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortBy>("relevance");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchMedia(searchTerm);
            setResults(data);
            db.addSearch(searchTerm, data).catch(console.error);
        } catch (error) {
            console.error("Error de búsqueda:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query.trim()) {
            debounceTimer.current = setTimeout(() => {
                performSearch(query);
            }, 600);
        } else if (!hasSelection) {
            setResults([]);
        }

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    const sortedResults = useMemo(() => {
        const data = [...results];
        if (sortBy === "duration") {
            data.sort((a, b) => sortOrder === "desc" ? b.duration - a.duration : a.duration - b.duration);
        } else if (sortBy === "title") {
            data.sort((a, b) => {
                const comparison = a.title.localeCompare(b.title);
                return sortOrder === "desc" ? -comparison : comparison;
            });
        }
        return data;
    }, [results, sortBy, sortOrder]);

    const handleSortToggle = (type: SortBy) => {
        if (sortBy === type) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(type);
            setSortOrder("desc");
        }
    };

    return (
        <section className={`flex flex-col items-center justify-center px-4 md:px-6 relative z-10 transition-all duration-1000 ${hasSelection ? 'pt-4 pb-4' : 'pt-6 md:pt-24 pb-8 md:pb-16'}`}>

            {!hasSelection && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12 md:mb-16 max-w-3xl"
                >
                    <div className="relative inline-block mb-6">
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="text-5xl md:text-8xl font-black tracking-tighter"
                        >
                            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent italic">
                                SETUBE
                            </span>
                        </motion.h1>
                        <div className="absolute -inset-10 bg-blue-500/10 blur-[120px] -z-10 animate-pulse" />
                    </div>
                    <p className="text-sm md:text-lg text-white/50 font-medium max-w-xl mx-auto leading-relaxed">
                        Extractor inteligente para videos de{" "}
                        <span className="bg-gradient-to-r from-red-500 via-orange-400 to-red-600 bg-clip-text text-transparent font-bold">
                            YouTube
                        </span>
                        . Calidad master en audio y video sin límites.
                    </p>
                </motion.div>
            )}

            <div className="w-full max-w-5xl relative">
                <div className="relative group mb-12">
                    <motion.div
                        animate={{
                            scale: isFocused ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative flex items-center"
                    >
                        <div className={`absolute left-0 transition-all duration-300 ${isFocused ? 'text-accent' : 'text-white/40'}`}>
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5 md:w-7 md:h-7" />
                            ) : (
                                <SearchIcon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                            )}
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="¿Qué quieres descargar hoy?"
                            className="w-full bg-transparent border-none text-2xl md:text-4xl font-bold pl-10 md:pl-16 py-4 md:py-6 text-white placeholder:text-white/10 outline-none transition-all"
                        />

                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
                            <motion.div
                                animate={{ left: isFocused ? "0%" : "-100%" }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-accent to-blue-500 w-full"
                            />
                        </div>
                    </motion.div>
                </div>

                {!hasSelection && results.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        {[
                            { icon: Zap, title: "Búsqueda Rápida", desc: "Introduce el nombre del video o artista que buscas." },
                            { icon: Eye, title: "Vista Previa", desc: "Explora los resultados y selecciona tu contenido favorito." },
                            { icon: Download, title: "Conversión Directa", desc: "Descarga en formato MP3 o MP4 con la máxima fidelidad." }
                        ].map((step, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                                    <step.icon className="text-white/40 group-hover:text-accent transition-colors" size={24} />
                                </div>
                                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                <AnimatePresence>
                    {results.length > 0 && !hasSelection && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5"
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showFilters ? 'bg-accent text-black font-bold' : 'bg-white/5 text-white/40 hover:text-white'
                                        }`}
                                >
                                    <SlidersHorizontal size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filtros</span>
                                </button>

                                {showFilters && (
                                    <div className="flex items-center gap-1.5 ml-2">
                                        {[
                                            { id: "relevance", label: "Relación", icon: SortAsc },
                                            { id: "duration", label: "Duración", icon: Clock },
                                            { id: "title", label: "Nombre A-Z", icon: SortAsc },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleSortToggle(opt.id as SortBy)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === opt.id ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {opt.label}
                                                {sortBy === opt.id && (
                                                    sortOrder === "desc" ? <ChevronDown size={12} className="text-accent" /> : <ChevronUp size={12} className="text-accent" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-accent/20 text-accent' : 'text-white/20 hover:text-white'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? 'bg-accent/20 text-accent' : 'text-white/20 hover:text-white'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <LayoutGroup id="results-group">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {!hasSelection && results.length > 0 && (
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32"
                                        : "flex flex-col gap-4 pb-32"
                                }
                            >
                                {sortedResults.map((item, index) => (
                                    <motion.button
                                        layout
                                        key={item.video_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02, duration: 0.5 }}
                                        onClick={() => onSelect(item)}
                                        className={`group relative overflow-hidden transition-all duration-500 border border-white/5 bg-[#080808] hover:bg-[#0c0c0c] hover:border-white/10 ${viewMode === "grid"
                                            ? "flex flex-col rounded-[2rem]"
                                            : "flex items-center gap-6 p-4 rounded-[1.5rem]"
                                            }`}
                                    >
                                        <motion.div
                                            layout
                                            className={`relative overflow-hidden shrink-0 ${viewMode === "list"
                                                ? 'w-40 md:w-56 aspect-video rounded-2xl'
                                                : 'w-full aspect-video rounded-t-[2rem]'
                                                }`}
                                        >
                                            <img
                                                src={item.thumbnail}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[0.16, 1, 0.3, 1]"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />

                                            <div className="absolute inset-0 flex items-center justify-center bg-accent/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                    <PlayCircle size={32} fill="currentColor" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-xl rounded-lg text-[10px] font-black text-white border border-white/10 shadow-xl">
                                                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                                            </div>
                                        </motion.div>

                                        <motion.div layout className={`flex-1 min-w-0 text-left ${viewMode === "grid" ? 'p-6 pb-8' : 'pr-6'}`}>
                                            <h3 className={`text-white font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-2 ${viewMode === "grid" ? 'text-base' : 'text-lg'}`}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                                                    Author
                                                </div>
                                                <p className="text-white/30 text-[10px] font-bold truncate group-hover:text-white/60 transition-colors">
                                                    {item.author.name}
                                                </p>
                                            </div>
                                        </motion.div>

                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </LayoutGroup>
            </div>
        </section>
    );
}
