"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export default function PhotoGallery({ fotos }: { fotos: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const touchStart = useRef<number | null>(null);

  const prev = useCallback(() => {
    setSelectedIndex((i) => (i === 0 ? fotos.length - 1 : i - 1));
  }, [fotos.length]);

  const next = useCallback(() => {
    setSelectedIndex((i) => (i === fotos.length - 1 ? 0 : i + 1));
  }, [fotos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") { setLightboxOpen(false); setZoomed(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!lightboxOpen) {
      touchStart.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!lightboxOpen && touchStart.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(diff) > 60) {
        diff > 0 ? prev() : next();
      }
      touchStart.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (!fotos || fotos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div
        className="space-y-3 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          <div
            className="aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={fotos[selectedIndex]}
              alt={`${selectedIndex + 1} de ${fotos.length}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="eager"
            />

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white focus:opacity-100"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={20} className="text-gray-800" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white focus:opacity-100"
                  aria-label="Próxima foto"
                >
                  <ChevronRight size={20} className="text-gray-800" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {fotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === selectedIndex ? "bg-white w-6" : "bg-white/50 w-1.5 hover:bg-white/80"
                      }`}
                      aria-label={`Ir para foto ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              {selectedIndex + 1}/{fotos.length}
            </div>

            <div className="absolute top-3 left-3 bg-black/40 text-white/80 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">
              <ZoomIn size={16} />
            </div>
          </div>
        </div>

        {fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {fotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 w-[72px] h-[56px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === selectedIndex
                    ? "border-red-600 opacity-100 ring-1 ring-red-400"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={foto}
                  alt={`Miniatura ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => { setLightboxOpen(false); setZoomed(false); }}
        >
          <button
            onClick={() => { setLightboxOpen(false); setZoomed(false); }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
            aria-label="Fechar"
          >
            <X size={24} className="text-white" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
                aria-label="Anterior"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
                aria-label="Próximo"
              >
                <ChevronRight size={28} className="text-white" />
              </button>
            </>
          )}

          <div
            className="relative max-w-[92vw] max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
          >
            <div
              className={`overflow-hidden rounded-lg ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={fotos[selectedIndex]}
                alt={`Foto ${selectedIndex + 1} de ${fotos.length}`}
                className="max-w-[92vw] max-h-[88vh] object-contain transition-transform duration-200"
                style={zoomed ? {
                  transform: "scale(2)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                } : undefined}
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {selectedIndex + 1} / {fotos.length}
          </div>
        </div>
      )}
    </>
  );
}
