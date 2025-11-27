
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onStart: (userEmail: string) => void;
}

// Uma simulação simples de 'hashing' para não guardar senhas em texto puro.
// Em uma aplicação real, isso seria feito no backend com bcrypt.
const pseudoHash = (password: string) => btoa(`pluriversal-${password}-salt`);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const users = JSON.parse(localStorage.getItem('pluriversal_users') || '[]');

      if (isLoginMode) {
        // Lógica de Login
        const user = users.find((u: any) => u.email === email);
        if (user && user.passwordHash === pseudoHash(password)) {
          onStart(email);
        } else {
          setError('Credenciais inválidas. Por favor, tente novamente.');
        }
      } else {
        // Lógica de Cadastro
        const userExists = users.some((u: any) => u.email === email);
        if (userExists) {
          setError('Este email já está em uso. Por favor, faça login.');
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        const newUser = { email, passwordHash: pseudoHash(password) };
        localStorage.setItem('pluriversal_users', JSON.stringify([...users, newUser]));
        onStart(email);
      }
    } catch (err) {
      console.error("Erro de autenticação:", err);
      setError('Ocorreu um erro. Por favor, tente mais tarde.');
    }
  };
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-8 animate-fade-in">
      <div className="max-w-md w-full">
        <h1 
          className="text-4xl md:text-5xl font-serif italic text-purple-200 mb-4"
        >
          Cartografias Pluriversais
        </h1>
        <p className="text-purple-300/80 mb-8 leading-relaxed">
          Um refúgio para desacelerar e tecer seus mapas de sentido.
        </p>

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-4 text-left">
          <h2 className="text-2xl font-serif text-purple-200/90 text-center mb-2">
            {isLoginMode ? 'Entrar' : 'Cadastrar'}
          </h2>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-purple-300 mb-1">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900/50 text-white p-2 rounded border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="bg-purple-500 text-white font-semibold py-2 px-6 rounded-full w-full mt-4
                       hover:bg-purple-600 transition-colors duration-300
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
          >
            {isLoginMode ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <button
          onClick={toggleMode}
          className="text-purple-300/80 hover:text-purple-200 transition-colors mt-6 text-sm"
        >
          {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
        </button>
      </div>
    </div>
  );
};