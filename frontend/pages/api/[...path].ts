import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// This is a catch-all API route that forwards requests to the backend
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';

  try {
    const result = await httpProxyMiddleware(req, res, {
      target: backendUrl,
      pathRewrite: [
        {
          patternStr: '^/api',
          replaceStr: '/api',
        },
      ],
      changeOrigin: true,
    });

    return result;
  } catch (error: any) {
    console.error('API proxy error:', error);
    
    // Respond with a proper error message
    return res.status(502).json({
      error: 'Bad Gateway',
      message: 'Unable to connect to backend service',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
} 