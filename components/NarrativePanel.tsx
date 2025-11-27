import React, { useState, useEffect } from 'react';
import type { Point } from '../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

// O ícone para fechar o painel, um convite gentil para voltar ao mapa.
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface NarrativePanelProps {
  point: Point;
  onClose: () => void;
}

// O painel que se abre como um livro, revelando a alma de cada ponto.
export const NarrativePanel: React.FC<NarrativePanelProps> = ({ point, onClose }) => {
  // Estado local para controlar se a imagem carregou.
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reseta o estado de carregamento quando o ponto muda
  useEffect(() => {
    setImgLoaded(false);
  }, [point.id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
     if (e.currentTarget.src !== FALLBACK_IMAGE) {
        e.currentTarget.src = FALLBACK_IMAGE;
     }
  };

  return (
    // Um véu que suaviza o mundo, focando o olhar na narrativa.
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-20 flex justify-start items-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrative-title"
    >
      {/* O corpo da história, com suas texturas visuais e sonoras. */}
      <div
        className="relative h-full w-full max-w-md bg-gradient-to-br from-[#21203a] to-[#24243e] shadow-2xl flex flex-col border-r border-purple-500/20"
        style={{ animation: 'slideInFromLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-64 bg-gray-800 shrink-0">
          {/* Skeleton loading simples enquanto a imagem não vem */}
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-700/50" />
          )}
          
          <img 
            src={point.imageUrl} 
            alt={`Imagem para ${point.title}`} 
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
                handleImageError(e);
                setImgLoaded(true); 
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#21203a] to-transparent opacity-80"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/20 hover:bg-purple-500/80 backdrop-blur-md transition-all border border-white/10"
            aria-label="Fechar painel"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <h2 id="narrative-title" className="text-2xl md:text-3xl font-serif italic text-purple-200 mb-6 drop-shadow-lg">
            {point.title}
          </h2>
          
          <div className="w-12 h-1 bg-purple-500/50 mb-6 rounded-full"></div>

          <p className="text-purple-100/80 mb-8 leading-relaxed whitespace-pre-wrap font-sans text-lg tracking-wide">
            {point.description}
          </p>

          <div className="mt-auto bg-gray-900/40 p-4 rounded-xl border border-purple-500/10">
            <p className="text-xs text-purple-300 uppercase tracking-widest mb-3 font-semibold">Ouvir a História</p>
            <audio
                controls
                src={point.audioUrl}
                className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity"
                onError={() => console.warn("Erro ao carregar áudio")}
            >
                Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        </div>
      </div>
       <style>{`
          @keyframes slideInFromLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
          }
        `}</style>
    </div>
  );
};