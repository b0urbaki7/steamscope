import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SteamLibrary = () => {
  const [steamId, setSteamId] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLibrary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Replace with your serverless function URL
      const response = await fetch(`/api/steam-library?steamId=${steamId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Steam library');
      }
      
      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      setError('Failed to fetch Steam library. Please check the Steam ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <form onSubmit={fetchLibrary} className="space-y-4">
        <div>
          <label htmlFor="steamId" className="block text-sm font-medium mb-2">
            Steam ID
          </label>
          <input
            id="steamId"
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="Enter your Steam ID"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Loading...
            </span>
          ) : (
            'Fetch Library'
          )}
        </button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {games.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Library</h2>
          <div className="grid gap-4">
            {games.map((game) => (
              <div
                key={game.appid}
                className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{game.name}</h3>
                <p className="text-sm text-gray-600">
                  Playtime: {Math.round(game.playtime_forever / 60)} hours
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamLibrary;