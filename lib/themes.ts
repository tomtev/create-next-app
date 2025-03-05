export type ThemeStyle = "default" | "dark" | "modern";

export interface ThemeConfig {
  title: string;
  styles: Record<string, string>;
  fonts: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
  effects?: {
    linkGradientBorder?: boolean;
    titleGradientBackground?: boolean;
    descriptionGradientBackground?: boolean;
    luminance?: boolean;
    linkPixelBorder?: boolean;
  };
}

export type Themes = Record<string, ThemeConfig>;

export const themes: Themes = {
  default: {
    title: "Light",
    styles: {
      "--pf-link-background": "#FFF",
    },
    fonts: {
      global: "Inter",
      heading: "Inter",
      paragraph: "Inter",
      links: "Inter",
    },
  },
  dark: {
    title: "Dark",
    styles: {
      /* Colors */
      "--pf-page-bg": "#000",
      "--pf-page-text-color": "#fff",
      "--pf-page-muted-color": "#999",
      "--pf-title-color": "#fff",
      "--pf-description-color": "#fff",

      /* Link styles */
      "--pf-link-background": "rgba(255, 255, 255, 0.05)",
      "--pf-link-background-hover": "rgba(255, 255, 255, 0.1)",
      "--pf-link-border-color": "rgba(255, 255, 255, 0.4)",
    },
    fonts: {
      global: "Inter",
      heading: "Inter",
      paragraph: "Inter",
      links: "Inter",
    },
  },
  pixel: {
    title: "Pixel",
    effects: {
      linkPixelBorder: true,
    },
    styles: {
      "--pf-link-border-radius": "0px",
      "--pf-link-border-width": "1px",
      "--pf-link-border-style": "solid",
      "--pf-link-border-color": "transparent",
      "--pf-pixel-border-color": "#000",
      "--pf-pixel-border-width": "5px",
    },
    fonts: {
      global: "Silkscreen",
      heading: "Silkscreen",
      paragraph: "Silkscreen",
      links: "Silkscreen",
    },
  },
  terminal: {
    title: "Terminal",
    effects: {
      linkPixelBorder: true,
      linkGradientBorder: true,
      luminance: true,
    },
    styles: {
      "--pf-page-bg": "#000",
      "--pf-page-text-color": "#00e653",
      "--pf-pixel-border-color": "#00e653",
      "--pf-pixel-border-width": "5px",
      "--pf-gradient-blur": "3px",
      "--pf-gradient-border-width": "4px",
      "--pf-gradient-border":
        "radial-gradient( 200px at var(--link-mouse-x) var(--link-mouse-y),rgb(41, 232, 111) 0%, transparent 100% )",
    },
    fonts: {
      global: "Silkscreen",
      heading: "Silkscreen",
      paragraph: "Silkscreen",
      links: "Silkscreen",
    },
  },
  modern: {
    title: "Solana",
    effects: {
      linkGradientBorder: true,
      luminance: true,
      titleGradientBackground: true,
      descriptionGradientBackground: true,
    },
    styles: {
      /* Colors */
      "--pf-page-bg": "#121212",
      "--pf-page-text-color": "#fafafa",
      "--pf-title-color": "#fff",

      /* Link styles */
      "--pf-link-background": "var(--pf-page-bg)",
      "--pf-link-background-hover": "var(--pf-page-bg)",
      "--pf-link-border-width": "2px",
      "--pf-link-border-color": "rgba(255, 255, 255, 0.1)",
      "--pf-link-border-radius": ".5rem",
      "--pf-link-color": "var(--pf-page-text-color)",
      "--pf-link-color-hover": "var(--pf-primary)",
      "--pf-gradient-blur": "0",
      "--pf-gradient-border":
        "radial-gradient(100px at var(--link-mouse-x) var(--link-mouse-y), #9945FF 0%, color-mix(in srgb, #9945FF, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) - 20%) calc(var(--link-mouse-y) - 20%), #5497D5 0%, color-mix(in srgb, #5497D5, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) + 20%) calc(var(--link-mouse-y) + 20%), #43B4CA 0%, color-mix(in srgb, #43B4CA, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) - 10%) calc(var(--link-mouse-y) + 10%), #19FB9B 0%, color-mix(in srgb, #19FB9B, transparent 100%) 100%)",
      "--pf-title-gradient":
        "linear-gradient(to right, #9945FF 8%, #8752F3 30%, #5497D5 50%, #43B4CA 60%, #28E0B9 72%, #19FB9B 97%)",
    },
    fonts: {
      global: "Space Grotesk",
      heading: "Dela Gothic One",
      paragraph: "Space Grotesk",
      links: "Space Grotesk",
    },
  },
  // New themes start here
  neon: {
    title: "Neon Nights",
    effects: {
      linkGradientBorder: true,
      luminance: true,
      titleGradientBackground: true,
    },
    styles: {
      "--pf-page-bg": "#0f0e17",
      "--pf-page-text-color": "#fffffe",
      "--pf-title-color": "#ff8906",
      "--pf-description-color": "#f25f4c",
      
      "--pf-link-background": "rgba(255, 255, 255, 0.03)",
      "--pf-link-background-hover": "rgba(255, 255, 255, 0.05)",
      "--pf-link-border-radius": "12px",
      "--pf-link-border-width": "2px",
      "--pf-link-border-color": "rgba(242, 95, 76, 0.2)",
      "--pf-gradient-blur": "5px",
      "--pf-gradient-border-width": "3px",
      "--pf-gradient-border": "radial-gradient(100px at var(--link-mouse-x) var(--link-mouse-y), #ff8906 0%, transparent 70%), radial-gradient(80px at calc(var(--link-mouse-x) + 30%) calc(var(--link-mouse-y) - 30%), #f25f4c 0%, transparent 70%)",
      "--pf-title-gradient": "linear-gradient(to right, #ff8906, #f25f4c)",
    },
    fonts: {
      global: "Outfit",
      heading: "Outfit",
      paragraph: "Outfit",
      links: "Outfit",
    },
  },
  retrowave: {
    title: "Retrowave",
    effects: {
      linkGradientBorder: true,
      titleGradientBackground: true,
      descriptionGradientBackground: true,
    },
    styles: {
      "--pf-page-bg": "#2b213a",
      "--pf-page-text-color": "#ffffff",
      "--pf-title-color": "#ff00ff",
      "--pf-description-color": "#00ffff",
      
      "--pf-link-background": "rgba(0, 0, 0, 0.3)",
      "--pf-link-background-hover": "rgba(0, 0, 0, 0.5)",
      "--pf-link-border-radius": "0px",
      "--pf-link-border-width": "2px",
      "--pf-link-border-style": "solid",
      "--pf-link-border-color": "#ff00ff",
      "--pf-link-color": "#00ffff",
      "--pf-gradient-border": "linear-gradient(90deg, #ff00ff, #00ffff)",
      "--pf-title-gradient": "linear-gradient(90deg, #ff00ff, #00ffff)",
      "--pf-description-gradient": "linear-gradient(90deg, #00ffff, #ff00ff)",
    },
    fonts: {
      global: "Chakra Petch",
      heading: "Orbitron",
      paragraph: "Chakra Petch",
      links: "Chakra Petch",
    },
  },
  pastel: {
    title: "Pastel Dream",
    styles: {
      "--pf-page-bg": "#f9f4ef",
      "--pf-page-text-color": "#716040",
      "--pf-title-color": "#8bd3dd",
      "--pf-description-color": "#f582ae",
      
      "--pf-link-background": "#fec7d7",
      "--pf-link-background-hover": "#f582ae",
      "--pf-link-border-radius": "20px",
      "--pf-link-border-width": "0px",
      "--pf-link-color": "#ffffff",
    },
    fonts: {
      global: "Nunito",
      heading: "Pacifico",
      paragraph: "Nunito",
      links: "Nunito",
    },
  },
  cyberpunk: {
    title: "Cyberpunk",
    effects: {
      linkPixelBorder: true,
      titleGradientBackground: true,
    },
    styles: {
      "--pf-page-bg": "#0d0221",
      "--pf-page-text-color": "#fcf7ff",
      "--pf-title-color": "#f706cf",
      "--pf-description-color": "#fcf7ff",
      
      "--pf-link-background": "rgba(13, 2, 33, 0.8)",
      "--pf-link-background-hover": "rgba(13, 2, 33, 0.9)",
      "--pf-link-border-radius": "0px",
      "--pf-link-border-color": "#f706cf",
      "--pf-pixel-border-color": "#3bf4fb",
      "--pf-pixel-border-width": "3px",
      "--pf-title-gradient": "linear-gradient(90deg, #f706cf, #3bf4fb)",
    },
    fonts: {
      global: "Russo One",
      heading: "Russo One",
      paragraph: "Exo 2",
      links: "Exo 2",
    },
  },
  handwritten: {
    title: "Handwritten",
    styles: {
      "--pf-page-bg": "#fffef9",
      "--pf-page-text-color": "#2d334a",
      "--pf-title-color": "#2d334a",
      "--pf-description-color": "#2d334a",
      
      "--pf-link-background": "#f8f5e4",
      "--pf-link-background-hover": "#e8e4cf",
      "--pf-link-border-radius": "5px",
      "--pf-link-border-width": "1px",
      "--pf-link-border-style": "dashed",
      "--pf-link-border-color": "#2d334a",
    },
    fonts: {
      global: "Architects Daughter",
      heading: "Caveat",
      paragraph: "Architects Daughter",
      links: "Kalam",
    },
  },
  minimal: {
    title: "Minimal",
    styles: {
      "--pf-page-bg": "#ffffff",
      "--pf-page-text-color": "#000000",
      "--pf-title-color": "#000000",
      "--pf-description-color": "#444444",
      
      "--pf-link-background": "#f5f5f5",
      "--pf-link-background-hover": "#eeeeee",
      "--pf-link-border-radius": "4px",
      "--pf-link-border-width": "1px",
      "--pf-link-border-style": "solid",
      "--pf-link-border-color": "#dddddd",
    },
    fonts: {
      global: "Sora",
      heading: "Sora",
      paragraph: "Sora",
      links: "Sora",
    },
  },
  glassmorphism: {
    title: "Glass",
    effects: {
      linkGradientBorder: true,
      luminance: true,
    },
    styles: {
      "--pf-page-bg": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "--pf-page-text-color": "#ffffff",
      "--pf-title-color": "#ffffff",
      "--pf-description-color": "rgba(255, 255, 255, 0.8)",
      
      "--pf-link-background": "rgba(255, 255, 255, 0.15)",
      "--pf-link-background-hover": "rgba(255, 255, 255, 0.25)",
      "--pf-link-border-radius": "16px",
      "--pf-link-border-width": "1px",
      "--pf-link-border-style": "solid",
      "--pf-link-border-color": "rgba(255, 255, 255, 0.3)",
      "--pf-gradient-blur": "10px",
      "--pf-gradient-border": "radial-gradient(70px at var(--link-mouse-x) var(--link-mouse-y), rgba(255, 255, 255, 0.7) 0%, transparent 70%)",
    },
    fonts: {
      global: "Poppins",
      heading: "Poppins",
      paragraph: "Poppins",
      links: "Poppins",
    },
  },
  gameboy: {
    title: "GameBoy",
    effects: {
      linkPixelBorder: true,
    },
    styles: {
      "--pf-page-bg": "#9bbc0f",
      "--pf-page-text-color": "#0f380f",
      "--pf-title-color": "#0f380f",
      "--pf-description-color": "#0f380f",
      
      "--pf-link-background": "#8bac0f",
      "--pf-link-background-hover": "#7b9c0f",
      "--pf-link-border-radius": "0px",
      "--pf-link-border-color": "transparent",
      "--pf-pixel-border-color": "#0f380f",
      "--pf-pixel-border-width": "4px",
    },
    fonts: {
      global: "VT323",
      heading: "VT323",
      paragraph: "VT323",
      links: "VT323",
    },
  },
  blueprint: {
    title: "Blueprint",
    styles: {
      "--pf-page-bg": "#0a2463",
      "--pf-page-text-color": "#89c2d9",
      "--pf-title-color": "#ffffff",
      "--pf-description-color": "#61a5c2",
      
      "--pf-link-background": "rgba(255, 255, 255, 0.05)",
      "--pf-link-background-hover": "rgba(255, 255, 255, 0.1)",
      "--pf-link-border-radius": "0px",
      "--pf-link-border-width": "1px",
      "--pf-link-border-style": "dashed",
      "--pf-link-border-color": "#89c2d9",
    },
    fonts: {
      global: "Source Code Pro",
      heading: "Teko",
      paragraph: "Source Code Pro",
      links: "Source Code Pro",
    },
  },
  comic: {
    title: "Comic Book",
    effects: {
      linkPixelBorder: true,
    },
    styles: {
      "--pf-page-bg": "#fffdf7",
      "--pf-page-text-color": "#2b2b2b",
      "--pf-title-color": "#d62828",
      "--pf-description-color": "#2b2b2b",
      
      "--pf-link-background": "#fcbf49",
      "--pf-link-background-hover": "#f77f00",
      "--pf-link-border-radius": "0px",
      "--pf-link-border-color": "transparent",
      "--pf-link-color": "#003049",
      "--pf-pixel-border-color": "#003049",
      "--pf-pixel-border-width": "4px",
    },
    fonts: {
      global: "Bangers",
      heading: "Bangers",
      paragraph: "Comic Neue",
      links: "Comic Neue",
    },
  },
};
