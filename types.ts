// A alma de cada narrativa, um ponto de luz no mapa.
export interface Point {
  id: string;
  lat: number; // Coordenada de latitude.
  lng: number; // Coordenada de longitude.
  title: string;
  description: string;
  imageUrl: string; // Imagem de apoio para a narrativa.
  audioUrl: string; // Áudio com a narração da história.
}

// Uma constelação pessoal, a ligação efêmera entre saberes.
export interface Trail {
  id: string;
  name: string; // O nome dado pelo coração a este percurso.
  pointIds: string[]; // A sequência de estrelas que formam o desenho.
  description?: string; // Uma anotação poética sobre a jornada.
  createdAt: number; // O momento em que a constelação nasceu.
}