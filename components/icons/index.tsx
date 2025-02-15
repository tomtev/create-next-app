import { SVGProps } from 'react';

export const Icons = {
  Email: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
    </svg>
  ),

  Twitter: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.5 0-4.5 2-4.5 4.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),

  Discord: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.82 4.18A16.88 16.88 0 0016.36 3a11.75 11.75 0 00-8.72 0A16.88 16.88 0 003.18 4.18 16.88 16.88 0 002 8.64a11.75 11.75 0 000 8.72 16.88 16.88 0 001.18 4.46 16.88 16.88 0 004.46 1.18 11.75 11.75 0 008.72 0 16.88 16.88 0 004.46-1.18 16.88 16.88 0 001.18-4.46 11.75 11.75 0 000-8.72 16.88 16.88 0 00-1.18-4.46zM9.5 15.5a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5zm5 0a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z" />
    </svg>
  ),

  GitHub: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 4.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77 5.44 5.44 0 003.5 9.5c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.61V22" />
    </svg>
  ),

  Spotify: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm3.29 13.29a.75.75 0 01-1.05.22 8.47 8.47 0 00-4.48-1.2 8.47 8.47 0 00-4.48 1.2.75.75 0 11-.83-1.27 9.97 9.97 0 015.31-1.43 9.97 9.97 0 015.31 1.43.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 11.47 11.47 0 00-5.74-1.54 11.47 11.47 0 00-5.74 1.54.75.75 0 11-.83-1.27 12.97 12.97 0 016.57-1.76 12.97 12.97 0 016.57 1.76.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 14.47 14.47 0 00-7-1.76 14.47 14.47 0 00-7 1.76.75.75 0 11-.83-1.27 15.97 15.97 0 018.33-2.1 15.97 15.97 0 018.33 2.1.75.75 0 01.22 1.05z" />
    </svg>
  ),

  Instagram: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 11-1.37-2.87 4 4 0 011.37 2.87z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),

  Telegram: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 3L9 13" />
      <path d="M21 3l-7 19-4-9-9-4z" />
    </svg>
  ),

  TikTok: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9 3v12a4 4 0 104-4h-1" />
      <path d="M12 3a4 4 0 004 4h4" />
    </svg>
  ),

  Farcaster: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),

  DexScreener: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3v18h18M7 17l4-8 4 4 4-10" />
    </svg>
  ),

  Solscan: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm1-8.41l2.54 1.27a1 1 0 01-.89 1.79L12 13.38V7a1 1 0 012 0v4.59z" />
    </svg>
  ),
} as const; 