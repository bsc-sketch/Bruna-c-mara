import React, { useState } from 'react';
import type { Trail, Point } from '../types';

// Ícones para as novas ações, mantendo a leveza da interface.
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);


// Função auxiliar para quebrar o texto no canvas.
const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ');
  let line = '';
  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
};

// Função para gerar e descarregar a imagem da constelação.
const generateAndDownloadImage = (trail: Trail, allPoints: Point[], userEmail: string | null) => {
  const canvas = document.createElement('canvas');
  const canvasWidth = 1200;
  const canvasHeight = 630;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    alert('Não foi possível criar a imagem. O seu navegador pode não ser compatível.');
    return;
  }
  
  const trailPoints = trail.pointIds
    .map(id => allPoints.find(p => p.id === id))
    .filter((p): p is Point => p !== undefined);

  if (trailPoints.length === 0) return;

  // 1. Desenhar Fundo
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#21203a');
  gradient.addColorStop(1, '#24243e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Desenhar Campo Estrelado
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 200; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvasWidth, Math.random() * canvasHeight, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Projetar Coordenadas Geográficas
  const padding = 120;
  const lats = trailPoints.map(p => p.lat);
  const lngs = trailPoints.map(p => p.lng);
  const lngsCycled = lngs.map(lng => (lng < -90 && Math.max(...lngs) > 90) ? lng + 360 : lng);
  const minLng = Math.min(...lngsCycled);
  const maxLng = Math.max(...lngsCycled);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const latRange = maxLat - minLat, lngRange = maxLng - minLng;
  const effectiveLatRange = latRange === 0 ? 1 : latRange;
  const effectiveLngRange = lngRange === 0 ? 1 : lngRange;
  const scale = Math.min((canvasWidth - 2 * padding) / effectiveLngRange, (canvasHeight - 2 * padding) / effectiveLatRange);
  const offsetX = (canvasWidth - (effectiveLngRange * scale)) / 2;
  const offsetY = (canvasHeight - (effectiveLatRange * scale)) / 2;

  const project = (lat: number, lng: number) => {
    const cycledLng = (lng < -90 && Math.max(...lngs) > 90) ? lng + 360 : lng;
    return { 
      x: ((cycledLng - minLng) * scale) + offsetX, 
      y: ((maxLat - lat) * scale) + offsetY 
    };
  };
  const projectedPoints = trailPoints.map(p => project(p.lat, p.lng));

  // 4. Desenhar Conexões
  if (projectedPoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
    projectedPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(196, 181, 253, 0.8)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 5. Desenhar Estrelas
  projectedPoints.forEach((p, i) => {
    const starSize = 4 + (i === Math.floor(projectedPoints.length / 2) ? 3 : Math.random() * 2);
    const starGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, starSize * 2);
    starGradient.addColorStop(0, 'rgba(253, 224, 71, 1)');
    starGradient.addColorStop(0.5, 'rgba(253, 224, 71, 0.5)');
    starGradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = starGradient;
    ctx.fillRect(p.x - starSize * 2, p.y - starSize * 2, starSize * 4, starSize * 4);
  });
  
  // 6. Desenhar Texto
  const textPadding = 60;
  ctx.fillStyle = 'rgba(233, 213, 255, 0.95)';
  ctx.font = 'italic 32px serif';
  ctx.textAlign = 'left';
  ctx.fillText(trail.name, textPadding, canvasHeight - textPadding - 60);
  
  if (trail.description) {
    ctx.fillStyle = 'rgba(233, 213, 255, 0.7)';
    ctx.font = '16px sans-serif';
    wrapText(ctx, trail.description, textPadding, canvasHeight - textPadding - 30, canvasWidth / 2, 22);
  }
  
  ctx.fillStyle = 'rgba(233, 213, 255, 0.5)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'right';
  const attribution = `Cartografias Pluriversais – constelação criada por ${userEmail || 'um cartógrafo'}`;
  ctx.fillText(attribution, canvasWidth - textPadding, canvasHeight - textPadding + 20);

  // 7. Iniciar Download
  const link = document.createElement('a');
  link.download = `constelacao-${trail.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Modal de partilha, um convite para outros verem o mundo pelos seus olhos.
const ShareModal: React.FC<{ 
    trail: Trail; 
    onClose: () => void;
    points: Point[];
    userEmail: string | null;
}> = ({ trail, onClose, points, userEmail }) => {
    const [copied, setCopied] = useState(false);
    const shareLink = `${window.location.origin}${window.location.pathname}?share=${btoa(JSON.stringify(trail))}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportImage = () => {
        generateAndDownloadImage(trail, points, userEmail);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-[#21203a] to-[#24243e] p-6 rounded-lg shadow-2xl w-full max-w-sm border border-purple-400/20 m-4 animate-slide-in-left" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-serif italic text-purple-200 mb-4">Partilhar Constelação</h3>
                <p className="text-sm text-purple-300/70 mb-4">Partilhe esta jornada com um link privado ou exporte como imagem.</p>
                <div className="flex items-center space-x-2">
                    <input type="text" value={shareLink} readOnly className="w-full bg-gray-900/50 text-white p-2 text-sm rounded border border-purple-400/30"/>
                    <button onClick={handleCopy} className="py-2 px-3 rounded bg-purple-500 text-white text-sm hover:bg-purple-600 transition-colors">{copied ? 'Copiado!' : 'Copiar'}</button>
                </div>
                <button onClick={handleExportImage} className="w-full mt-4 py-2 px-4 rounded-full text-purple-300 border border-purple-400/30 hover:bg-white/10 transition-colors text-sm">Exportar como Imagem</button>
                <button onClick={onClose} className="w-full mt-2 py-2 text-purple-300 hover:text-white transition-colors text-sm">Fechar</button>
            </div>
        </div>
    );
};


interface SavedTrailsPanelProps {
  isOpen: boolean;
  trails: Trail[];
  onClose: () => void;
  onSelectTrail: (id: string) => void;
  onHighlightTrail: (id: string | null) => void;
  onDeleteTrail: (id: string) => void;
  onUpdateTrail: (id: string, updates: { name: string; description?: string }) => void;
  points: Point[];
  currentUser: string | null;
}

export const SavedTrailsPanel: React.FC<SavedTrailsPanelProps> = ({ 
  isOpen, trails, onClose, onSelectTrail, onHighlightTrail, onDeleteTrail, onUpdateTrail,
  points, currentUser
}) => {
  const [editingTrailId, setEditingTrailId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [sharingTrail, setSharingTrail] = useState<Trail | null>(null);

  const handleEditClick = (trail: Trail) => {
    setEditingTrailId(trail.id);
    setEditForm({ name: trail.name, description: trail.description || '' });
  };
  const handleCancelEdit = () => setEditingTrailId(null);
  const handleSaveEdit = () => {
    if (!editingTrailId) return;
    onUpdateTrail(editingTrailId, { name: editForm.name.trim(), description: editForm.description.trim() });
    setEditingTrailId(null);
  };
  
  const panelClasses = isOpen ? "translate-x-0" : "translate-x-full";

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm p-6 bg-gray-900/70 backdrop-blur-md shadow-2xl transition-transform duration-500 ease-in-out z-20 ${panelClasses}`}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif italic text-purple-200">Arquivo de Constelações</h2>
          <button onClick={onClose} className="p-2 rounded-full text-purple-300 hover:bg-purple-400/20" aria-label="Fechar painel"><CloseIcon /></button>
        </div>

        {trails.length === 0 ? (
          <p className="text-purple-300/70 text-sm italic">Nenhuma trilha foi guardada ainda.</p>
        ) : (
          <ul className="space-y-3 overflow-y-auto h-[calc(100%-4rem)] pr-2">
            {[...trails].reverse().map(trail => (
              <li
                key={trail.id}
                className="group p-3 rounded-lg bg-white/5 transition-all duration-300"
                onMouseEnter={() => !editingTrailId && onHighlightTrail(trail.id)}
                onMouseLeave={() => !editingTrailId && onHighlightTrail(null)}
              >
                {editingTrailId === trail.id ? (
                  /* Modo Edição */
                  <div className="flex flex-col gap-3">
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-1 focus:ring-purple-400" />
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-1 focus:ring-purple-400 h-20 resize-none" maxLength={500}/>
                    <div className="flex justify-end space-x-2">
                      <button onClick={handleCancelEdit} className="py-1 px-3 text-xs rounded-full text-purple-300 hover:bg-white/10">Cancelar</button>
                      <button onClick={handleSaveEdit} className="py-1 px-3 text-xs rounded-full bg-purple-500 text-white hover:bg-purple-600">Salvar</button>
                    </div>
                  </div>
                ) : (
                  /* Modo Visualização */
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => onSelectTrail(trail.id)}>
                        <h3 className="text-purple-200 group-hover:text-amber-200 transition-colors font-sans">{trail.name}</h3>
                        <p className="text-xs text-purple-400/60 mt-1">{new Date(trail.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEditClick(trail)} className="p-2 rounded-full hover:bg-purple-400/20 text-purple-300" title="Editar"><EditIcon /></button>
                         <button onClick={() => setSharingTrail(trail)} className="p-2 rounded-full hover:bg-purple-400/20 text-purple-300" title="Partilhar"><ShareIcon /></button>
                         <button onClick={() => onDeleteTrail(trail.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400" title="Apagar"><DeleteIcon /></button>
                      </div>
                    </div>
                    {trail.description && <p className="text-sm text-purple-300/80 mt-3 pt-3 border-t border-white/10">{trail.description}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {sharingTrail && <ShareModal 
                          trail={sharingTrail} 
                          onClose={() => setSharingTrail(null)} 
                          points={points} 
                          userEmail={currentUser} 
                        />}
    </>
  );
};