export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://b0urbaki7.github.io'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { steamId } = req.query;
  const STEAM_API_KEY = process.env.STEAM_API_KEY;

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    
    const data = await response.json();
    const player = data.response.players[0];
    
    if (player) {
      res.status(200).json(player);
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
}