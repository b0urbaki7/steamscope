// horoscopeGenerator.js
/**
 * Functions for generating gaming horoscopes based on Steam library data
 */

/**
 * Generate a horoscope based on a user's game library and playtime
 * 
 * @param {Array} games - Array of game objects with name and playtime data
 * @returns {string} Generated horoscope text
 */
export const generateHoroscope = (games) => {
    const personalities = [];
    
    // Calculate total playtime
    const totalPlaytime = games.reduce((acc, game) => acc + game.playtime_forever, 0) / 60;
    
    // Check for specific games and their playtime
    analyzeSpecificGames(games, personalities);
    
    // Add general observations based on total playtime
    if (totalPlaytime > 5000) {
      personalities.push("Your Steam library is basically a second mortgage at this point.");
    } else if (totalPlaytime < 10) {
      personalities.push("Either you're new here or this is your 'homework' account.");
    }
    
    // Analyze game genres (placeholder for future enhancement)
    // analyzeGameGenres(games, personalities);
    
    // Analyze playtime patterns (placeholder for future enhancement)
    // analyzePlatformPatterns(games, personalities);
  
    return personalities.length > 0 
      ? personalities.join(' ') 
      : "You're surprisingly normal. We'll need to fix that.";
  };
  
  /**
   * Analyze specific games in the library and add personality traits
   * 
   * @param {Array} games - Array of game objects
   * @param {Array} personalities - Array to be populated with personality traits
   */
  const analyzeSpecificGames = (games, personalities) => {
    games.forEach(game => {
      const playtime = game.playtime_forever / 60; // Convert to hours
      const gameName = game.name.toLowerCase();
      
      // Strategy/Building games
      if (gameName === 'factorio' && playtime > 100) {
        personalities.push("You're definitely an engineer - or wish you were one. You see conveyor belts in your dreams.");
      }
      
      // FPS games
      if (gameName === 'team fortress 2' && playtime > 50) {
        personalities.push("A true boomer gamer who probably still misses the Orange Box days.");
      }
      
      // MOBAs
      if (gameName === 'dota 2' && playtime > 1000) {
        personalities.push("Touch grass. Please. Your family misses you.");
      }
      
      // Farming/Life Sims
      if (gameName === 'stardew valley') {
        personalities.push("You've definitely googled 'how to quit job and start farm' at least once.");
      }
      
      // Difficult/Soulslike games
      if (gameName === 'dark souls') {
        personalities.push("You're not a masochist, you just 'appreciate the challenge', right?");
      }
    });
  };
  
  /**
   * Get additional horoscope data about the user's library
   * 
   * @param {Array} games - Array of game objects
   * @returns {Object} Additional statistics and analysis
   */
  export const getHoroscopeStats = (games) => {
    // This function can be expanded to provide additional statistics
    // for display alongside the horoscope text
    
    const totalGames = games.length;
    const totalPlaytime = Math.round(games.reduce((acc, game) => acc + game.playtime_forever, 0) / 60);
    
    const playedRecently = games.filter(game => game.playtime_2weeks > 0).length;
    const percentCompleted = Math.round((games.filter(game => game.playtime_forever > 120).length / totalGames) * 100);
    
    return {
      totalGames,
      totalPlaytime,
      playedRecently,
      percentCompleted
    };
  };