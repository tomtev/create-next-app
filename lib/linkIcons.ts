import { SVGProps } from 'react';
import { Icons } from '@/components/icons';

export type LinkIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

export const LinkIcons = {
  Email: Icons.Email,
  Twitter: Icons.Twitter,
  Discord: Icons.Discord,
  GitHub: Icons.GitHub,
  Spotify: Icons.Spotify,
  Instagram: Icons.Instagram,
  Telegram: Icons.Telegram,
  TikTok: Icons.TikTok,
  Farcaster: Icons.Farcaster,
  Apple: Icons.Apple,
  DexScreener: Icons.DexScreener,
  Solscan: Icons.Solscan,
} as const;