"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2, PlayCircle, User, Search, ListFilter, Download } from "lucide-react";
import { searchMedia, MediaResult } from "@/controllers/media.controller";

interface MediaInputProps {
    onSelect: (item: MediaResult) => void;
    hasSelection: boolean;
}

export default function MediaInput({ onSelect, hasSelection }: MediaInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MediaResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const skipSearchRef = useRef(false);

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        setShowResults(true);
        try {
            const data = await searchMedia(searchTerm);
            setResults(data);
        } catch (error) {
            console.error("Error de búsqueda:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (skipSearchRef.current) {
            skipSearchRef.current = false;
            return;
        }

        if (query.trim()) {
            debounceTimer.current = setTimeout(() => {
                performSearch(query);
            }, 600);
        } else {
            setResults([]);
            setShowResults(false);
        }

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemSelect = (item: MediaResult) => {
        skipSearchRef.current = true;
        onSelect(item);
        setShowResults(false);
        setResults([]);
        setQuery(item.title);
    };

    return (
        <section className={`flex flex-col items-center justify-center px-4 md:px-6 relative z-50 transition-all duration-700 ${hasSelection ? 'pt-8 pb-4' : 'pt-20 md:pt-32 pb-16 md:pb-24'}`}>
            <div className="w-full max-w-5xl relative" ref={resultsRef}>
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: isFocused ? 1.01 : 1,
                            opacity: isFocused ? 1 : 0.8
                        }}
                        className="relative flex items-center transition-all duration-500"
                    >
                        <div className={`absolute left-0 transition-all duration-300 ${isFocused ? 'text-accent opacity-100' : 'text-white/20 opacity-50'}`}>
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                            ) : (
                                <SearchIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                            )}
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => {
                                setIsFocused(true);
                                if (results.length > 0) setShowResults(true);
                            }}
                            placeholder="¿Qué estás buscando?"
                            className="w-full bg-transparent border-none text-xl md:text-3xl font-medium pl-8 md:pl-12 py-3 md:py-4 text-white placeholder:text-white/10 outline-none transition-all"
                        />

                        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 overflow-hidden">
                            <motion.div
                                animate={{ left: isFocused ? "0%" : "-100%" }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent w-full"
                            />
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showResults && (results.length > 0 || isLoading) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="absolute top-full left-0 right-0 mt-6 max-h-[350px] md:max-h-[450px] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] custom-scrollbar z-50 p-2"
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-4">
                                    <div className="relative">
                                        <Loader2 className="animate-spin text-accent" size={32} />
                                        <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Buscando contenido</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-1">
                                    {results.map((item) => (
                                        <motion.div
                                            key={item.video_id}
                                            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                                            className="flex gap-4 p-2 md:p-3 rounded-2xl cursor-pointer transition-all group items-center"
                                            onClick={() => handleItemSelect(item)}
                                        >
                                            <div className="relative w-24 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl">
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PlayCircle className="text-white" size={20} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <h4 className="text-white text-xs md:text-sm font-medium line-clamp-1 group-hover:text-accent transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5 text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                                                    <span className="truncate">{item.author.name}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!hasSelection && !showResults && results.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/5 pt-12 md:pt-16"
                        >
                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-3 text-white/80 font-bold uppercase tracking-widest text-[10px]">
                                    <Search size={14} className="text-accent" />
                                    Búsqueda
                                </div>
                                <h3 className="text-white font-medium text-sm md:text-base">Encuentra tu contenido</h3>
                                <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                                    Ingresa palabras clave, nombres de artistas o títulos de videos. Nuestro motor ofrece resultados de alta fidelidad al instante.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-3 text-white/80 font-bold uppercase tracking-widest text-[10px]">
                                    <ListFilter size={14} className="text-accent" />
                                    Selección
                                </div>
                                <h3 className="text-white font-medium text-sm md:text-base">Revisa y elige</h3>
                                <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                                    Selecciona el elemento deseado de los resultados. Previsualiza el contenido directamente en nuestro reproductor ultra rápido.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-3 text-white/80 font-bold uppercase tracking-widest text-[10px]">
                                    <Download size={14} className="text-accent" />
                                    Exportación
                                </div>
                                <h3 className="text-white font-medium text-sm md:text-base">Exportación de alta fidelidad</h3>
                                <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                                    Elige entre varios formatos de audio y video. El procesamiento multi-hilo garantiza una conversión y descarga rápida.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
