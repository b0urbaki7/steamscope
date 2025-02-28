import React, { useState, useEffect, useRef } from 'react';

// Custom hooks
import useSteamData from '../hooks/useSteamData';

// Components
import Header from './Header';
import SteamInputForm from './SteamInputForm';
import HoroscopeDisplay from './HoroscopeDisplay';
import ShareModal from './ShareModal';
import GameLibrary from './GameLibrary';

const SteamLibrary = () => {
  const {
    steamInput,
    setSteamInput,
    games,
    loading,
    error,
    horoscope,
    userName,
    totalPlaytime,
    fetchLibrary
  } = useSteamData();

  // UI state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFormat, setShareFormat] = useState('tall'); // 'tall' or 'wide'
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header with title and dark mode toggle */}
        <Header isDark={isDark} toggleDarkMode={toggleDarkMode} />
        <SteamInputForm
          steamInput={steamInput}
          setSteamInput={setSteamInput}
          loading={loading}
          error={error}
          fetchLibrary={fetchLibrary}
        />

        {/* Horoscope display */}
        <HoroscopeDisplay
          horoscope={horoscope}
          games={games}
          setShowShareModal={setShowShareModal}
        />
        
        {/* Share Modal */}
        <ShareModal
          showShareModal={showShareModal}
          setShowShareModal={setShowShareModal}
          shareFormat={shareFormat}
          setShareFormat={setShareFormat}
          userName={userName}
          games={games}
          totalPlaytime={totalPlaytime}
          horoscope={horoscope}
        />
        {/* Game Library */}
        <GameLibrary games={games} />
      </div>
    </div>
  );
};

export default SteamLibrary;