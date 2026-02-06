"use client";

import { useState, useEffect } from "react";
import { Header, Footer, HistorySidebar } from "@/components/layout";
import { MediaInput, MediaPreview, ConversionOptions } from "@/components/media";
import { AnimatePresence, motion } from "framer-motion";
import { MediaResult, MediaInfo, getMediaInfo } from "@/controllers/media.controller";
import { Loader2 } from "lucide-react";
import { db } from "@/utils/database.utils";

export default function Home() {
  const [selectedResult, setSelectedResult] = useState<MediaResult | any | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    db.init().catch(console.error);
  }, []);

  const handleSelect = async (item: MediaResult | any) => {
    setSelectedResult(item);
    setMediaInfo(null);
    setIsLoading(true);

    try {
      const info = await getMediaInfo(item.url);

      const combinedInfo = {
        ...item,
        ...info,
        id: info.id || item.video_id,
        author: info.author || item.author
      };

      setMediaInfo(combinedInfo);

      db.addMetadata({
        videoId: combinedInfo.id,
        url: combinedInfo.url,
        title: combinedInfo.title,
        duration: combinedInfo.duration,
        thumbnail: combinedInfo.thumbnail,
        author: combinedInfo.author,
      }).catch(console.error);
    } catch (error) {
      console.error("Error fetching media info:", error);
      if (item.video_id) {
        setMediaInfo({
          ...item,
          id: item.video_id,
          formats: [
            { format_id: "high", ext: "m4a", resolution: "High (256kbps)" },
            { format_id: "1080", ext: "mp4", resolution: "1080p" }
          ]
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversionComplete = (format: string, quality: string) => {
    if (!mediaInfo) return;
    db.addConversion({
      videoId: mediaInfo.id,
      title: mediaInfo.title,
      format,
      quality,
    }).catch(console.error);
  };

  return (
    <main className="min-h-screen relative bg-[#050505] text-white">
      <Header onHistoryClick={() => setIsHistoryOpen(true)} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <div className="pt-20">
        <MediaInput onSelect={handleSelect} hasSelection={!!selectedResult} />

        <AnimatePresence mode="wait">
          {isLoading && !mediaInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <Loader2 className="text-accent animate-spin w-12 h-12" />
                <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 animate-pulse">
                Procesando metadatos...
              </p>
            </motion.div>
          )}

          {mediaInfo && (
            <motion.div
              key={mediaInfo.id}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pb-32"
            >
              <MediaPreview info={mediaInfo} />
              <ConversionOptions
                url={mediaInfo.url}
                title={mediaInfo.title}
                duration={mediaInfo.duration}
                onConversionComplete={handleConversionComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
