import { LinkIcons, LinkIcon } from './linkIcons';

export interface LinkPreset {
  id: string;
  title: string;
  icon: LinkIcon;
  url?: string;
  urlPattern?: RegExp;
  urlPrefix?: string;
  urlTemplate?: string; // Template for token-related URLs
  tokenGated?: boolean;
  requiredTokens?: string[];
  group: 'social' | 'token';
  placeholder?: string;
  dummyUrl: string;
}

// Social media link presets
const socialPresets: LinkPreset[] = [
  {
    id: 'twitter',
    title: 'Twitter',
    icon: LinkIcons.Twitter,
    urlPattern: /^https?:\/\/(twitter\.com|x\.com)\/.+/,
    group: 'social',
    placeholder: 'twitter.com/yourusername',
    dummyUrl: 'https://twitter.com/yourusername'
  },
  {
    id: 'discord',
    title: 'Discord',
    icon: LinkIcons.Discord,
    urlPattern: /^https?:\/\/(discord\.gg|discord\.com)\/.+/,
    group: 'social',
    placeholder: 'discord.gg/invite-code',
    dummyUrl: 'https://discord.gg/invite-code'
  },
  {
    id: 'github',
    title: 'GitHub',
    icon: LinkIcons.GitHub,
    urlPattern: /^https?:\/\/github\.com\/.+/,
    group: 'social',
    placeholder: 'github.com/yourusername',
    dummyUrl: 'https://github.com/yourusername'
  },
  {
    id: 'spotify',
    title: 'Spotify',
    icon: LinkIcons.Spotify,
    urlPattern: /^https?:\/\/open\.spotify\.com\/.+/,
    group: 'social',
    placeholder: 'open.spotify.com/artist/...',
    dummyUrl: 'https://open.spotify.com/artist/yourid'
  },
  {
    id: 'instagram',
    title: 'Instagram',
    icon: LinkIcons.Instagram,
    urlPattern: /^https?:\/\/([\w-]+\.)*instagram\.com\/.+/,
    group: 'social',
    placeholder: 'instagram.com/yourusername',
    dummyUrl: 'https://instagram.com/yourusername'
  },
  {
    id: 'telegram',
    title: 'Telegram',
    icon: LinkIcons.Telegram,
    urlPattern: /^https?:\/\/t\.me\/.+/,
    group: 'social',
    placeholder: 't.me/yourusername',
    dummyUrl: 'https://t.me/yourusername'
  },
  {
    id: 'tiktok',
    title: 'TikTok',
    icon: LinkIcons.TikTok,
    urlPattern: /^https?:\/\/([\w-]+\.)*tiktok\.com\/.+/,
    group: 'social',
    placeholder: 'tiktok.com/@yourusername',
    dummyUrl: 'https://tiktok.com/@yourusername'
  },
  {
    id: 'farcaster',
    title: 'Farcaster',
    icon: LinkIcons.Farcaster,
    urlPattern: /^https?:\/\/([\w-]+\.)*warpcast\.com\/.+/,
    group: 'social',
    placeholder: 'warpcast.com/yourusername',
    dummyUrl: 'https://warpcast.com/yourusername'
  },
  {
    id: 'email',
    title: 'Email',
    icon: LinkIcons.Email,
    urlPattern: /^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/.+)$/,
    urlPrefix: 'mailto:',
    group: 'social',
    placeholder: 'you@example.com',
    dummyUrl: 'mailto:you@example.com'
  }
];

// Token/blockchain related link presets
const tokenPresets: LinkPreset[] = [
  {
    id: 'dexscreener',
    title: 'DexScreener',
    icon: LinkIcons.DexScreener,
    urlPattern: /^https?:\/\/([\w-]+\.)*dexscreener\.com\/.+/,
    urlTemplate: 'https://dexscreener.com/solana/{token}',
    group: 'token',
    placeholder: 'dexscreener.com/solana/token',
    dummyUrl: 'https://dexscreener.com/solana/token'
  },
  {
    id: 'solscan',
    title: 'Solscan',
    icon: LinkIcons.Solscan,
    urlPattern: /^https?:\/\/([\w-]+\.)*solscan\.io\/.+/,
    urlTemplate: 'https://solscan.io/token/{token}',
    group: 'token',
    placeholder: 'solscan.io/token/address',
    dummyUrl: 'https://solscan.io/token/address'
  }
];

export const linkPresets = [...socialPresets, ...tokenPresets];

// Helper function to get preset by ID
export function getLinkPreset(id: string | undefined): LinkPreset | undefined {
  if (!id) return undefined;
  return linkPresets.find(preset => preset.id === id);
}

// Helper function to get presets by group
export function getLinkPresetsByGroup(group: 'social' | 'token'): LinkPreset[] {
  return linkPresets.filter(preset => preset.group === group);
}

// Helper function to validate link URL
export function validateLinkUrl(preset: LinkPreset | undefined, url: string): boolean {
  if (!preset?.urlPattern) return true;
  return preset.urlPattern.test(url);
}

// Helper function to format link URL with prefix
export function formatLinkUrl(preset: LinkPreset | undefined, url: string, token?: string): string {
  if (!preset) return url;
  if (preset.urlTemplate && token) {
    return preset.urlTemplate.replace('{token}', token);
  }
  if (preset.urlPrefix) {
    return url.startsWith(preset.urlPrefix) ? url : `${preset.urlPrefix}${url}`;
  }
  return url;
} 