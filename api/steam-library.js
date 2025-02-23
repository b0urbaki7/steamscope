// /api/steam-library.js
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    const { steamId } = req.query;
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
  
    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' });
    }
  
    if (!STEAM_API_KEY) {
      return res.status(500).json({ error: 'Steam API key not configured' });
    }
  
    try {
      // Fetch owned games
      const response = await fetch(
        `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch from Steam API');
      }
  
      const data = await response.json();
      
      if (!data.response || !data.response.games) {
        return res.status(404).json({ 
          error: 'No games found or profile is private' 
        });
      }
  
      // Sort games by playtime
      const sortedGames = data.response.games.sort(
        (a, b) => b.playtime_forever - a.playtime_forever
      );
  
      return res.status(200).json({ 
        games: sortedGames 
      });
    } catch (error) {
      console.error('Steam API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch Steam library' 
      });
    }
  }