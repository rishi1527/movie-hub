/* global process */
/**
 * Vercel Serverless Function: /api/tmdb
 * Handles all TMDB API proxy requests in production on Vercel.
 *
 * Requirements:
 * - Uses process.env.TMDB_API_KEY exclusively (server-side only)
 * - Injects api_key and default language=en-US
 * - Strips internal routing parameters (path, endpoint)
 * - Transparently handles all subpaths: /movie/popular, /trending/movie/day, /movie/550, etc.
 * - Always returns JSON (never index.html)
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Pure server-side API key injection (process.env.TMDB_API_KEY or process.env.VITE_TMDB_API_KEY)
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'TMDB_API_KEY is not configured in server environment variables.',
    });
  }

  try {
    // 1. Resolve target endpoint from req.query.path (Vercel rewrite) or req.url
    let endpoint = '';

    if (req.query && req.query.path) {
      if (Array.isArray(req.query.path)) {
        endpoint = req.query.path.join('/');
      } else {
        endpoint = String(req.query.path);
      }
    } else if (req.query && req.query.endpoint) {
      endpoint = String(req.query.endpoint);
    } else {
      const rawUrl = req.headers['x-matched-path'] || req.url || '';
      const parsedUrl = new URL(rawUrl, 'http://localhost');
      if (parsedUrl.searchParams.has('path')) {
        endpoint = parsedUrl.searchParams.get('path');
      } else if (parsedUrl.searchParams.has('endpoint')) {
        endpoint = parsedUrl.searchParams.get('endpoint');
      } else {
        endpoint = parsedUrl.pathname.replace(/^\/api\/tmdb\/?/, '');
      }
    }

    if (!endpoint || endpoint === '/') {
      endpoint = '/trending/movie/day';
    }
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    // 2. Build outgoing query parameters
    const parsedUrl = new URL(req.url, 'http://localhost');
    const searchParams = new URLSearchParams(parsedUrl.searchParams);

    // If req.query contains additional query params passed by framework
    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (!searchParams.has(key) && key !== 'path' && key !== 'endpoint') {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
          }
        }
      });
    }

    // Remove internal routing query parameters
    searchParams.delete('path');
    searchParams.delete('endpoint');

    // Automatically inject server-side api_key and default language
    searchParams.set('api_key', apiKey);
    if (!searchParams.has('language')) {
      searchParams.set('language', 'en-US');
    }

    const tmdbUrl = `https://api.themoviedb.org/3${endpoint}?${searchParams.toString()}`;

    const response = await fetch(tmdbUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MovieHub-Vercel/1.0',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, max-age=300, stale-while-revalidate=1800'
    );

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch data from TMDB API',
      details: error.message,
    });
  }
}
