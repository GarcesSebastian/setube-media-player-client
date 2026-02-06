"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, User, ExternalLink, Youtube } from "lucide-react";
import { MediaInfo } from "@/controllers/media.controller";

interface MediaPreviewProps {
    info: MediaInfo;
}

export default function MediaPreview({ info }: MediaPreviewProps) {
    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mb-12">
            <div className="relative group rounded-3xl overflow-hidden bg-[#0c0c0c] border border-white/5 shadow-2xl">
                <div
                    className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none"
                    style={{
                        backgroundImage: `url(${info.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 p-6 md:p-10">
                    <div className="w-full md:w-1/3 shrink-0">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src={info.thumbnail}
                                alt={info.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                                <Clock size={12} className="text-accent" />
                                <span className="text-[10px] font-bold text-white/90">{formatDuration(info.duration)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-2 py-1 rounded bg-accent/10 border border-accent/20">
                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Metadata Lista</span>
                            </div>
                            <Youtube size={16} className="text-white/20" />
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                            {info.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/40">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <User size={14} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Creador</p>
                                    <p className="text-sm font-bold text-white/70">{info.author.name}</p>
                                </div>
                            </div>

                            <div className="h-8 w-px bg-white/5 hidden md:block" />

                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <ExternalLink size={14} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Fuente</p>
                                    <a
                                        href={info.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-white/70 hover:text-accent transition-colors underline decoration-white/10 underline-offset-4"
                                    >
                                        Ver en YouTube
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 h-px w-full bg-gradient-to-r from-accent/50 via-accent/5 to-transparent relative">
                            <div className="absolute -top-[1.5px] left-0 w-1 h-1 rounded-full bg-accent shadow-[0_0_10px_#ff0000]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
