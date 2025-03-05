export interface PageItem {
  id: string;
  pageId: string;
  presetId: string;
  title: string | null;
  url: string | null;
  order: number;
  tokenGated: boolean;
  requiredTokens: string[];
  customIcon?: string | null;
}

export interface ThemeFonts {
  global: string | null;
  heading: string | null;
  paragraph: string | null;
  links: string | null;
}

export interface ThemeColors {
  primary: string | null;
  secondary: string | null;
  background: string | null;
  text: string | null;
}

export interface PageData {
  id?: string;
  walletAddress: string;
  slug: string;
  connectedToken?: string | null;
  tokenSymbol?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  pageType?: string;
  theme?: string | null;
  themeFonts?: ThemeFonts | null;
  themeColors?: ThemeColors | null;
  customCssVariables?: Record<string, string>;
  items?: PageItem[];
  createdAt: string;
  updatedAt?: string;
} 