import React, { useState, useRef } from 'react';
import type { Point } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';

interface NarrativePointProps {
  point: Point;
  onClick: () => void;
  isSelected: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

// Cada ponto é uma narrativa, um 'lugar' de saber e afeto no mapa-múndi.
export const NarrativePoint: React.FC<NarrativePointProps> = ({ point, onClick, isSelected }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const touchTimeoutRef = useRef<number | undefined>(undefined);

  const showTooltip = () => {
    clearTimeout(touchTimeoutRef.current);
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
  };
  
  const handleClick = () => {
    // Para dispositivos de toque, mostramos o tooltip temporariamente.
    showTooltip();
    touchTimeoutRef.current = window.setTimeout(() => {
        hideTooltip();
    }, 3000);
    // E executamos a ação de clique principal (adicionar à trilha, abrir painel etc.).
    onClick();
  };

  // Tratamento de erro de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Apenas substitui pelo fallback se a imagem original realmente falhar
    // e evita loop infinito verificando se já não é o fallback
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
        e.currentTarget.src = FALLBACK_IMAGE;
    }
  };


  return (
    <AdvancedMarker
      position={{ lat: point.lat, lng: point.lng }}
      onClick={handleClick}
      title={point.title}
      zIndex={isSelected ? 50 : (isTooltipVisible ? 40 : 10)}
    >
      <div 
        className="relative flex items-center justify-center cursor-pointer group"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        role="button"
        aria-label={`Ver informações sobre ${point.title}`}
      >
        {/* Outer Halo - Light purple emanation */}
        <div 
          className={`
            w-6 h-6 rounded-full bg-purple-400/30 transition-transform duration-300
            ${isSelected ? 'scale-100' : 'scale-0'}
          `}
        />
        {/* Inner Circle - Lighter Purple (Purple-400) with lighter border (Purple-200) */}
        <div 
          className={`
            absolute w-3 h-3 rounded-full bg-purple-400 border border-purple-200 transition-all duration-300
            ${isSelected ? 'scale-125' : 'scale-100'}
            ${isSelected ? 'animate-pulse' : 'group-hover:animate-pulse'}
            ${isSelected ? 'shadow-[0_0_10px_2px_rgba(192,132,252,0.8)]' : 'group-hover:shadow-[0_0_8px_1px_rgba(192,132,252,0.6)]'}
          `}
        />

        {/* 
          Tooltip agora aninhado dentro do Marker para garantir que renderize junto com o ponto.
          Usamos 'pointer-events-none' para que ele não interfira no clique do marcador.
        */}
        <div 
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 
            bg-gray-900/95 text-white rounded-xl shadow-2xl border border-purple-400/30 
            backdrop-blur-md overflow-hidden transition-all duration-300 origin-bottom
            ${isTooltipVisible ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
          `}
          style={{ pointerEvents: 'none' }}
        >
          {/* Container da imagem com altura fixa para evitar layout shift */}
          <div className="w-full h-32 bg-gray-800 relative">
             <img 
               src={point.imageUrl} 
               alt={point.title} 
               className="w-full h-full object-cover opacity-90"
               loading="eager"
               onError={handleImageError}
             />
             {/* Gradiente para melhorar leitura do texto sobre a imagem se necessário */}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
          </div>
          
          <div className="p-3 relative z-10">
            <h3 className="font-bold text-purple-200 text-base leading-tight">{point.title}</h3>
            <p className="text-xs text-purple-300/80 mt-2 line-clamp-2">
                {point.description}
            </p>
          </div>
          
          {/* Seta do tooltip apontando para baixo */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-purple-400/30 rotate-45 transform"></div>
        </div>
      </div>
    </AdvancedMarker>
  );
};