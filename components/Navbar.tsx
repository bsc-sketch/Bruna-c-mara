
import React from 'react';

// Ícones para a navegação
const MapIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0 6l6-3m-6 3l-6-3m12 0l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13v-6m0 6l-6-3" />
</svg>
);

const ProfileIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
);

interface NavbarProps {
  activeScreen: 'map' | 'profile';
  setActiveScreen: (screen: 'map' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, setActiveScreen }) => {
  const navItemClass = "flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300 rounded-md w-20";
  const activeClass = "text-purple-200 scale-110";
  const inactiveClass = "text-purple-400/60 hover:text-purple-300";

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 z-20 flex justify-center border-t border-purple-400/10">
      <div className="flex items-center justify-around w-full max-w-xs">
        <button
          onClick={() => setActiveScreen('map')}
          className={`${navItemClass} ${activeScreen === 'map' ? activeClass : inactiveClass}`}
          aria-label="Ir para o mapa"
        >
          <MapIcon />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button
          onClick={() => setActiveScreen('profile')}
          className={`${navItemClass} ${activeScreen === 'profile' ? activeClass : inactiveClass}`}
          aria-label="Ir para o perfil"
        >
          <ProfileIcon />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
