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
      '--pf-background': '#000',
      '--pf-text': '#fff',
      '--pf-description-color': '#fff',
      '--pf-link-bg': 'rgba(255, 255, 255, 0.05)',
      '--pf-link-bg-hover': 'rgba(255, 255, 255, 0.1)',
      '--pf-link-border': '1px solid rgba(255, 255, 255, 0.1)',
    },
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  
  /* deprecated but keeping for backwards compatibility */
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
      '--pf-background': '#000',
      '--pf-text': '#fff',
      '--pf-muted': '#999',
      '--pf-heading-size': '3.5rem',
      '--pf-heading-weight': '800',
      '--pf-description-color': 'var(--pf-muted)',
      '--pf-link-bg': 'var(--pf-background)',
      '--pf-link-bg-hover': 'var(--pf-background)',
      '--pf-link-border': '1px solid rgba(255, 255, 255, 0.1)',
      '--pf-link-radius': '.5rem',
      '--pf-link-color': 'var(--pf-text)',
      '--pf-link-hover': 'var(--pf-primary)',
      '--pf-link-shadow': '0 0 0 1px rgba(255, 255, 255, 0.1)',
      '--pf-link-shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    },
    fonts: {
      global: 'Space Grotesk',
      heading: 'Dela Gothic One',
      paragraph: 'Space Grotesk',
      links: 'Space Grotesk'
    }
  }
}; 