import { useEffect, useMemo } from 'react';
import { PageData } from '@/types';
import { themes } from '@/lib/themes';

const defaultFonts = {
  global: null,
  heading: null,
  paragraph: null,
  links: null,
} as const;

export function useThemeStyles(pageData: PageData | null) {
  // Generate CSS variables string
  const cssVariables = useMemo(() => {
    if (!pageData) return '';

    const currentTheme = pageData.theme || 'default';
    const themeStyles = themes[currentTheme]?.styles || {};
    const themeFonts = pageData.themeFonts || defaultFonts;
    const customCssVariables = pageData.customCssVariables || {};
    
    // Combine theme styles with custom variables (custom variables override theme styles)
    const combinedStyles = {
      ...themeStyles,
      ...customCssVariables
    };
    
    return `
      :root {
        --pf-font-family-default: ${themeFonts.global ? `'${themeFonts.global}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-heading: ${themeFonts.heading ? `'${themeFonts.heading}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-paragraph: ${themeFonts.paragraph ? `'${themeFonts.paragraph}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-links: ${themeFonts.links ? `'${themeFonts.links}', sans-serif` : 'var(--pf-font-family-default)'};
        ${Object.entries(combinedStyles)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }
    `;
  }, [pageData]);

  // Generate Google Fonts URL
  const googleFontsUrl = useMemo(() => {
    if (!pageData?.themeFonts) return '';

    const fonts = [
      pageData.themeFonts.global,
      pageData.themeFonts.heading,
      pageData.themeFonts.paragraph,
      pageData.themeFonts.links,
    ]
      .filter(Boolean)
      .map((font) => font?.replace(" ", "+"));

    return fonts.length > 0
      ? `https://fonts.googleapis.com/css2?family=${fonts.join("&family=")}&display=swap`
      : '';
  }, [pageData?.themeFonts]);

  return {
    cssVariables,
    googleFontsUrl,
    currentTheme: pageData?.theme || 'default',
    themeConfig: themes[pageData?.theme || 'default'],
  };
} 