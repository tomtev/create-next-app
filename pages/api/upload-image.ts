import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeUrl } from '@/lib/sanitize';
import path from 'path';

// Define allowed MIME types and file extensions
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// Maximum file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    // Check if filename is provided
    const filename = request.query.filename as string;
    if (!filename) {
      return response.status(400).json({ error: 'Filename is required' });
    }

    // Validate file extension
    const fileExtension = path.extname(filename).toLowerCase().substring(1);
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return response.status(400).json({ 
        error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` 
      });
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return response.status(500).json({ error: 'Storage is not configured' });
    }

    // Check content type
    const contentType = request.headers['content-type'];
    if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType)) {
      return response.status(400).json({ 
        error: `Invalid content type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
      });
    }

    // Check file size
    const contentLength = parseInt(request.headers['content-length'] || '0', 10);
    if (contentLength > MAX_FILE_SIZE) {
      return response.status(400).json({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }

    // Create a sanitized filename to prevent path traversal attacks
    const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Upload to Vercel Blob
    const blob = await put(sanitizedFilename, request, {
      access: 'public',
      contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
    });

    // Sanitize the URL before returning it
    let sanitizedUrl;
    try {
      sanitizedUrl = sanitizeUrl(blob.url);
    } catch (error) {
      console.error('Error sanitizing URL:', error);
      // If sanitization fails, use the original URL but ensure it's not a javascript: URL
      sanitizedUrl = blob.url.replace(/^javascript:/i, 'invalid:');
    }
    
    return response.status(200).json({
      url: sanitizedUrl,
      pathname: blob.pathname,
      contentType: blob.contentType
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return response.status(500).json({ error: 'Failed to upload image' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 