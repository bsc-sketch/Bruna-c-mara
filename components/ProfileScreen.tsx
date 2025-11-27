import React, { useState, useEffect } from 'react';
import type { Trail } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

// O ícone para sair, indicando o retorno à tela inicial.
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

interface ProfileScreenProps {
  userEmail: string | null;
  savedTrails: Trail[];
  onLogout: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
  bio: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  initialData: UserProfile;
  onSave: (data: UserProfile) => void;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData);
  
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gradient-to-br from-[#21203a] to-[#24243e] p-6 rounded-lg shadow-2xl w-full max-w-sm border border-purple-400/20 m-4 animate-slide-in-left"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-xl font-serif italic text-purple-200 mb-2">Editar Perfil</h2>
          
          <div>
            <label className="text-xs text-purple-300/70 ml-1 block mb-1">Nome Completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
             <label className="text-xs text-purple-300/70 ml-1 block mb-1">Email *</label>
             <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
             <label className="text-xs text-purple-300/70 ml-1 block mb-1">URL da Foto (Opcional)</label>
             <input
              type="url"
              value={formData.photoUrl}
              onChange={e => setFormData({...formData, photoUrl: e.target.value})}
              placeholder="https://..."
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
             <label className="text-xs text-purple-300/70 ml-1 block mb-1">Bio / Título</label>
             <input
              type="text"
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Ex: Cartógrafo de Mundos"
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="py-2 px-4 rounded-full text-purple-300 hover:bg-white/10 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="py-2 px-5 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors text-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userEmail, savedTrails, onLogout }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Usamos o email como chave para persistir o perfil específico deste usuário.
  const profileKey = userEmail ? `user_profile_${userEmail}` : 'user_profile_guest';
  
  const [profile, setProfile] = useLocalStorage<UserProfile>(profileKey, {
    name: userEmail?.split('@')[0] || 'Viajante',
    email: userEmail || '',
    photoUrl: '',
    bio: 'Cartógrafo de mundos'
  });

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
  };

  // Determina a inicial para o avatar caso não haja foto
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="h-full w-full p-6 pt-10 pb-28 text-white overflow-y-auto animate-fade-in relative">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif italic text-purple-200">
            Seu Refúgio
          </h1>
          <p className="text-purple-300/70 mt-2">
            Aqui repousam suas jornadas e constelações.
          </p>
        </header>

        {/* Cartão de Informações do Usuário */}
        <section className="bg-gradient-to-br from-[#21203a] to-[#24243e] p-6 rounded-lg shadow-lg border border-purple-400/20 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-purple-200">Perfil</h2>
            </div>
            
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-500/30 flex-shrink-0 border-2 border-purple-400/30">
                    {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-200 text-2xl font-serif">
                            {initial}
                        </div>
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="font-medium text-white text-lg truncate">{profile.name}</p>
                    <p className="text-sm text-purple-300/80 truncate">{profile.email}</p>
                    <p className="text-xs text-purple-400/60 mt-1 italic">{profile.bio}</p>
                </div>
            </div>
             <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-6 py-2 px-4 rounded-full text-purple-300 border border-purple-400/30 hover:bg-white/10 transition-colors text-sm hover:text-white"
            >
                Editar Perfil
            </button>
        </section>

        {/* Seção de Trilhas Salvas */}
        <section>
          <h2 className="text-xl font-semibold text-purple-200 mb-4">Suas Constelações Salvas</h2>
          {savedTrails.length === 0 ? (
            <div className="bg-white/5 p-6 rounded-lg text-center">
                <p className="text-purple-300/70 text-sm italic">
                Nenhuma trilha foi guardada ainda.
                </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {[...savedTrails].reverse().map(trail => (
                <li
                  key={trail.id}
                  className="p-3 rounded-lg bg-white/5 flex items-center justify-between"
                >
                  <span className="text-purple-200 font-sans">
                    {trail.name}
                  </span>
                  <span className="text-xs text-purple-400/50">
                    {new Date(trail.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Botão de Logout */}
        <footer className="mt-12 text-center">
            <button 
                onClick={onLogout}
                className="py-2 px-5 rounded-full bg-purple-500/30 text-white font-semibold hover:bg-purple-600/50 transition-colors flex items-center justify-center mx-auto border border-purple-500/20"
            >
                <LogoutIcon />
                Sair
            </button>
        </footer>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        initialData={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};