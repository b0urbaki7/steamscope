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

  const { vanityUrl } = req.query;
  const STEAM_API_KEY = process.env.STEAM_API_KEY;

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`
    );
    
    const data = await response.json();
    
    if (data.response.success === 1) {
      res.status(200).json({ steamId: data.response.steamid });
    } else {
      res.status(404).json({ error: 'Could not find Steam ID for this vanity URL' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve vanity URL' });
  }
}