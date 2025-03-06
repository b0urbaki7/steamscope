// horoscopeGenerator.js
/**
 * Enhanced functions for generating gaming horoscopes based on Steam library data
 */

// Import game and genre data (these would be separate JSON files)
import gameHoroscopeData from '../data/gameHoroscopes.json';
import genreHoroscopeData from '../data/genreHoroscopes.json';

/**
 * Generate a horoscope based on a user's game library and playtime
 * 
 * @param {Array} games - Array of game objects with name and playtime data
 * @param {Object} appDetails - Object containing game details including genres
 * @returns {string} Generated horoscope text
 */
export const generateHoroscope = (games, appDetails = {}) => {
  const insights = [];
  
  // Calculate total playtime
  const totalPlaytime = games.reduce((acc, game) => acc + (game.playtime_forever || 0), 0) / 60;
  
  // Sort games by playtime (descending)
  const sortedGames = [...games].sort((a, b) => 
    (b.playtime_forever || 0) - (a.playtime_forever || 0)
  );
  
  // Get top played games
  const topGames = sortedGames.slice(0, 5);
  
  // 1. Check for game-specific insights (for top games)
  const gameSpecificInsights = getGameSpecificInsights(topGames);
  insights.push(...gameSpecificInsights);
  
  // 2. Analyze game genres
  const genreInsights = getGenreInsights(games, appDetails);
  insights.push(...genreInsights);
  
  // 3. Add playtime pattern insights
  const patternInsights = getPlaytimePatternInsights(games, totalPlaytime);
  insights.push(...patternInsights);
  
  // 4. Add random predictions based on library composition
  const predictions = getPredictions(games, appDetails);
  if (predictions) {
    insights.push(predictions);
  }
  
  // Ensure we have at least a default message
  if (insights.length === 0) {
    insights.push("You're surprisingly normal. We'll need to fix that.");
  }
  
  // Combine insights into a cohesive horoscope
  // Take 2-4 random insights to keep it concise
  const selectedInsights = shuffleAndSelect(insights, Math.min(
    Math.max(2, Math.floor(insights.length / 2)), 
    4
  ));
  
  return selectedInsights.join(' ');
};

/**
 * Get specific insights for individual games in the user's library
 * 
 * @param {Array} games - Array of top played games
 * @returns {Array} Game-specific personality insights
 */
const getGameSpecificInsights = (games) => {
  const insights = [];
  
  games.forEach(game => {
    const appId = game.appid.toString();
    const playtime = (game.playtime_forever || 0) / 60; // Convert to hours
    
    // Check if we have specific insights for this game
    if (gameHoroscopeData[appId]) {
      const gameData = gameHoroscopeData[appId];
      
      // Determine which description to use based on playtime thresholds
      if (playtime >= gameData.thresholds?.obsessed) {
        insights.push(gameData.longDesc);
      } else if (playtime >= gameData.thresholds?.dedicated) {
        insights.push(gameData.mediumDesc || gameData.shortDesc);
      } else if (playtime >= gameData.thresholds?.casual) {
        insights.push(gameData.shortDesc);
      }
    } else {
      // Fallback for games not in our database but with significant playtime
      if (playtime > 500) {
        insights.push(`You've spent ${Math.floor(playtime)} hours in ${game.name}. That's dedication... or something.`);
      } else if (playtime > 100) {
        insights.push(`${game.name} seems to have captured your attention. Interesting choice.`);
      }
    }
  });
  
  return insights;
};

/**
 * Analyze the genres present in the user's library
 * 
 * @param {Array} games - Array of game objects
 * @param {Object} appDetails - Object containing game details including genres
 * @returns {Array} Genre-based insights
 */
const getGenreInsights = (games, appDetails) => {
  const insights = [];
  const genreCounts = {};
  let totalGamesWithGenres = 0;
  
  // Count genres across the library
  games.forEach(game => {
    const appId = game.appid.toString();
    const gameDetails = appDetails[appId]?.data;
    
    if (gameDetails?.genres) {
      totalGamesWithGenres++;
      
      gameDetails.genres.forEach(genre => {
        const genreName = genre.description;
        genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
      });
    }
  });
  
  // Calculate percentages and identify top genres
  const genrePercentages = {};
  const topGenres = [];
  
  if (totalGamesWithGenres > 0) {
    Object.keys(genreCounts).forEach(genre => {
      genrePercentages[genre] = (genreCounts[genre] / totalGamesWithGenres) * 100;
      
      if (genrePercentages[genre] > 30) {
        topGenres.push(genre);
      }
    });
  }
  
  // Generate insights based on genre dominance
  if (topGenres.length > 0) {
    // Check for insights from our genre database
    topGenres.forEach(genre => {
      if (genreHoroscopeData[genre] && genreHoroscopeData[genre].length > 0) {
        const randomIndex = Math.floor(Math.random() * genreHoroscopeData[genre].length);
        insights.push(genreHoroscopeData[genre][randomIndex]);
      }
    });
    
    // Fallback hardcoded insights until our JSON is populated
    if (insights.length === 0) {
      // Action games
      if (topGenres.includes('Action')) {
        insights.push("Violence is always your answer, isn't it? Your game library suggests you prefer solving problems with a higher body count.");
      }
      
      // RPG games
      if (topGenres.includes('RPG')) {
        insights.push("In real life, you can't just reload a save when conversation goes poorly. Maybe that's why you spend so much time with RPGs.");
      }
      
      // Strategy games
      if (topGenres.includes('Strategy')) {
        insights.push("You approach life like a game of chess, always planning several moves ahead. Or you just like to feel smarter than everyone else.");
      }
      
      // Simulation games
      if (topGenres.includes('Simulation')) {
        insights.push("You simulate alternate lives because reality is too pedestrian. Or maybe you're just practicing for when you actually go outside.");
      }
      
      // Indie games
      if (topGenres.includes('Indie')) {
        insights.push("Your preference for indie games says you're either genuinely appreciative of artistic expression, or just love telling people 'I played it before it was cool.'");
      }
      
      // Free to Play
      if (topGenres.includes('Free to Play')) {
        insights.push("Your wallet thanks you for all those 'free' games you've spent hundreds on.");
      }
    }
    
    // Add insight about genre diversity
    if (Object.keys(genreCounts).length > 10) {
      insights.push("Your game selection is remarkably diverse. You either have eclectic tastes or severe commitment issues.");
    } else if (Object.keys(genreCounts).length < 3) {
      insights.push("You know there are other genres besides " + topGenres.join(' and ') + ", right?");
    }
  }
  
  return insights;
};

/**
 * Analyze playtime patterns in the user's library
 * 
 * @param {Array} games - Array of game objects
 * @param {number} totalPlaytime - Total hours played across all games
 * @returns {Array} Playtime pattern insights
 */
const getPlaytimePatternInsights = (games, totalPlaytime) => {
  const insights = [];
  
  // Calculate total games and average playtime
  const totalGames = games.length;
  const averagePlaytime = totalGames > 0 ? totalPlaytime / totalGames : 0;
  
  // Count unplayed or barely played games
  const unplayedCount = games.filter(game => (game.playtime_forever || 0) < 60).length;
  const unplayedPercentage = (unplayedCount / totalGames) * 100;
  
  // Check for recent activity
  const recentlyPlayedCount = games.filter(game => (game.playtime_2weeks || 0) > 0).length;
  
  // Generate insights
  if (totalPlaytime > 5000) {
    insights.push("Your Steam library is basically a second mortgage at this point.");
  } else if (totalPlaytime < 10) {
    insights.push("Either you're new here or this is your 'homework' account.");
  }
  
  if (unplayedPercentage > 70) {
    insights.push(`You actually play less than ${Math.round(100 - unplayedPercentage)}% of your library. Steam sales are your weakness.`);
  }
  
  if (averagePlaytime > 50) {
    insights.push("You don't just play games, you commit to them. Or you just fall asleep with them running.");
  } else if (averagePlaytime < 5 && totalGames > 20) {
    insights.push("You collect games like some people collect stamps, rarely giving them the attention they deserve.");
  }
  
  if (recentlyPlayedCount === 1 && totalGames > 10) {
    insights.push("You've found your one true love among the dozens of games you own. Monogamy is rare these days.");
  } else if (recentlyPlayedCount > 5) {
    insights.push("You've been jumping between games lately. Commitment issues or just a refined palate?");
  }
  
  return insights;
};

/**
 * Generate random predictions based on the user's library
 * 
 * @param {Array} games - Array of game objects
 * @param {Object} appDetails - Object containing game details
 * @returns {string} A random prediction
 */
const getPredictions = (games, appDetails) => {
  const predictions = [
    "Your Steam backlog suggests you'll start another game this week but never finish it.",
    "Consider finally uninstalling that game you haven't touched in 2 years. It's time to let go.",
    "A new game will enter your life soon. You will play it for exactly 2.7 hours before forgetting about it forever.",
    "Your ideal match is someone who doesn't mind when you ignore them for 12 straight hours of gaming.",
    "Now would be a good time to organize your desktop shortcuts. The mess reflects your mental state.",
    "You will buy at least three games in the next sale that you'll never install.",
    "Your future includes carpal tunnel syndrome. Maybe stretch once in a while?",
    "The next game you purchase will either be your new obsession or a complete waste of money. No in-between.",
    "Your gaming chair has formed a spiritual bond with you. Treat it with respect."
  ];
  
  const randomIndex = Math.floor(Math.random() * predictions.length);
  return predictions[randomIndex];
};

/**
 * Randomly shuffle an array and select a subset of elements
 * 
 * @param {Array} array - Array to shuffle and select from
 * @param {number} count - Number of elements to select
 * @returns {Array} Selected elements
 */
const shuffleAndSelect = (array, count) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

/**
 * Get additional horoscope data about the user's library
 * 
 * @param {Array} games - Array of game objects
 * @param {Object} appDetails - Object containing game details
 * @returns {Object} Additional statistics and analysis for display
 */
export const getHoroscopeStats = (games, appDetails = {}) => {
  // Calculate basic stats
  const totalGames = games.length;
  const totalPlaytime = Math.round(games.reduce((acc, game) => acc + (game.playtime_forever || 0), 0) / 60);
  const playedRecently = games.filter(game => (game.playtime_2weeks || 0) > 0).length;
  const percentCompleted = Math.round((games.filter(game => (game.playtime_forever || 0) > 120).length / totalGames) * 100);
  
  // Get top 3 most played games
  const topGames = [...games]
    .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
    .slice(0, 3)
    .map(game => ({
      name: game.name,
      playtime: Math.round((game.playtime_forever || 0) / 60)
    }));
  
  // Calculate genre distribution
  const genreCounts = {};
  let totalGamesWithGenres = 0;
  
  games.forEach(game => {
    const appId = game.appid.toString();
    const gameDetails = appDetails[appId]?.data;
    
    if (gameDetails?.genres) {
      totalGamesWithGenres++;
      
      gameDetails.genres.forEach(genre => {
        const genreName = genre.description;
        genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
      });
    }
  });
  
  // Calculate genre percentages
  const genreDistribution = {};
  
  if (totalGamesWithGenres > 0) {
    Object.keys(genreCounts).forEach(genre => {
      genreDistribution[genre] = Math.round((genreCounts[genre] / totalGamesWithGenres) * 100);
    });
  }
  
  // Determine gaming zodiac sign based on most common genre
  let dominantGenre = '';
  let maxCount = 0;
  
  Object.keys(genreCounts).forEach(genre => {
    if (genreCounts[genre] > maxCount) {
      maxCount = genreCounts[genre];
      dominantGenre = genre;
    }
  });
  
  const zodiacSign = getGamingZodiacSign(dominantGenre);
  
  return {
    totalGames,
    totalPlaytime,
    playedRecently,
    percentCompleted,
    topGames,
    genreDistribution,
    zodiacSign
  };
};

/**
 * Get a gaming zodiac sign based on dominant genre
 * 
 * @param {string} dominantGenre - The user's most common game genre
 * @returns {Object} Zodiac sign information
 */
const getGamingZodiacSign = (dominantGenre) => {
  const signs = {
    'Action': {
      name: 'The Berserker',
      description: 'Quick to act, you charge headfirst into situations with unstoppable energy.',
      element: 'Fire'
    },
    'Adventure': {
      name: 'The Wanderer',
      description: 'Curious and persistent, you value the journey as much as the destination.',
      element: 'Air'
    },
    'RPG': {
      name: 'The Storyteller',
      description: 'You see life as a narrative to be shaped, with yourself as the main character.',
      element: 'Water'
    },
    'Strategy': {
      name: 'The Tactician',
      description: 'Methodical and patient, you prefer to plan several moves ahead.',
      element: 'Earth'
    },
    'Simulation': {
      name: 'The Architect',
      description: 'You find joy in creating systems and watching them evolve.',
      element: 'Water'
    },
    'Sports': {
      name: 'The Competitor',
      description: 'Victory drives you, and you thrive on the thrill of competition.',
      element: 'Fire'
    },
    'Racing': {
      name: 'The Speedster',
      description: 'Always in a hurry, you value efficiency and quick results.',
      element: 'Air'
    },
    'Indie': {
      name: 'The Pioneer',
      description: 'You march to the beat of your own drum and appreciate unique experiences.',
      element: 'Air'
    },
    'Free to Play': {
      name: 'The Opportunist',
      description: 'Value-conscious but potentially impulsive with microtransactions.',
      element: 'Earth'
    },
    'Casual': {
      name: 'The Dabbler',
      description: "You enjoy simple pleasures and don't need complications in your entertainment.",
      element: 'Water'
    }
  };
  
  // Default sign if genre not found
  const defaultSign = {
    name: 'The Eclectic',
    description: 'Your gaming tastes defy categorization, as does your approach to life.',
    element: 'Aether'
  };
  
  return signs[dominantGenre] || defaultSign;
};