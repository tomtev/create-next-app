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
};
