// shareImageGenerator.js
/**
 * Utility functions for generating shareable images from Steam library data
 */

/**
 * Wraps text within a max width by breaking it into multiple lines
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} lineHeight - Height of each line
 * @param {boolean} centered - Whether text should be centered
 */
export const wrapText = (ctx, text, x, y, maxWidth, lineHeight, centered = false) => {
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
  
  /**
   * Draws a stat box with a value and label
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position (center)
   * @param {number} y - Y position (center)
   * @param {string|number} value - Value to display
   * @param {string} label - Label text
   * @param {string} format - 'tall' or 'wide' format
   */
  export const drawStatBox = (ctx, x, y, value, label, format) => {
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
  
  /**
   * Generates a shareable image based on Steam library data
   * 
   * @param {HTMLCanvasElement} canvas - Canvas element reference
   * @param {string} shareFormat - 'tall' or 'wide' format
   * @param {string} userName - Steam user name
   * @param {Array} games - Array of game objects
   * @param {number} totalPlaytime - Total playtime in hours
   * @param {string} horoscope - Generated horoscope text
   * @returns {string} Data URL of the generated image
   */
  export const generateShareImage = (canvas, shareFormat, userName, games, totalPlaytime, horoscope) => {
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