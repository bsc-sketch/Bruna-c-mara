import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PluriversalMap } from './components/PluriversalMap';
import { WelcomeScreen } from './WelcomeScreen';
import type { Point, Trail } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { NARRATIVE_POINTS } from './constants';
import { NarrativePanel } from './components/NarrativePanel';
import { Navbar } from './components/Navbar';
import { ProfileScreen } from './components/ProfileScreen';


// Um modal para dar nome à constelação, um passo mais cuidado que um simples 'prompt'.
interface SaveTrailModalProps {
  isOpen: boolean;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  defaultName: string;
}

const SaveTrailModal: React.FC<SaveTrailModalProps> = ({ isOpen, onSave, onClose, defaultName }) => {
  const [trailName, setTrailName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Um efeito para garantir que o modal esteja sempre fresco e focado quando aberto.
  useEffect(() => {
    if (isOpen) {
      setTrailName(defaultName);
      setDescription('');
      // O foco é direcionado ao campo de nome, um convite silencioso à escrita.
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultName]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trailName.trim()) {
      onSave(trailName.trim(), description.trim());
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-30 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gradient-to-br from-[#21203a] to-[#24243e] p-6 rounded-lg shadow-2xl w-full max-w-sm border border-purple-400/20 m-4 animate-slide-in-left"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-serif italic text-purple-200 mb-4">Nomear sua Constelação</h2>
          <p className="text-purple-300/70 text-sm mb-4">Dê um nome a esta Trilha de Sentido para guardá-la em seu arquivo.</p>
          <input
            ref={inputRef}
            type="text"
            value={trailName}
            onChange={e => setTrailName(e.target.value)}
            className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-900/50 text-white p-2 mt-4 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400 h-24 resize-none"
            placeholder="Adicione uma anotação, sentimento ou intenção..."
            maxLength={500}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="py-2 px-4 rounded-full text-purple-300 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="py-2 px-5 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// O coração da nossa experiência, onde a memória das trilhas e o gesto presente se encontram.
const App: React.FC = () => {
  // O estado que define se a jornada já começou.
  const [hasStarted, setHasStarted] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'map' | 'profile'>('map');

  // O estado de todas as narrativas que povoam nosso universo.
  const [points] = useState<Point[]>(NARRATIVE_POINTS);
  
  // A trilha que está sendo tecida agora, um pensamento em formação.
  const [activeTrail, setActiveTrail] = useState<string[]>([]);
  
  // As constelações guardadas, memórias subjetivas salvas no navegador.
  const [savedTrails, setSavedTrails] = useLocalStorage<Trail[]>('saved_trails', []);

  // Uma trilha partilhada, visualizada temporariamente.
  const [viewOnlyTrail, setViewOnlyTrail] = useState<Trail | null>(null);

  // O estado que guarda se o nosso arquivo de constelações está visível.
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // O ID da trilha que recebe nosso foco, brilhando sob nosso olhar.
  const [highlightedTrailId, setHighlightedTrailId] = useState<string | null>(null);

  // Estado para controlar a visão do mapa.
  const [mapCenter, setMapCenter] = useState({ lat: 10, lng: -20 });
  const [mapZoom, setMapZoom] = useState(2.5);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Estado para o modal de salvar trilha.
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // O ponto de saber que está em foco, revelando sua história.
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  // Ao iniciar, verificamos se uma constelação foi partilhada por link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
        try {
            const sharedTrail: Trail = JSON.parse(atob(sharedData));
            setViewOnlyTrail(sharedTrail);
            setHighlightedTrailId(sharedTrail.id);
            // Limpa o URL para evitar recarregamentos da mesma partilha.
            window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {
            console.error("Erro ao decodificar a trilha partilhada:", e);
        }
    }
  }, []);

  // O ritual de início, o portal para o mapa.
  const handleStart = (userEmail: string) => {
    setCurrentUser(userEmail);
    setHasStarted(true);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setHasStarted(false);
    setActiveScreen('map'); // Reseta para a tela do mapa para o próximo login
  };

  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newUserLocation);
          setMapCenter(newUserLocation);
          setMapZoom(12);
        },
        () => {
          alert('Não foi possível obter sua localização. Por favor, verifique as permissões do navegador.');
        }
      );
    } else {
      alert('Geolocalização não é suportada por este navegador.');
    }
  }, []);

  // Um gesto de toque, um ponto de saber que se junta à trilha e revela sua alma.
  const handlePointClick = useCallback((pointId: string) => {
    const point = points.find(p => p.id === pointId);
    if (!point) return;

    // Abre o painel com os detalhes da narrativa.
    setSelectedPoint(point);

    // Adiciona o ponto à trilha ativa, tecendo o caminho.
    setActiveTrail(prevTrail => {
      if (prevTrail.includes(pointId)) {
        // Clicar novamente em um ponto da trilha a trunca até ele.
        return prevTrail.slice(0, prevTrail.indexOf(pointId) + 1);
      }
      return [...prevTrail, pointId];
    });
  }, [points]);

  // O ato de guardar uma trilha, tornando-a uma memória perene.
  // Passo 1: Abrir o modal para nomear a trilha.
  const handleSaveTrail = useCallback(() => {
    if (activeTrail.length < 2) return; // Uma constelação precisa de ao menos duas estrelas.
    setIsSaveModalOpen(true);
  }, [activeTrail]);

  // Passo 2: Confirmar o nome e salvar a trilha.
  const handleConfirmSave = useCallback((trailName: string, description: string) => {
    if (activeTrail.length < 2 || !trailName) return;

    const newTrail: Trail = { 
      id: `trail-${Date.now()}`, 
      name: trailName.trim(),
      pointIds: activeTrail,
      description: description || undefined,
      createdAt: Date.now()
    };
    
    setSavedTrails(prevTrails => [...prevTrails, newTrail]);
    setActiveTrail([]); // O mapa se esvazia, pronto para um novo traço.
    setSelectedPoint(null); // Fecha o painel de narrativa, se estiver aberto.
    setIsSaveModalOpen(false); // Fecha o modal.
    setIsPanelOpen(true); // Abre o painel para que o usuário veja sua nova constelação.
  }, [activeTrail, setSavedTrails]);

  // Um sopro que limpa o mapa, convidando a um novo começo.
  const handleClearTrail = useCallback(() => {
    setActiveTrail([]);
    setSelectedPoint(null); // Também fecha o painel de narrativa.
  }, []);

  // O gesto de libertar uma memória, deixando-a voltar a ser apenas poeira estelar.
  const handleDeleteTrail = useCallback((trailId: string) => {
    setSavedTrails(prev => prev.filter(t => t.id !== trailId));
  }, [setSavedTrails]);

  // O ato de refinar uma memória, mudando seu nome ou descrição.
  const handleUpdateTrail = useCallback((trailId: string, updates: { name: string; description?: string }) => {
    setSavedTrails(prev => 
      prev.map(t => t.id === trailId ? { ...t, name: updates.name, description: updates.description } : t)
    );
  }, [setSavedTrails]);

  const allTrails = viewOnlyTrail ? [...savedTrails, viewOnlyTrail] : savedTrails;

  return (
    <main 
      className="h-screen w-screen bg-gradient-to-br from-[#0f0c29] via-[#21203a] to-[#24243e] text-white antialiased overflow-hidden"
      aria-label="Mapa de Cartografias Pluriversais"
    >
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <>
          {activeScreen === 'map' && (
            <div className="w-full h-full animate-fade-in">
              <PluriversalMap
                points={points}
                activeTrail={activeTrail}
                savedTrails={allTrails}
                onPointClick={handlePointClick}
                onSave={handleSaveTrail}
                onClear={handleClearTrail}
                isPanelOpen={isPanelOpen}
                onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
                highlightedTrailId={highlightedTrailId}
                onHighlightTrail={setHighlightedTrailId}
                onDeleteTrail={handleDeleteTrail}
                onUpdateTrail={handleUpdateTrail}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onMapChange={({ center, zoom }) => {
                  setMapCenter(center);
                  setMapZoom(zoom);
                }}
                userLocation={userLocation}
                onLocateUser={locateUser}
                currentUser={currentUser}
              />
              <SaveTrailModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleConfirmSave}
                defaultName={`Constelação-${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
              />
              {/* O painel da narrativa floresce quando um ponto é selecionado. */}
              {selectedPoint && (
                <NarrativePanel
                  point={selectedPoint}
                  onClose={() => setSelectedPoint(null)}
                />
              )}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center text-xs text-gray-400/50 pointer-events-none z-10">
                <p>Use o scroll para zoom e arraste para navegar.</p>
                <p>Clique nos pontos para tecer suas trilhas de sentido.</p>
              </div>
            </div>
          )}
          {activeScreen === 'profile' && (
            <ProfileScreen 
              userEmail={currentUser}
              savedTrails={savedTrails}
              onLogout={handleLogout}
            />
          )}
          <Navbar 
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        </>
      )}
    </main>
  );
};

export default App;