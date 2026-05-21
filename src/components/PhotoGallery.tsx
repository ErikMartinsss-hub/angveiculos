"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PhotoGallery({ fotos }: { fotos: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const prev = () => setSelectedIndex((i) => (i === 0 ? fotos.length - 1 : i - 1));
  const next = () => setSelectedIndex((i) => (i === fotos.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="space-y-3">
        <div
          className="aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={fotos[selectedIndex]}
            alt="Foto do veículo"
            className="w-full h-full object-cover"
          />

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
              >
                <ChevronLeft size={20} className="text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
              >
                <ChevronRight size={20} className="text-gray-800" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {fotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === selectedIndex ? "bg-white w-6" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg">
            {selectedIndex + 1}/{fotos.length}
          </div>
        </div>

        {fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {fotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === selectedIndex
                    ? "border-red-600 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={foto}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
          >
            <X size={24} className="text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>

          <img
            src={fotos[selectedIndex]}
            alt="Foto ampliada"
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
          >
            <ChevronRight size={28} className="text-white" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedIndex + 1} / {fotos.length}
          </div>
        </div>
      )}
    </>
  );
}
