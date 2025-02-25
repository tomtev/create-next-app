import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// Initialize Prisma client with Neon adapter - using edge-compatible initialization
const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeonHTTP(sql);
// @ts-ignore - Prisma doesn't have proper edge types yet
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allOperations({ operation, args, query }) {
      return query(args);
    },
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Vercel Blob environment variables are configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error: Vercel Blob is not properly configured' 
      });
    }

    const filename = req.query.filename as string;
    const pageSlug = req.query.pageSlug as string;
    
    if (!filename) {
      return res.status(400).json({ error: 'No filename provided' });
    }

    if (!pageSlug) {
      return res.status(400).json({ error: 'No page slug provided' });
    }

    // Verify the page exists
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Prefix the filename with the page slug to organize content by page
    const prefixedFilename = `${pageSlug}/${filename}`;

    // For Pages API Routes, we pass the request directly
    // Set access to 'private' instead of 'public'
    const blob = await put(prefixedFilename, req, {
      access: 'private',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading private file:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return res.status(500).json({ 
      error: 'Failed to upload private file', 
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 