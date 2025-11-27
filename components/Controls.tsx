import React from 'react';

// Os glifos de interação, nossos únicos guias neste espaço.
// São convites sutis à ação, não comandos.

// Ícone para guardar a trilha, como quem planta uma semente.
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// Ícone para limpar o caminho, como um sopro que leva as folhas.
const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Ícone para abrir o arquivo de constelações.
const ArchiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

// Ícone para centralizar na localização do usuário.
const LocateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
);


interface ControlsProps {
  onSave: () => void;
  onClear: () => void;
  canSave: boolean;
  onTogglePanel: () => void;
  onLocateUser: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ onSave, onClear, canSave, onTogglePanel, onLocateUser }) => {
  const buttonBaseClass = "p-3 rounded-full bg-gray-800/50 backdrop-blur-sm text-purple-300 transition-all duration-300 hover:bg-purple-400/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50";
  const disabledClass = "opacity-30 cursor-not-allowed";

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-3 z-10">
      <button 
        onClick={onLocateUser}
        className={buttonBaseClass}
        aria-label="Centralizar na sua localização"
        title="Minha Localização"
      >
        <LocateIcon />
      </button>
      <button 
        onClick={onTogglePanel}
        className={buttonBaseClass}
        aria-label="Ver trilhas salvas"
        title="Ver Trilhas Salvas"
      >
        <ArchiveIcon />
      </button>
      <button 
        onClick={onSave}
        disabled={!canSave}
        className={`${buttonBaseClass} ${!canSave ? disabledClass : ''}`}
        aria-label="Salvar trilha atual"
        title="Salvar Trilha"
      >
        <SaveIcon />
      </button>
      <button 
        onClick={onClear}
        className={buttonBaseClass}
        aria-label="Limpar trilha atual"
        title="Limpar Trilha"
      >
        <ClearIcon />
      </button>
    </div>
  );
};