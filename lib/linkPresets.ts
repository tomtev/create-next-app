import {
  TikTokIcon,
  DexScreenerIcon,
  TwitterIcon,
  DiscordIcon,
  TelegramIcon,
  JupiterIcon,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  TimeFunIcon,
} from "./icons";
import { Link } from "lucide-react";

export interface LinkPreset {
  id: string;
  title: string;
  url?: string;
  defaultUrl?: string;
  icon: any; // Using any here since we're directly importing from lucide-react
  options?: {
    requiresUrl?: boolean;
    canBeTokenGated?: boolean;
    requireToken?: boolean;
  };
}

export const LINK_PRESETS: Record<string, LinkPreset> = {
  /*
  bubblemaps: {
    id: "bubblemaps",
    title: "Bubblemaps",
    defaultUrl: "https://app.bubblemaps.io/",
    icon: BubblemapsIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  }, */
  custom: {
    id: "custom",
    title: "Custom Link",
    defaultUrl: "https://myurl.com",
    icon: Link,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  timefun: {
    id: "timefun",
    title: "Time.fun Profile",
    defaultUrl: "https://time.fun/username",
    icon: TimeFunIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  twitter: {
    id: "twitter",
    title: "Follow on X",
    defaultUrl: "https://x.com/username",
    icon: TwitterIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  telegram: {
    id: "telegram",
    title: "Join on Telegram",
    defaultUrl: "https://t.me/username",
    icon: TelegramIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  tiktok: {
    id: "tiktok",
    title: "Follow on TikTok",
    defaultUrl: "https://tiktok.com/@username",
    icon: TikTokIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  instagram: {
    id: "instagram",
    title: "Follow on Instagram",
    defaultUrl: "https://instagram.com/username",
    icon: InstagramIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  discord: {
    id: "discord",
    title: "Join on Discord",
    defaultUrl: "https://discord.gg/username",
    icon: DiscordIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  facebook: {
    id: "facebook",
    title: "Follow on Facebook",
    defaultUrl: "https://facebook.com/username",
    icon: FacebookIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  github: {
    id: "github",
    title: "View on GitHub",
    defaultUrl: "https://github.com/username",
    icon: GitHubIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  jupiter: {
    id: "jupiter",
    title: "Buy on Jupiter",
    defaultUrl: "https://jup.ag/tokens/[token]",
    icon: JupiterIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: false,
      requireToken: true,
    },
  },
  dexscreener: {
    id: "dexscreener",
    title: "View on DexScreener",
    defaultUrl: "https://dexscreener.com/solana/[token]",
    icon: DexScreenerIcon,
    options: {
      requiresUrl: true,
      canBeTokenGated: false,
      requireToken: true,
    },
  },
  /*
  "private-chat": {
    id: "private-chat",
    title: "Private Chat",
    defaultUrl: "https://t.me/name",
    icon: MessageCircle,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    defaultUrl: "https://",
    icon: Terminal,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  filesystem: {
    id: "filesystem",
    title: "Filesystem",
    defaultUrl: "https://",
    icon: FolderTree,
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  }*/
};
