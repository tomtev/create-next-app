export const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Inter',
  'Nunito',
  // ... (rest of fonts)
] as const;

// Font categories with their fonts
export const FONT_CATEGORIES: Record<string, string[]> = {
  'System': ['system'],
  'Popular': [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Inter',
    'Nunito',
    'Ubuntu'
  ],
  'Pixel & Retro': [
    'Press Start 2P',
    'VT323',
    'Silkscreen',
    'Pixelify Sans',
    'DotGothic16'
  ],
  'Fun & Decorative': [
    'Pacifico',
    'Comic Neue',
    'Fredoka One',
    'Righteous',
    'Bangers',
    'Permanent Marker',
    'Satisfy',
    'Lobster'
  ],
  'Modern & Trendy': [
    'Bebas Neue',
    'Dela Gothic One',
    'Exo 2',
    'Orbitron',
    'Chakra Petch',
    'Russo One',
    'Teko',
    'Audiowide'
  ],
  'Clean & Professional': [
    'Albert Sans',
    'Outfit',
    'Space Grotesk',
    'Plus Jakarta Sans',
    'Urbanist',
    'Sora'
  ],
  'Handwriting': [
    'Homemade Apple',
    'Kalam',
    'Patrick Hand',
    'Architects Daughter',
    'Rock Salt',
    'Dancing Script',
    'Caveat',
    'Gochi Hand'
  ]
} as const;

export type FontSettings = {
  global?: string;
  heading?: string;
  paragraph?: string;
  links?: string;
}; 