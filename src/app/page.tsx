"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { MediaInput, MediaPreview, ConversionOptions } from "@/components/media";
import { AnimatePresence, motion } from "framer-motion";
import { MediaResult, MediaInfo, getMediaInfo } from "@/controllers/media.controller";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [selectedResult, setSelectedResult] = useState<MediaResult | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (item: MediaResult) => {
    setSelectedResult(item);
    setMediaInfo(null);
    setIsLoading(true);

    try {
      const info = await getMediaInfo(item.url);
      setMediaInfo(info);
    } catch (error) {
      console.error("Error fetching media info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative pb-32">
      <Header />

      <div className="pt-20">
        <MediaInput onSelect={handleSelect} hasSelection={!!selectedResult} />

        <AnimatePresence mode="wait">
          {isLoading && (
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

          {mediaInfo && !isLoading && (
            <motion.div
              key={mediaInfo.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <MediaPreview info={mediaInfo} />
              <ConversionOptions
                url={mediaInfo.url}
                title={mediaInfo.title}
                duration={mediaInfo.duration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
