import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { 
  TwitterIcon, 
  FacebookIcon, 
  TelegramIcon, 
  DiscordIcon, 
  InstagramIcon, 
  TikTokIcon,
  GitHubIcon
} from "@/lib/icons";
import { PageItem } from "@/types";
import { Check, Copy } from "lucide-react";

interface ShareDrawerProps {
  item: PageItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug?: string;
}

export default function ShareDrawer({ item, open, onOpenChange, pageSlug }: ShareDrawerProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${pageSlug || ''}`
    : '';
  
  const itemUrl = item.url || `${shareUrl}/url/${item.id}`;
  const shareTitle = item.title || "Check out this link";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(itemUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareItems = [
    {
      name: "Copy Link",
      icon: copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />,
      onClick: copyToClipboard,
    },
    {
      name: "Twitter",
      icon: <TwitterIcon size={24} brandColor />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(itemUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Facebook",
      icon: <FacebookIcon size={24} brandColor />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(itemUrl)}`,
    },
    {
      name: "Telegram",
      icon: <TelegramIcon size={24} brandColor />,
      url: `https://t.me/share/url?url=${encodeURIComponent(itemUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Discord",
      icon: <DiscordIcon size={24} brandColor />,
      url: `https://discord.com/channels/@me?message=${encodeURIComponent(shareTitle + ": " + itemUrl)}`,
    },
    {
      name: "Instagram",
      icon: <InstagramIcon size={24} brandColor />,
      url: `https://www.instagram.com/`,
    },
    {
      name: "TikTok",
      icon: <TikTokIcon size={24} brandColor />,
      url: `https://www.tiktok.com/`,
    },
    {
      name: "GitHub",
      icon: <GitHubIcon size={24} brandColor />,
      url: `https://github.com/`,
    }
  ];

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Share "${item.title || 'this link'}"`}
      closeButton
      direction="bottom"
      hasContainer
    >
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-5">
        {shareItems.map((item) => (
          <div 
            key={item.name}
            className={`flex flex-col  shadow-brutalist-sm border border-primary hover:bg-muted items-center justify-center p-4 rounded-lg cursor-pointer transition-colors`}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else if (item.url) {
                window.open(item.url, '_blank');
              }
            }}
          >
            <div className="mb-2">{item.icon}</div>
            <span className="text-xs font-medium text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
} 