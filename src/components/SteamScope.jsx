import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Clock, Monitor, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SteamLibrary = () => {
  const [steamId, setSteamId] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => {
    // Check if user previously selected dark mode
    return document.documentElement.classList.contains('dark');
  });


  const API_BASE = import.meta.env.PROD 
  ? 'https://steamscope.vercel.app'
  : '';

  useEffect(() => {
    // Apply dark mode on initial load
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

  const fetchLibrary = async (e) => {
    e.preventDefault();
    
    if (!validateSteamId(steamId)) {
      setError('Please enter a valid Steam64 ID (17 digits)');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/steam-library?steamId=${steamId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Steam library');
      }
      
      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch Steam library. Please check the Steam ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold dark:text-white">Steam Library Viewer</h1>
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
              <label htmlFor="steamId" className="block text-sm font-medium mb-2 dark:text-gray-200">
                Steam64 ID
              </label>
              <div className="space-y-2">
                <input
                  id="steamId"
                  type="text"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="Enter your 17-digit Steam64 ID"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? Find your Steam64 ID at{' '}
                  <a
                    href="https://steamid.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    steamid.io
                  </a>
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
                  Loading Library...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Monitor className="mr-2" size={16} />
                  View Library
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