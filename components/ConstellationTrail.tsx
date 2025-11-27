import React, { useEffect, useMemo, useState } from 'react';
import type { Point } from '../types';
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

interface ConstellationTrailProps {
  id: string;
  points: Point[];
  isActive: boolean;
  isHighlighted: boolean;
  name?: string; // O nome da constelação, um sussurro no mapa.
}

// Aqui, o traço se materializa sobre o globo. É a constelação tomando forma no mapa.
export const ConstellationTrail: React.FC<ConstellationTrailProps> = ({ id, points, isActive, isHighlighted, name }) => {
  const map = useMap();
  const [isHovered, setIsHovered] = useState(false);

  // Instanciamos DUAS polilinhas:
  // 1. polyline: A linha visual, fina e estilizada.
  // 2. hitPolyline: Uma linha invisível e larga para capturar o mouse mais facilmente.
  const { polyline, hitPolyline } = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Polyline) {
      return {
        polyline: new (window as any).google.maps.Polyline(),
        hitPolyline: new (window as any).google.maps.Polyline(),
      };
    }
    return { polyline: null, hitPolyline: null };
  }, []);

  // Effect to register hover listeners specifically on the HIT polyline (the wide one)
  useEffect(() => {
    if (!hitPolyline) return;

    // Adicionamos os ouvintes na linha invisível larga
    const overListener = hitPolyline.addListener('mouseover', () => setIsHovered(true));
    const outListener = hitPolyline.addListener('mouseout', () => setIsHovered(false));

    // Opcional: Adicionar também na visual para garantir redundância
    const visibleOverListener = polyline?.addListener('mouseover', () => setIsHovered(true));
    const visibleOutListener = polyline?.addListener('mouseout', () => setIsHovered(false));

    return () => {
        overListener.remove();
        outListener.remove();
        visibleOverListener?.remove();
        visibleOutListener?.remove();
    };
  }, [hitPolyline, polyline]);

  // Effect to manage the polylines' lifecycle on the map.
  useEffect(() => {
    if (!map || !polyline || !hitPolyline) {
      return;
    }

    if (points.length < 2) {
      // Se tivermos menos de 2 pontos, limpamos o caminho e removemos do mapa.
      polyline.setPath([]); 
      polyline.setMap(null);
      hitPolyline.setPath([]);
      hitPolyline.setMap(null);
      return;
    }
    
    const path = points.map(p => ({ lat: p.lat, lng: p.lng }));
    
    // --- Configuração da Linha Visível ---
    const visualOptions = {
      path,
      strokeColor: '#c084fc', // Purple-400
      strokeOpacity: isHighlighted || isActive ? 1.0 : 0.3,
      strokeWeight: isHighlighted ? 4 : (isActive ? 3 : 2),
      geodesic: true,
      zIndex: isActive || isHighlighted ? 10 : 1, 
      clickable: false, // Deixamos a hitPolyline lidar com os cliques/hovers
    };
    polyline.setOptions(visualOptions);
    polyline.setMap(map);

    // --- Configuração da Área de Contato (Hit Area) ---
    const hitOptions = {
      path,
      strokeColor: '#ffffff', // A cor não importa pois a opacidade é 0
      strokeOpacity: 0,       // Totalmente transparente
      strokeWeight: 25,       // BEM GROSSA para facilitar o hover (25px de largura)
      geodesic: true,
      zIndex: (isActive || isHighlighted ? 10 : 1) + 1, // Um pouco acima da visual
      clickable: true,        // Esta é a linha que recebe a interação
      cursor: 'pointer'
    };
    hitPolyline.setOptions(hitOptions);
    hitPolyline.setMap(map);

    // Cleanup
    return () => {
      polyline.setMap(null);
      hitPolyline.setMap(null);
    };
  }, [map, polyline, hitPolyline, points, isActive, isHighlighted]);

  if (points.length < 2) return null;
  
  // Encontramos o centro da trilha para sussurrar seu nome.
  const getCenterPoint = () => {
    if (!points || points.length === 0) return null;
    
    const midIndex = Math.floor((points.length - 1) / 2);
    const p1 = points[midIndex];
    
    if (points.length % 2 === 0 && points.length > 0) {
      const p2 = points[midIndex + 1];
      return {
        lat: (p1.lat + p2.lat) / 2,
        lng: (p1.lng + p2.lng) / 2,
      };
    } else {
      return { lat: p1.lat, lng: p1.lng };
    }
  };

  const center = name ? getCenterPoint() : null;
  const shouldShowName = (isHovered || isHighlighted) && name && center;

  return (
    <>
      {/* O nome floresce no centro da constelação, como uma legenda poética, apenas ao passar o mouse ou selecionar. */}
      {shouldShowName && center && (
        <AdvancedMarker 
            position={center} 
            // Z-Index aumentado para garantir que o texto fique acima dos NarrativePoints (que vão até 50)
            zIndex={isHighlighted ? 100 : 60}
        >
            <div
                className="font-serif italic pointer-events-none transition-all duration-300 px-2 py-1 rounded shadow-sm flex items-center justify-center whitespace-nowrap animate-fade-in"
                style={{
                  backgroundColor: '#111827', 
                  color: '#e9d5ff', 
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  fontSize: isHighlighted ? '14px' : '12px',
                  opacity: isHighlighted ? 1 : 0.9, 
                  // Aumentado o translateY negativo para afastar o texto dos pontos
                  transform: 'translateY(-35px)'
                }}
            >
                {name}
            </div>
        </AdvancedMarker>
      )}
    </>
  );
};