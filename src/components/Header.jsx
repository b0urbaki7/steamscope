import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = ({ isDark, toggleDarkMode }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold dark:text-white">SteamScope</h1>
      <div className="flex space-x-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors dark:text-white"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default Header;