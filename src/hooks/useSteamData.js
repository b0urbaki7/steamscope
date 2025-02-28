import { useState } from 'react';
import { generateHoroscope } from '../components/horoscopeGenerator';

const useSteamData = () => {
  const [steamInput, setSteamInput] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [userName, setUserName] = useState('');
  const [totalPlaytime, setTotalPlaytime] = useState(0);

  const API_BASE = import.meta.env.PROD 
    ? 'https://steamscope.vercel.app'
    : '';

  const validateSteamId = (id) => {
    return /^\d{17}$/.test(id);
  };

  const isVanityUrl = (input) => {
    return /^[a-zA-Z0-9_-]+$/.test(input) && !validateSteamId(input);
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
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let finalSteamId = steamInput;
      
      if (isVanityUrl(steamInput)) {
        finalSteamId = await resolveVanityUrl(steamInput);
      } else if (!validateSteamId(steamInput)) {
        throw new Error('Please enter a valid Steam64 ID or vanity URL');
      }
      
      // First fetch user profile to get display name
      const profileResponse = await fetch(`${API_BASE}/api/steam-profile?steamId=${finalSteamId}`);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch Steam profile');
      }
      
      const profileData = await profileResponse.json();
      setUserName(profileData.personaname || 'Steam User');
      
      // Then fetch library
      const response = await fetch(`${API_BASE}/api/steam-library?steamId=${finalSteamId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Steam library');
      }
      
      const data = await response.json();
      const gamesList = data.games || [];
      
      // Calculate total playtime across all games
      const totalHours = gamesList.reduce((total, game) => total + (game.playtime_forever || 0), 0) / 60;
      setTotalPlaytime(Math.round(totalHours));
      
      setGames(gamesList);
      setHoroscope(generateHoroscope(gamesList));
    } catch (err) {
      setError(err.message || 'Failed to fetch Steam library. Please check the input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    steamInput,
    setSteamInput,
    games,
    loading,
    error,
    horoscope,
    userName,
    totalPlaytime,
    fetchLibrary
  };
};

export default useSteamData;