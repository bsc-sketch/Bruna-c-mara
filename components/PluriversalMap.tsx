import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Point, Trail } from '../types';
import { NarrativePoint } from './NarrativePoint';
import { ConstellationTrail } from './ConstellationTrail';
import { Controls } from './Controls';
import { SavedTrailsPanel } from './SavedTrailsPanel';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAMtkC9oZTwH5VnGFiaZP1Hg8wciR3dmlc';

// Estilo customizado para o Google Maps, evocando a paleta noturna do projeto.
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#24243e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#24243e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c4b5fd' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#312f58' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#21203a' }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f0c29' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
];

interface PluriversalMapProps {
  points: Point[];
  activeTrail: string[];
  savedTrails: Trail[];
  onPointClick: (pointId: string) => void;
  onSave: () => void;
  onClear: () => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  highlightedTrailId: string | null;
  onHighlightTrail: (id: string | null) => void;
  onDeleteTrail: (id: string) => void;
  onUpdateTrail: (id: string, updates: { name: string; description?: string }) => void;
  mapCenter: { lat: number, lng: number };
  mapZoom: number;
  onMapChange: (details: { center: { lat: number, lng: number }, zoom: number }) => void;
  userLocation: { lat: number; lng: number } | null;
  onLocateUser: () => void;
  currentUser: string | null;
}

const MapHandler: React.FC<{ 
  points: Point[];
  savedTrails: Trail[];
  trailToFocusId: string | null;
  onMapChange: (details: { center: { lat: number, lng: number }, zoom: number }) => void;
  mapCenter: { lat: number, lng: number };
  mapZoom: number;
}> = ({ points, savedTrails, trailToFocusId, onMapChange, mapCenter, mapZoom }) => {
  const map = useMap();

  // Gerencia atualizações imperativas da câmera baseadas nas props (Navegação programática)
  useEffect(() => {
    if (!map) return;
    
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    if (currentCenter) {
        const latDiff = Math.abs(currentCenter.lat() - mapCenter.lat);
        const lngDiff = Math.abs(currentCenter.lng() - mapCenter.lng);
        const zoomDiff = Math.abs((currentZoom || 0) - mapZoom);
        
        // Move apenas se a diferença for significativa para evitar conflitos com o arrasto do usuário
        if (latDiff > 0.0001 || lngDiff > 0.0001 || zoomDiff > 0.1) {
            map.moveCamera({ center: mapCenter, zoom: mapZoom });
        }
    } else {
        map.moveCamera({ center: mapCenter, zoom: mapZoom });
    }
  }, [map, mapCenter, mapZoom]);

  useEffect(() => {
    if (!map || !trailToFocusId) return;

    const trail = savedTrails.find(t => t.id === trailToFocusId);
    if (!trail) return;

    const trailPoints = trail.pointIds
        .map(id => points.find(p => p.id === id))
        .filter((p): p is Point => p !== undefined);

    if (trailPoints.length > 0) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        trailPoints.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
        if (trailPoints.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(10);
        } else {
          map.fitBounds(bounds, 100);
        }
    }
  }, [map, trailToFocusId, points, savedTrails]);

  const onCameraChange = useCallback(() => {
    if(!map) return;
    const center = map.getCenter()!.toJSON();
    const zoom = map.getZoom()!;
    onMapChange({ center, zoom });
  }, [map, onMapChange]);


  useEffect(() => {
    if (!map) return;
    const dragListener = map.addListener('dragend', onCameraChange);
    const zoomListener = map.addListener('zoom_changed', onCameraChange);
    return () => {
      dragListener.remove();
      zoomListener.remove();
    }
  }, [map, onCameraChange]);

  return null;
};


// O palco do nosso universo, agora georreferenciado.
export const PluriversalMap: React.FC<PluriversalMapProps> = (props) => {
  const {
    points,
    activeTrail,
    savedTrails,
    onPointClick,
    onSave,
    onClear,
    isPanelOpen,
    onTogglePanel,
    highlightedTrailId,
    onHighlightTrail,
    onDeleteTrail,
    onUpdateTrail,
    mapCenter,
    mapZoom,
    onMapChange,
    userLocation,
    onLocateUser,
    currentUser,
  } = props;

  const [trailToFocus, setTrailToFocus] = useState<string|null>(highlightedTrailId);
  
  // Sincroniza o foco quando uma trilha partilhada é carregada.
  useEffect(() => {
    setTrailToFocus(highlightedTrailId);
  }, [highlightedTrailId]);


  const handleSelectTrail = (trailId: string) => {
    onHighlightTrail(trailId);
    setTrailToFocus(trailId);
  };
  
  const activeTrailPoints = activeTrail
    .map(id => points.find(p => p.id === id))
    .filter((p): p is Point => p !== undefined);

  if (!GOOGLE_MAPS_API_KEY) {
    return <div className="flex items-center justify-center h-full">API Key do Google Maps não configurada.</div>;
  }
  
  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          styles={mapStyle}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapId="pluriversal-map"
          minZoom={2}
          renderingType="VECTOR"
        >
            <MapHandler 
              points={points} 
              savedTrails={savedTrails} 
              trailToFocusId={trailToFocus} 
              onMapChange={onMapChange}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
            />
            
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Sua Localização">
                {/* 
                  translate-y-1/2 compensa a ancoragem padrão do Google Maps (bottom-center).
                  Isso alinha o centro visual da estrela exatamente com a coordenada geográfica,
                  impedindo que ela pareça "flutuar" ou se deslocar durante o zoom.
                */}
                <div className="relative flex items-center justify-center w-12 h-12 translate-y-1/2">
                  {/* Halo de luz pulsante (Ripple) - Gold color (amber-500) */}
                  <div className="absolute w-full h-full bg-amber-500/30 rounded-full animate-ripple blur-sm" />
                  
                  {/* Estrela de 4 pontas pulsante - Deep Gold (amber-500) with strong glow */}
                  <div className="relative z-10 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-amber-500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {savedTrails.map(trail => {
              const trailPoints = trail.pointIds
                .map(id => points.find(p => p.id === id))
                .filter((p): p is Point => p !== undefined);
              return (
                <ConstellationTrail 
                  key={trail.id}
                  id={trail.id}
                  points={trailPoints} 
                  name={trail.name} 
                  isActive={false}
                  isHighlighted={trail.id === highlightedTrailId}
                />
              );
            })}

            {/* 
              IMPORTANTE: O ConstellationTrail ativo é renderizado incondicionalmente.
              Isso garante que o componente não seja desmontado (unmounted) quando a trilha é limpa,
              permitindo que ele gerencie a limpeza da linha do mapa (polyline.setMap(null))
              de forma confiável e fluida, evitando "travamentos" ou linhas fantasmas.
            */}
            <ConstellationTrail 
              id="active-trail" 
              points={activeTrailPoints} 
              isActive={true} 
              isHighlighted={false} 
            />

            {points.map(point => (
              <NarrativePoint
                key={point.id}
                point={point}
                onClick={() => onPointClick(point.id)}
                isSelected={activeTrail.includes(point.id)}
              />
            ))}
        </Map>
        
        {/* Camada de Filtro cinza reduzida para 10% de opacidade para maior clareza */}
        <div className="absolute inset-0 pointer-events-none z-[5] bg-gray-900/10" />
        
        <Controls 
          onSave={onSave} 
          onClear={onClear} 
          canSave={activeTrail.length > 1}
          onTogglePanel={onTogglePanel}
          onLocateUser={onLocateUser}
        />
        <SavedTrailsPanel
          isOpen={isPanelOpen}
          trails={savedTrails}
          onClose={onTogglePanel}
          onSelectTrail={handleSelectTrail}
          onHighlightTrail={onHighlightTrail}
          onDeleteTrail={onDeleteTrail}
          onUpdateTrail={onUpdateTrail}
          points={points}
          currentUser={currentUser}
        />
      </APIProvider>
    </div>
  );
};