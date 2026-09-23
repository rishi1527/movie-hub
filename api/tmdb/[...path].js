/* global process */
/**
 * Vercel Serverless Function: /api/tmdb/[...path]
 * Catch-all handler for all TMDB API proxy subpaths in production on Vercel.
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

  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'TMDB_API_KEY is not configured in server environment variables.',
    });
  }

  try {
    // Determine endpoint from req.query.path (Vercel catch-all) or req.url
    let endpoint = '';
    if (req.query && req.query.path) {
      if (Array.isArray(req.query.path)) {
        endpoint = '/' + req.query.path.join('/');
      } else {
        endpoint = '/' + req.query.path;
      }
    } else {
      const parsedUrl = new URL(req.url, 'http://localhost');
      endpoint = parsedUrl.pathname.replace(/^\/api\/tmdb/, '');
      if (parsedUrl.searchParams.has('endpoint')) {
        endpoint = parsedUrl.searchParams.get('endpoint');
      }
    }

    if (!endpoint || endpoint === '/') {
      endpoint = '/trending/movie/day';
    }
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    // Build query parameters, omitting the internal 'path' / 'endpoint' query params from Vercel
    const parsedUrl = new URL(req.url, 'http://localhost');
    const searchParams = new URLSearchParams(parsedUrl.searchParams);
    searchParams.delete('path');
    searchParams.delete('endpoint');

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
