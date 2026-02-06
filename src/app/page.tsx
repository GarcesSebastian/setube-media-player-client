"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header, Footer, HistorySidebar } from "@/components/layout";
import { MediaInput, MediaPreview, ConversionOptions } from "@/components/media";
import { AnimatePresence, motion } from "framer-motion";
import { MediaResult, MediaInfo, getMediaInfo } from "@/controllers/media.controller";
import { Loader2, ArrowLeft } from "lucide-react";
import { db } from "@/utils/database.utils";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedResult, setSelectedResult] = useState<MediaResult | any | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    db.init().catch(console.error);
  }, []);

  const fetchVideoInfo = useCallback(async (videoId: string) => {
    setIsLoading(true);
    setMediaInfo(null);
    setSelectedResult({ video_id: videoId });

    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await getMediaInfo(url);

      const combinedInfo = {
        ...info,
        video_id: videoId,
        id: info.id || videoId,
      };

      setMediaInfo(combinedInfo);
      setSelectedResult(combinedInfo);

      db.addMetadata({
        videoId: combinedInfo.id,
        url: combinedInfo.url,
        title: combinedInfo.title,
        duration: combinedInfo.duration,
        thumbnail: combinedInfo.thumbnail,
        author: combinedInfo.author,
      }).catch(console.error);
    } catch (error) {
      console.error("Error fetching video info from URL:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const v = searchParams.get("v");
    if (v && (!selectedResult || selectedResult.video_id !== v)) {
      fetchVideoInfo(v);
    } else if (!v && selectedResult) {
      setSelectedResult(null);
      setMediaInfo(null);
    }
  }, [searchParams, fetchVideoInfo]);

  const handleSelect = (item: MediaResult | any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("v", item.video_id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("v");
    router.replace(`?${params.toString()}`, { scroll: false });
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

  const handleFullReset = () => {
    setSelectedResult(null);
    setMediaInfo(null);
    router.replace("/", { scroll: false });
  };

  return (
    <main className="min-h-screen relative bg-[#050505] text-white">
      <Header
        onHistoryClick={() => setIsHistoryOpen(true)}
        onLogoClick={handleFullReset}
      />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <div className="pt-20">
        <MediaInput
          onSelect={handleSelect}
          hasSelection={!!selectedResult}
          onReset={handleReset}
        />

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-24 gap-6"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center">
                  <Loader2 className="text-accent animate-spin w-8 h-8" />
                </div>
                <div className="absolute inset-0 blur-2xl bg-accent/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
                Sincronizando Metadata Maestro
              </p>
            </motion.div>
          )}

          {mediaInfo && !isLoading && (
            <motion.div
              key="process-flow"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="pb-32"
            >
              <div className="max-w-6xl mx-auto px-4 mb-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-white/20 hover:text-white transition-colors group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nueva Búsqueda</span>
                </button>
              </div>

              <MediaPreview info={mediaInfo} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ConversionOptions
                  url={mediaInfo.url}
                  title={mediaInfo.title}
                  duration={mediaInfo.duration}
                  onConversionComplete={handleConversionComplete}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
