import DOMPurify from 'dompurify';

// Initialize DOMPurify for server-side rendering
let domPurify: typeof DOMPurify;

// Check if window is defined (client-side) or not (server-side)
if (typeof window !== 'undefined') {
  // Client-side
  domPurify = DOMPurify;
} else {
  // Server-side - use a simple string-based sanitization
  // We're not importing JSDOM directly to avoid issues with Next.js SSR
  domPurify = {
    sanitize: (content: string, options?: any): string => {
      if (!content) return '';
      
      try {
        // Simple server-side sanitization to remove script tags and event handlers
        return content
          .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
          .replace(/\son\w+\s*=/gi, ' data-removed-event=')
          .replace(/javascript:/gi, 'removed:')
          .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
          .replace(/<form[\s\S]*?>[\s\S]*?<\/form>/gi, '')
          .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
          .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
          .replace(/<link[\s\S]*?>/gi, '');
      } catch (error) {
        console.error('Error in server-side sanitization:', error);
        // If all else fails, strip all HTML tags
        return content.replace(/<[^>]*>/g, '');
      }
    }
  } as typeof DOMPurify;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(content: string | null | undefined): string {
  if (!content) return '';
  
  try {
    // Configure DOMPurify to be very strict
    const sanitizedHtml = domPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object', 'embed', 'link'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'style'],
      ALLOW_DATA_ATTR: false,
      USE_PROFILES: { html: true },
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });
    
    return sanitizedHtml;
  } catch (error) {
    console.error('Error in sanitizeHtml:', error);
    // Fallback to basic sanitization if DOMPurify fails
    return content
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=/gi, ' data-removed-event=')
      .replace(/javascript:/gi, 'removed:')
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<form[\s\S]*?>[\s\S]*?<\/form>/gi, '')
      .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
      .replace(/<link[\s\S]*?>/gi, '');
  }
}

/**
 * Sanitizes a URL to prevent javascript: protocol and other potentially harmful URLs
 * 
 * @param url - The URL to sanitize
 * @returns Sanitized URL string or empty string if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  try {
    // Check for javascript: protocol
    if (/^javascript:/i.test(url)) {
      return '';
    }
    
    // Check for data: URLs that aren't images
    if (/^data:(?!image\/(jpeg|png|gif|webp|svg\+xml))/i.test(url)) {
      return '';
    }
    
    // Allow http, https, mailto, tel protocols
    if (/^(https?|mailto|tel):/i.test(url)) {
      return url;
    }
    
    // If no protocol is specified, assume https
    if (!/^[a-z]+:/i.test(url)) {
      return `https://${url}`;
    }
    
    // Disallow all other protocols
    return '';
  } catch (error) {
    console.error('Error in sanitizeUrl:', error);
    // If sanitization fails, return empty string for safety
    return '';
  }
} 