import { useEffect, useMemo } from 'react';
import { PageData } from '@/types';
import { themes } from '@/lib/themes';

export function useThemeStyles(pageData: PageData | null) {
  // Generate CSS variables string
  const cssVariables = useMemo(() => {
    if (!pageData) return '';

    const currentTheme = pageData.designStyle || 'default';
    const themeStyles = themes[currentTheme]?.styles || {};
    
    return `
      :root {
        --pf-font-family-default: ${pageData.fonts?.global ? `'${pageData.fonts.global}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-heading: ${pageData.fonts?.heading ? `'${pageData.fonts.heading}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-paragraph: ${pageData.fonts?.paragraph ? `'${pageData.fonts.paragraph}', sans-serif` : 'var(--pf-font-family-default)'};
        --pf-font-family-links: ${pageData.fonts?.links ? `'${pageData.fonts.links}', sans-serif` : 'var(--pf-font-family-default)'};
        ${Object.entries(themeStyles)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }
    `;
  }, [pageData]);

  // Generate Google Fonts URL
  const googleFontsUrl = useMemo(() => {
    if (!pageData?.fonts) return '';

    const fonts = [
      pageData.fonts.global,
      pageData.fonts.heading,
      pageData.fonts.paragraph,
      pageData.fonts.links,
    ]
      .filter(Boolean)
      .map((font) => font?.replace(" ", "+"));

    return fonts.length > 0
      ? `https://fonts.googleapis.com/css2?family=${fonts.join("&family=")}&display=swap`
      : '';
  }, [pageData?.fonts]);

  return {
    cssVariables,
    googleFontsUrl,
    currentTheme: pageData?.designStyle || 'default',
    themeConfig: themes[pageData?.designStyle || 'default'],
  };
} 