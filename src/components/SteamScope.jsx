import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Clock, Monitor, Moon, Sun, User } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SteamLibrary = () => {
  const [steamInput, setSteamInput] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const API_BASE = import.meta.env.PROD 
    ? 'https://steamscope.vercel.app'
    : '';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const validateSteamId = (id) => {
    return /^\d{17}$/.test(id);
  };

  const isVanityUrl = (input) => {
    return /^[a-zA-Z0-9_-]+$/.test(input) && !validateSteamId(input);
  };

  const generateHoroscope = (games) => {
    const personalities = [];
    
    // Check for specific games and playtime
    const totalPlaytime = games.reduce((acc, game) => acc + game.playtime_forever, 0) / 60;
    
    games.forEach(game => {
      const playtime = game.playtime_forever / 60; // Convert to hours
      
      switch (game.name.toLowerCase()) {
        case 'factorio':
          if (playtime > 100) personalities.push("You're definitely an engineer - or wish you were one. You see conveyor belts in your dreams.");
          break;
        case 'team fortress 2':
          if (playtime > 50) personalities.push("A true boomer gamer who probably still misses the Orange Box days.");
          break;
        case 'dota 2':
          if (playtime > 1000) personalities.push("Touch grass. Please. Your family misses you.");
          break;
        case 'stardew valley':
          personalities.push("You've definitely googled 'how to quit job and start farm' at least once.");
          break;
        case 'dark souls':
          personalities.push("You're not a masochist, you just 'appreciate the challenge', right?");
          break;
      }
    });

    // Add general observations based on total playtime
    if (totalPlaytime > 5000) {
      personalities.push("Your Steam library is basically a second mortgage at this point.");
    } else if (totalPlaytime < 10) {
      personalities.push("Either you're new here or this is your 'homework' account.");
    }

    return personalities.length > 0 
      ? personalities.join(' ') 
      : "You're surprisingly normal. We'll need to fix that.";
  };

  const resolveVanityUrl = async (vanityUrl) => {
    try {
      const response = await fetch(`${API_BASE}/api/resolve-vanity?vanityUrl=${vanityUrl}`);
      if (!response.ok) {
        throw new Error('Failed to resolve vanity URL');
      }
      const data = await response.json();
      return data.steamId;
    } catch (error) {
      throw new Error('Could not resolve vanity URL to Steam ID');
    }
  };

  const fetchLibrary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let finalSteamId = steamInput;
      
      if (isVanityUrl(steamInput)) {
        finalSteamId = await resolveVanityUrl(steamInput);
      } else if (!validateSteamId(steamInput)) {
        throw new Error('Please enter a valid Steam64 ID or vanity URL');
      }
      
      const response = await fetch(`${API_BASE}/api/steam-library?steamId=${finalSteamId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Steam library');
      }
      
      const data = await response.json();
      setGames(data.games || []);
      setHoroscope(generateHoroscope(data.games || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch Steam library. Please check the input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold dark:text-white">Steam Library Horoscope<p className='text-xs'>by <a className='text-xs' href="https://github.com/b0urbaki7/steamscope">@b0urbaki7</a></p></h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors dark:text-white"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={fetchLibrary} className="space-y-4">
            <div>
              <label htmlFor="steamInput" className="block text-sm font-medium mb-2 dark:text-gray-200">
                Steam ID or Vanity URL
              </label>
              <div className="space-y-2">
                <input
                  id="steamInput"
                  type="text"
                  value={steamInput}
                  onChange={(e) => setSteamInput(e.target.value)}
                  placeholder="Enter Steam64 ID or vanity URL"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your Steam64 ID or custom URL name (e.g., 76561198141342345 or b0urbaki7)
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Reading Your Gaming Fortune...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <User className="mr-2" size={16} />
                  Analyze My Library
                </span>
              )}
            </button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {horoscope && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Your Gaming Horoscope</h2>
            <p className="text-gray-700 dark:text-gray-300 italic">{horoscope}</p>
          </div>
        )}

        {games.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">Game Library</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{games.length} games found</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map((game) => (
                <div
                  key={game.appid}
                  className="p-4 border rounded-md shadow-sm hover:shadow-md transition-all dark:bg-gray-700 dark:border-gray-600"
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold dark:text-white">{game.name}</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {Math.round(game.playtime_forever / 60)} hrs
                      </span>
                    </div>
                  </div>
                  
                  {game.playtime_2weeks > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ▲ {Math.round(game.playtime_2weeks / 60)} hrs past 2 weeks
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SteamLibrary;