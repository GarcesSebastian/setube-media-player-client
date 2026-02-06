"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Settings,
    Maximize,
    Minimize,
    Loader2,
    AlertCircle,
    Highlighter,
    Subtitles
} from "lucide-react";
import { getMediaInfo, MediaInfo } from "@/controllers/media.controller";

interface VideoPlayerProps {
    url: string;
    initialTitle?: string;
}

export default function VideoPlayer({ url, initialTitle = "Contenido de Video Original" }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHoveringVolume, setIsHoveringVolume] = useState(false);

    const [isMetadataLoading, setIsMetadataLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showCenterIcon, setShowCenterIcon] = useState(false);
    const [centerIconType, setCenterIconType] = useState<"play" | "pause">("play");
    const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    const isLoading = isMetadataLoading || isBuffering;

    useEffect(() => {
        const fetchMetadata = async () => {
            setIsMetadataLoading(true);
            setError(null);
            try {
                const info = await getMediaInfo(url);
                setMediaInfo(info);
                if (info.duration) setDuration(info.duration);
            } catch (err) {
                console.error("Error fetching metadata:", err);
            } finally {
                setIsMetadataLoading(false);
            }
        };

        if (url) {
            fetchMetadata();
        }
    }, [url]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };
        const handleEnded = () => setIsPlaying(false);
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);
        const handleError = () => {
            setError("Error al cargar la fuente de video");
            setIsBuffering(false);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("error", handleError);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("error", handleError);
        };
    }, [url]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        if (isSettingsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSettingsOpen]);

    const triggerCenterIcon = (type: "play" | "pause") => {
        setCenterIconType(type);
        setShowCenterIcon(true);
        setTimeout(() => setShowCenterIcon(false), 500);
    };

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                triggerCenterIcon("play");
            } else {
                videoRef.current.play();
                triggerCenterIcon("pause");
            }
            setIsPlaying(!isPlaying);
            setIsSettingsOpen(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
        }
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            playerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying && !isSettingsOpen) setShowControls(false);
        }, 2500);
    };

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setError(null);
        setIsMetadataLoading(true);
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    const changePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setIsSettingsOpen(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl mx-auto mb-12 px-2 md:px-4 shadow-2xl relative z-10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                if (isPlaying && !isSettingsOpen) setShowControls(false);
            }}
        >
            <div
                ref={playerRef}
                className="relative aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden group border border-white/10"
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src={!isMetadataLoading ? url : undefined}
                    className="w-full h-full object-contain cursor-pointer"
                    playsInline
                />

                <AnimatePresence>
                    {showCenterIcon && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            exit={{ scale: 1.3, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                        >
                            <div className="bg-black/40 backdrop-blur-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-full border border-white/20">
                                {centerIconType === "play" ? (
                                    <Play className="text-white fill-white ml-1 w-8 h-8 md:w-10 md:h-10" />
                                ) : (
                                    <Pause className="text-white fill-white w-8 h-8 md:w-10 md:h-10" />
                                )}
                            </div>
                        </motion.div>
                    )}

                    {isLoading && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Loader2 className="text-accent animate-spin w-8 h-8 md:w-12 md:h-12" />
                                    <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
                                    {isMetadataLoading ? "Obteniendo metadatos..." : "Cargando video..."}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-40 px-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AlertCircle size={40} className="text-red-500 mb-4" />
                            <p className="text-white font-medium text-sm md:text-base">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                            >
                                Reintentar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showControls && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 flex flex-col justify-between p-3 md:p-6 select-none z-50 px-4"
                            onClick={togglePlay}
                        >
                            <div className="flex justify-between items-start" onClick={(e) => e.stopPropagation()}>
                                <motion.h3
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-sm md:text-lg font-bold text-white drop-shadow-lg line-clamp-1 pr-4"
                                >
                                    {mediaInfo?.title || initialTitle}
                                </motion.h3>

                                <div className="relative" ref={settingsRef}>
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className={`text-white/70 hover:text-white transition-all ${isSettingsOpen ? 'rotate-90 text-white' : ''}`}
                                    >
                                        <Settings className="w-5 h-5 md:w-5.5 md:h-5.5" />
                                    </button>

                                    <AnimatePresence>
                                        {isSettingsOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute right-0 top-10 w-48 md:w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-widest">Ajustes</div>
                                                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-[12px] md:text-sm">
                                                    <Highlighter className="w-4 h-4" /> Calidad <span className="ml-auto text-[10px] text-gray-500">Auto (1080p)</span>
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-[12px] md:text-sm">
                                                    <Subtitles className="w-4 h-4" /> Subtítulos <span className="ml-auto text-[10px] text-gray-500">No</span>
                                                </button>
                                                <div className="h-px bg-white/5 my-1" />
                                                <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-widest">Velocidad</div>
                                                <div className="grid grid-cols-4 gap-1 p-1">
                                                    {[0.5, 1, 1.5, 2].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={() => changePlaybackRate(rate)}
                                                            className={`py-1 text-[10px] md:text-xs rounded transition-colors ${playbackRate === rate ? 'bg-accent text-white' : 'hover:bg-white/10 text-gray-400'}`}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="space-y-3 md:space-y-4" onClick={(e) => e.stopPropagation()}>
                                <div className="relative group/timeline w-full h-1 md:h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-accent z-10 transition-all duration-100"
                                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                </div>

                                <div className="flex items-center justify-between pointer-events-auto">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <button
                                            onClick={togglePlay}
                                            className="text-white hover:scale-110 active:scale-95 transition-all"
                                        >
                                            {isPlaying ? (
                                                <Pause fill="white" className="w-5 h-5 md:w-6 md:h-6" />
                                            ) : (
                                                <Play fill="white" className="w-5 h-5 md:w-6 md:h-6" />
                                            )}
                                        </button>

                                        <div
                                            className="hidden sm:flex items-center gap-2 relative"
                                            onMouseEnter={() => setIsHoveringVolume(true)}
                                            onMouseLeave={() => setIsHoveringVolume(false)}
                                        >
                                            <div onClick={toggleMute} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                                                {isMuted || volume === 0 ? (
                                                    <VolumeX className="w-5 h-5 md:w-5.5 md:h-5.5" />
                                                ) : (
                                                    <Volume2 className="w-5 h-5 md:w-5.5 md:h-5.5" />
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {isHoveringVolume && (
                                                    <motion.div
                                                        initial={{ width: 0, opacity: 0 }}
                                                        animate={{ width: 80, opacity: 1 }}
                                                        exit={{ width: 0, opacity: 0 }}
                                                        className="h-1 bg-white/20 rounded-full relative overflow-hidden"
                                                    >
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-white"
                                                            style={{ width: `${volume * 100}%` }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={volume}
                                                            onChange={handleVolumeChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <span className="text-[10px] md:text-sm font-mono text-white/80 tracking-tighter">
                                            {formatTime(currentTime)} <span className="text-white/30 text-[9px] md:text-xs">/</span> {formatTime(duration)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-5">
                                        <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-all hover:scale-110">
                                            {isFullscreen ? (
                                                <Minimize className="w-5 h-5 md:w-5.5 md:h-5.5" />
                                            ) : (
                                                <Maximize className="w-5 h-5 md:w-5.5 md:h-5.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
