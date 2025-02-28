import React from 'react';
import { Share2 } from 'lucide-react';

const HoroscopeDisplay = ({ horoscope, games, setShowShareModal }) => {
  if (!horoscope) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Your Gaming Horoscope</h2>
        {games.length > 0 && (
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        )}
      </div>
      <p className="text-gray-700 dark:text-gray-300 italic">{horoscope}</p>
    </div>
  );
};

export default HoroscopeDisplay;