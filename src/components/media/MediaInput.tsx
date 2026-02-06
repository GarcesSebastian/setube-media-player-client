"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search as SearchIcon,
    Loader2,
    LayoutGrid,
    List,
    SlidersHorizontal,
    Clock,
    SortAsc,
    ChevronDown,
    ChevronUp,
    X,
    Music,
    Zap,
    PlayCircle
} from "lucide-react";
import { searchMedia, MediaResult } from "@/controllers/media.controller";
import { db } from "@/utils/database.utils";

interface MediaInputProps {
    onSelect: (item: MediaResult | any) => void;
    hasSelection: boolean;
    onReset: () => void;
}

type ViewMode = "grid" | "list";
type SortBy = "relevance" | "duration" | "title";

export default function MediaInput({ onSelect, hasSelection, onReset }: MediaInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [results, setResults] = useState<MediaResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const [sortBy, setSortBy] = useState<SortBy>("relevance");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const savedView = localStorage.getItem("setube_view_mode") as ViewMode;
        if (savedView) setViewMode(savedView);
    }, []);

    const toggleViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("setube_view_mode", mode);
    };

    useEffect(() => {
        const q = searchParams.get("q");
        if (q !== query) {
            setQuery(q || "");
            if (q) performSearch(q);
            else setResults([]);
        }
    }, [searchParams]);

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", searchTerm);
        router.replace(`?${params.toString()}`, { scroll: false });

        try {
            const data = await searchMedia(searchTerm);
            setResults(data);
            db.addSearch(searchTerm, data).catch(console.error);

            if (hasSelection) {
                onReset();
            }
        } catch (error) {
            console.error("Search error:", error);
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
        } else {
            setResults([]);
            if (!hasSelection) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("q");
                router.replace(`?${params.toString()}`, { scroll: false });
            }
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

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        setResults([]);
        onReset();
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <section className={`flex flex-col items-center justify-center px-4 md:px-6 relative z-10 transition-all duration-700 ${hasSelection ? 'pt-4 pb-4' : 'pt-6 md:pt-24 pb-8 md:pb-16'}`}>

            {!hasSelection && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 md:mb-16 max-w-3xl"
                >
                    <div className="relative inline-block mb-4">
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter">
                            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent italic">
                                SETUBE
                            </span>
                        </h1>
                        <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] -z-10" />
                    </div>
                    <p className="text-sm md:text-base text-white/50 font-medium max-w-xl mx-auto">
                        Extractor premium para videos de <span className="text-red-500 font-bold">YouTube</span>.
                        Descargas asíncronas de alta fidelidad.
                    </p>
                </motion.div>
            )}

            <div className="w-full max-w-7xl relative">
                <div className={`relative group transition-all duration-500 ${hasSelection ? 'mb-4' : 'mb-12'}`}>
                    <motion.div
                        layout
                        animate={{ scale: isFocused ? 1.01 : 1 }}
                        className="relative flex items-center transition-all duration-500"
                    >
                        <div className={`absolute left-0 transition-all duration-300 ${isFocused ? 'text-accent opacity-100' : 'text-white/40 opacity-100'}`}>
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                            ) : (
                                <SearchIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                            )}
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="¿Qué estás buscando?"
                            className={`w-full bg-transparent border-none font-medium pl-8 md:pl-12 py-3 md:py-4 text-white placeholder:text-white/10 outline-none transition-all ${hasSelection ? 'text-lg md:text-xl' : 'text-2xl md:text-4xl'}`}
                        />

                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute right-0 text-white/20 hover:text-white transition-colors p-2"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 overflow-hidden">
                            <motion.div
                                animate={{ left: isFocused ? "0%" : "-100%" }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent w-full"
                            />
                        </div>
                    </motion.div>
                </div>

                {!hasSelection && results.length === 0 && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
                        {[
                            { step: "01", title: "Busca", desc: "Introduce términos o pega el enlace directo.", icon: Zap },
                            { step: "02", title: "Selecciona", desc: "Elige entre los mejores resultados encontrados.", icon: LayoutGrid },
                            { step: "03", title: "Obtén", desc: "Exporta en alta calidad MP3 o MP4 al instante.", icon: Music }
                        ].map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="relative p-8 rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 hover:border-accent/20 transition-all group overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                            >
                                <div className="absolute -top-4 -right-4 text-8xl font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors italic leading-none select-none">
                                    {item.step}
                                </div>
                                <div className="mb-6 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {results.length > 0 && !hasSelection && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-wrap items-center justify-between gap-4 mb-8"
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showFilters ? 'bg-accent/20 border border-accent/40 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                                        }`}
                                >
                                    <SlidersHorizontal size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
                                </button>

                                <AnimatePresence>
                                    {showFilters && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10"
                                        >
                                            {[
                                                { id: "relevance", label: "Mix", icon: SortAsc },
                                                { id: "duration", label: "Reloj", icon: Clock },
                                                { id: "title", label: "A-Z", icon: SortAsc },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleSortToggle(opt.id as SortBy)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${sortBy === opt.id ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {opt.label}
                                                    {sortBy === opt.id && (
                                                        sortOrder === "desc" ? <ChevronDown size={10} className="text-accent" /> : <ChevronUp size={10} className="text-accent" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => toggleViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => toggleViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!hasSelection && results.length > 0 && (
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-20"
                                    : "flex flex-col gap-3 pb-20"
                            }
                        >
                            {sortedResults.map((item, index) => (
                                <motion.button
                                    key={item.video_id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => onSelect(item)}
                                    className={`group relative overflow-hidden transition-all duration-500 border border-white/5 bg-[#0a0a0a] shadow-2xl ${viewMode === "grid"
                                        ? "flex flex-col rounded-[2.5rem] hover:border-accent/30 hover:shadow-accent/5"
                                        : "flex items-center gap-4 p-3 rounded-2xl hover:border-accent/20"
                                        }`}
                                >
                                    <div className={`relative overflow-hidden shrink-0 ${viewMode === "list"
                                        ? 'w-32 md:w-40 aspect-video rounded-xl'
                                        : 'w-full aspect-video rounded-t-[2.5rem] md:rounded-[2.4rem] m-1 md:m-0'
                                        }`}>
                                        <img
                                            src={item.thumbnail}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
                                        />

                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-500 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                                                <PlayCircle size={28} fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10 z-10">
                                            {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    <div className={`flex-1 min-w-0 text-left ${viewMode === "grid" ? 'px-6 py-6' : 'px-2 py-1'}`}>
                                        <h3 className={`text-white font-bold leading-tight line-clamp-2 group-hover:text-accent transition-colors ${viewMode === "grid" ? 'text-base' : 'text-base'}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-white/40 text-[10px] mt-2 font-black uppercase tracking-wider truncate">
                                            {item.author.name}
                                        </p>
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
