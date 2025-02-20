export type ThemeStyle = 'default' | 'dark' | 'modern';

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
    linkMagnet?: boolean;
    pageMagnet?: boolean;
    linkPixelBorder?: boolean;
  };
}

export type Themes = Record<string, ThemeConfig>;

export const themes: Themes = {
  default: {
    title: 'Light',
    styles: {},
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  dark: {
    title: 'Dark',
    styles: {
      /* Colors */
      '--pf-page-bg-color': '#000',
      '--pf-page-text-color': '#fff',
      '--pf-page-muted-color': '#999',
      '--pf-title-color': '#fff',
      '--pf-description-color': '#fff',

      /* Link styles */
      '--pf-link-background': 'rgba(255, 255, 255, 0.05)',
      '--pf-link-background-hover': 'rgba(255, 255, 255, 0.1)',
      '--pf-link-border-width': '1px',
      '--pf-link-border-style': 'solid',
      '--pf-link-border-color': 'rgba(255, 255, 255, 0.1)',
    },
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  pixel: {
    title: 'Pixel',
    effects: {
      linkPixelBorder: true
    },
    styles: {
      '--pf-link-radius': '0px',
      '--pf-link-border-width': '1px',
      '--pf-link-border-style': 'solid',
      '--pf-link-border-color': 'transparent',
      '--pf-pixel-border-color': '#000',
      '--pf-pixel-border-width': '5px',
    },
    fonts: {
      global: 'Silkscreen',
      heading: 'Silkscreen',
      paragraph: 'Silkscreen',
      links: 'Silkscreen'
    }
  },
  modern: {
    title: 'Modern Dark',
    effects: {
      linkGradientBorder: true,
      titleGradientBackground: true,
      descriptionGradientBackground: true,
      linkMagnet: true,
      pageMagnet: true,
    },
    styles: {
      /* Colors */
      '--pf-page-bg-color': '#000',
      '--pf-page-text-color': '#fff',
      '--pf-page-muted-color': '#999',
      '--pf-title-color': '#fff',
      '--pf-description-color': 'var(--pf-page-muted-color)',

      /* Title and description */
      '--pf-title-font-size': '3.5rem',
      '--pf-title-font-weight': '800',
      '--pf-title-line-height': '1.1',

      /* Link styles */
      '--pf-link-background': 'var(--pf-page-bg-color)',
      '--pf-link-background-hover': 'var(--pf-page-bg-color)',
      '--pf-link-border-width': '1px',
      '--pf-link-border-style': 'solid',
      '--pf-link-border-color': 'rgba(255, 255, 255, 0.1)',
      '--pf-link-radius': '.5rem',
      '--pf-link-color': 'var(--pf-page-text-color)',
      '--pf-link-color-hover': 'var(--pf-primary)',
      '--pf-link-shadow': '0 0 0 1px rgba(255, 255, 255, 0.1)',
      '--pf-link-shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      '--pf-gradient-border': 'radial-gradient(100px at var(--link-mouse-x) var(--link-mouse-y), #dd7bbb 0%, color-mix(in srgb, #dd7bbb, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) - 20%) calc(var(--link-mouse-y) - 20%), #d79f1e 0%, color-mix(in srgb, #d79f1e, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) + 20%) calc(var(--link-mouse-y) + 20%), #5a922c 0%, color-mix(in srgb, #5a922c, transparent 100%) 100%), radial-gradient(100px at calc(var(--link-mouse-x) - 10%) calc(var(--link-mouse-y) + 10%), #4c7894 0%, color-mix(in srgb, #4c7894, transparent 100%) 100%)'
    },
    fonts: {
      global: 'Space Grotesk',
      heading: 'Dela Gothic One',
      paragraph: 'Space Grotesk',
      links: 'Space Grotesk'
    }
  }
}; 