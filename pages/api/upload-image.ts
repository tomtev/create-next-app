import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

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
    
    if (!filename) {
      return res.status(400).json({ error: 'No filename provided' });
    }

    // For Pages API Routes, we pass the request directly
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return res.status(500).json({ 
      error: 'Failed to upload file', 
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