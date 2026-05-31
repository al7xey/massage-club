const unsplashImage = (id: string, width = 1600, height = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;

export const fallbackImages = {
  hero: unsplashImage('photo-1544161515-4ab6ce6db874', 1400, 1200),
  services: [
    unsplashImage('photo-1544161515-4ab6ce6db874'),
    unsplashImage('photo-1519821172141-b5d8e075cde7'),
    unsplashImage('photo-1515377905703-c4788e51af15'),
    unsplashImage('photo-1570172619644-dfd03ed5d881'),
  ],
  studios: [
    unsplashImage('photo-1540555700478-4be289fbecef'),
    unsplashImage('photo-1519823551278-64ac92734fb1'),
    unsplashImage('photo-1600334089648-b0d9d3028eb2'),
  ],
  masters: [
    unsplashImage('photo-1559839734-2b71ea197ec2', 1200, 1500),
    unsplashImage('photo-1594824476967-48c8b964273f', 1200, 1500),
    unsplashImage('photo-1582750433449-648ed127bb54', 1200, 1500),
  ],
};

export function getFallbackImage(kind: keyof Omit<typeof fallbackImages, 'hero'>, seed: string) {
  const images = fallbackImages[kind];
  return images[getStableIndex(seed, images.length)] ?? images[0];
}

function getStableIndex(seed: string, length: number) {
  if (length <= 1) return 0;
  return Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;
}
