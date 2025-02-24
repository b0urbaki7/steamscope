export default async function handler(req, res) {
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