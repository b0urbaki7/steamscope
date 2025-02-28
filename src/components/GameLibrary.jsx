import React from 'react';
import { Clock } from 'lucide-react';

const GameItem = ({ game }) => {
  return (
    <div className="p-4 border rounded-md shadow-sm hover:shadow-md transition-all dark:bg-gray-700 dark:border-gray-600">
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
  );
};

const GameLibrary = ({ games }) => {
  if (!games.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Game Library</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{games.length} games found</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <GameItem key={game.appid} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameLibrary;