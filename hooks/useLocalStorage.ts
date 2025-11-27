
import { useState, useEffect } from 'react';

// Este hook é o nosso guardião da memória.
// Ele permite que as trilhas salvas sobrevivam ao fechar da janela,
// como um sonho que lembramos ao acordar.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Tentamos encontrar uma memória antiga guardada no navegador.
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se a memória falhar, começamos de novo.
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // O valor pode ser um novo estado ou uma função que o transforma.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Guardamos a nova memória no navegador, para o futuro.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export { useLocalStorage };
