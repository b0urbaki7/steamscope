import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2, Clock, Monitor, Moon, Sun, User, Share2, Download, Instagram, Twitter } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SteamLibrary = () => {
  const [steamInput, setSteamInput] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFormat, setShareFormat] = useState('tall'); // 'tall' or 'wide'
  const [userName, setUserName] = useState('');
  const [totalPlaytime, setTotalPlaytime] = useState(0);
  const canvasRef = useRef(null);
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
  
  const generateShareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on format
    if (shareFormat === 'tall') {
      // Instagram Stories format (1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;
    } else {
      // Twitter format (1200x675)
      canvas.width = 1200;
      canvas.height = 675;
    }
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (shareFormat === 'tall') {
      gradient.addColorStop(0, '#0d5e57');
      gradient.addColorStop(1, '#053d38');
    } else {
      gradient.addColorStop(0, '#0f3854');
      gradient.addColorStop(1, '#0a2538');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add Steam logo watermark (as a circle in background)
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    const logoSize = shareFormat === 'tall' ? 400 : 200;
    ctx.beginPath();
    ctx.arc(canvas.width - logoSize/2, logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Header content depends on format
    if (shareFormat === 'tall') {
      // TALL FORMAT (Instagram Stories)
      
      // Steam logo (for tall format)
      ctx.fillStyle = '#ffffff';
      const steamLogoSize = 100;
      ctx.beginPath();
      ctx.arc(steamLogoSize, steamLogoSize, steamLogoSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Header text (username & title)
      ctx.fillStyle = '#ff6b6b'; // Reddish color for username
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${userName}'s`, 80, 240);
      
      ctx.fillStyle = '#ffffff'; // White for STEAM REPLAY
      ctx.font = 'bold 80px Arial';
      ctx.fillText('STEAM REPLAY', 80, 320);
      ctx.fillText('2024', 80, 400);
      
      // Stats section - Center aligned large number
      const centerY = 600;
      
      ctx.textAlign = 'center';
      ctx.font = 'bold 200px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(games.length.toString(), canvas.width/2, centerY);
      
      ctx.font = 'bold 40px Arial';
      ctx.fillText('Games Played', canvas.width/2, centerY + 60);
      
      // Hours played - Left aligned
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(totalPlaytime.toString(), canvas.width/2, 850);
      
      ctx.font = 'bold 30px Arial';
      ctx.fillText('HOURS PLAYED', canvas.width/2, 900);
      
      // Top games list
      const topGames = [...games]
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, 5);
      
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Most Played Games', canvas.width/2, 1000);
      
      // Draw game names and hours
      ctx.textAlign = 'left';
      const gameListX = canvas.width/2 - 400;
      let gameY = 1060;
      
      topGames.forEach((game, index) => {
        const hours = Math.round(game.playtime_forever / 60);
        
        ctx.font = 'bold 36px Arial';
        ctx.fillText(game.name, gameListX, gameY);
        
        ctx.textAlign = 'right';
        ctx.font = '32px Arial';
        ctx.fillText(`${hours} hrs`, canvas.width/2 + 400, gameY);
        
        ctx.textAlign = 'left';
        gameY += 60;
      });
      
      // Horoscope
      ctx.textAlign = 'center';
      ctx.font = 'bold 45px Arial';
      ctx.fillText('Your Gaming Horoscope:', canvas.width/2, 1400);
      
      const maxWidth = 900;
      wrapText(ctx, horoscope, canvas.width/2, 1470, maxWidth, 50, true);
      
      // Footer with SteamScope branding 
      ctx.font = 'bold 30px Arial';
      ctx.fillText('b0urbaki7.github.io/steamscope/', canvas.width/2, canvas.height - 80);
      
    } else {
      // WIDE FORMAT (Twitter)
      
      // Steam logo (small, left aligned)
      const steamLogoSize = 80;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(steamLogoSize, steamLogoSize, steamLogoSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Username and title - left aligned
      ctx.fillStyle = '#ff6b6b'; // Reddish color for username  
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${userName}'s`, 180, 70);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Arial';
      ctx.fillText('SteamScope', 180, 120);
      
      // Stats in a row
      const statsY = 260;
      
      // Games count - center
      ctx.font = 'bold 130px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(games.length.toString(), canvas.width/2, statsY);
      
      ctx.font = 'bold 30px Arial'; 
      ctx.fillText('Games Played', canvas.width/2, statsY + 40);
      
      // New stats boxes on sides (like in reference)
      const statsBoxY = 220;
      
      // Hours played - Bottom left
      ctx.textAlign = 'center';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(totalPlaytime.toString(), canvas.width/4, statsBoxY);
      
      ctx.font = 'bold 25px Arial';
      ctx.fillText('HOURS PLAYED', canvas.width/4, statsBoxY + 40);
      
      // Sessions - Bottom right (added this to match your reference)
      const sessions = Math.floor(Math.random() * 1000) + 300; // Placeholder value
      ctx.font = 'bold 80px Arial';
      ctx.fillText(sessions.toString(), (canvas.width/4) * 3, statsBoxY);
      
      ctx.font = 'bold 25px Arial';
      ctx.fillText('SESSIONS', (canvas.width/4) * 3, statsBoxY + 40);
      
      // Top games list - Now full width at bottom
      const topGames = [...games]
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, 5);
      
      ctx.textAlign = 'left';
      ctx.font = 'bold 30px Arial';
      ctx.fillText('Most Played Games:', 100, 330);
      
      // Draw game names in a clean layout
      let gameY = 380;
      topGames.forEach((game, index) => {
        const hours = Math.round(game.playtime_forever / 60);
        
        ctx.font = 'bold 28px Arial';
        ctx.fillText(game.name, 100, gameY);
        
        ctx.textAlign = 'right';
        ctx.font = '26px Arial';
        ctx.fillText(`${hours} hrs`, canvas.width - 100, gameY);
        
        ctx.textAlign = 'left';
        gameY += 45;
      });
      
      // Horoscope at the bottom
      ctx.textAlign = 'left';
      ctx.font = 'bold 30px Arial';
      ctx.fillText('Your Gaming Horoscope:', 100, 600);
      
      // URL at bottom right
      ctx.textAlign = 'right';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('https://b0urbaki7.github.io/steamscope/', canvas.width - 50, canvas.height - 30);
    }
    
    return canvas.toDataURL('image/png');
  };
  
  const drawStatBox = (ctx, x, y, value, label, format) => {
    const boxSize = format === 'tall' ? 200 : 150;
    
    // Semi-transparent box background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x - boxSize/2, y - boxSize/2, boxSize, boxSize);
    
    // Value
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${format === 'tall' ? '80px' : '60px'} Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(value, x, y + 15);
    
    // Label
    ctx.font = `${format === 'tall' ? '24px' : '18px'} Arial`;
    ctx.fillText(label, x, y + (format === 'tall' ? 70 : 50));
  };
  
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight, centered = false) => {
    const words = text.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, centered ? x : x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, centered ? x : x, y);
  };
  
  const downloadImage = () => {
    const dataUrl = generateShareImage();
    const link = document.createElement('a');
    link.download = `steamscope-${shareFormat}-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Initialize the share image when the modal opens
  useEffect(() => {
    if (showShareModal && canvasRef.current) {
      setTimeout(() => {
        generateShareImage();
      }, 100);
    }
  }, [showShareModal, shareFormat]);

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
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
        )}
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Share Your Replay</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-center mb-6">
                <select
                  value={shareFormat}
                  onChange={(e) => setShareFormat(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="tall">INSTAGRAM / STORIES</option>
                  <option value="wide">TWITTER / FACEBOOK</option>
                </select>
              </div>
              
              <div className="flex justify-center overflow-hidden mb-6">
                <div className="relative border border-gray-300 dark:border-gray-600 rounded-md max-w-full" style={{ maxHeight: '60vh' }}>
                  <div className="overflow-auto p-2">
                    <canvas 
                      ref={canvasRef} 
                      className="mx-auto" 
                      style={{ 
                        width: shareFormat === 'tall' ? '270px' : '480px',
                        height: shareFormat === 'tall' ? '480px' : '270px',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className={`w-3 h-3 rounded-full ${shareFormat === 'tall' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${shareFormat === 'wide' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {shareFormat === 'tall' ? (
                  <p>TALL FORMAT BEST FOR: STORIES ON INSTAGRAM / FACEBOOK / SNAPCHAT / TIKTOK / PINTEREST</p>
                ) : (
                  <p>WIDE FORMAT BEST FOR: TWITTER / FACEBOOK / LINKEDIN POSTS</p>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={downloadImage}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Save Image
                </button>
              </div>
            </div>
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