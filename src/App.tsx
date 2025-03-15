import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png';

// Define types based on your API response structure
interface Team {
  id: number;
  name: string;
  logo: string;
}

interface TeamScores {
  quarter_1: number | null;
  quarter_2: number | null;
  quarter_3: number | null;
  quarter_4: number | null;
  over_time: number | null;
  total: number | null;
}

interface Status {
  timer: string | null;
  long: string;
  short: string;
}

interface League {
  id: number;
  name: string;
  type: string;
  season: string;
  logo: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
}

interface Game {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  stage: string | null;
  week: string | null;
  venue: string | null;
  status: Status;
  league: League;
  country: Country;
  teams: {
    home: Team;
    away: Team;
  };
  scores: {
    home: TeamScores;
    away: TeamScores;
  };
}

interface Odds {
  moneylineHome: string;
  spreadHome: string;
  spreadHomeOdds: string;
  moneylineAway: string;
  spreadAway: string;
  spreadAwayOdds: string;
}

interface Predictions {
  prediction: string;
  edge: string;
}

interface ApiData {
  predictions: Predictions | null;
  odds: Odds;
  game: Game;
}

function App() {
  const [data, setData] = useState<ApiData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isShowingTomorrow, setIsShowingTomorrow] = useState<boolean>(false);

  // Function to toggle between today and tomorrow
  const handleToggleDay = () => {
    const newDate = new Date();
    if (!isShowingTomorrow) {
      // Show tomorrow
      newDate.setDate(newDate.getDate() + 1);
    }
    // Otherwise show today (newDate is already set to today)

    setCurrentDate(newDate);
    setIsShowingTomorrow(!isShowingTomorrow);
  };

  // Format date for API call (YYYY-MM-DD)
  const formatDateForApi = (date: Date) => {
    // Format date in PST/PDT timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    // Get date parts in PST
    const pstDate = new Intl.DateTimeFormat('en-US', options).format(date);

    // Convert from MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = pstDate.split('/');
    return `${year}-${month}-${day}`;
  };

  // Function to handle viewing tomorrow's games
  const handleViewTomorrowGames = () => {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    setCurrentDate(tomorrow);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const formattedDate = formatDateForApi(currentDate);
        const response = await fetch(`https://jumper-api-production.up.railway.app/jumper/schedule?date=${formattedDate}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
        setData(Array.isArray(result) ? result : [result]);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]); // Re-fetch when currentDate changes

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date for header display
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${datePart}`;
  };

  return (
      <div className="App">
        <header className="App-header">

          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <div className="date-navigation">
            <button
                className="date-button"
                onClick={handleToggleDay}
                disabled={loading}
            >
              {isShowingTomorrow ? "Check today's games" : "Check tomorrow's games"}
            </button>
          </div>

          {loading && <p>Loading game data...</p>}
          {error && <p className="error">Error: {error}</p>}

          {/* Game display section */}
          {data && data.length > 0 && (
              <div className="games-container">
                <h2>Games for {formatDateHeader(data[0].game.date)}</h2>

                {data.map((gameData, index) => (
                    <div key={gameData.game.id} className="game-data">
                      <h2>Game {index + 1}</h2>

                      {gameData.game.teams && (
                          <div className="teams-container">
                            <div className="team home-team">
                              <img
                                  src={gameData.game.teams.home.logo}
                                  alt={`${gameData.game.teams.home.name} logo`}
                                  className="team-logo"
                              />
                              <h3>{gameData.game.teams.home.name}</h3>
                            </div>

                            <div className="vs">VS</div>

                            <div className="team away-team">
                              <img
                                  src={gameData.game.teams.away.logo}
                                  alt={`${gameData.game.teams.away.name} logo`}
                                  className="team-logo"
                              />
                              <h3>{gameData.game.teams.away.name}</h3>
                            </div>
                          </div>
                      )}

                      <div className="game-info">
                        <p><strong>Date & Time:</strong> {formatDate(gameData.game.date)}</p>
                        <p><strong>League:</strong> {gameData.game.league?.name} ({gameData.game.league?.season})</p>
                        <p><strong>Status:</strong> {gameData.game.status?.long}</p>
                      </div>

                      {gameData.odds && (
                          <div className="odds-info">
                            <h3>Betting Odds</h3>
                            <p><strong>Home Spread:</strong> {gameData.odds.spreadHome}
                              {gameData.odds.spreadHome !== "No odds currently available for this game" && (
                                  <> ({gameData.odds.spreadHomeOdds})</>
                              )}
                            </p>
                            <p><strong>Away Spread:</strong> {gameData.odds.spreadAway}
                              {gameData.odds.spreadAway !== "No odds currently available for this game" && (
                                  <> ({gameData.odds.spreadAwayOdds})</>
                              )}
                            </p>
                            <p><strong>Home Moneyline:</strong> {gameData.odds.moneylineHome}</p>
                            <p><strong>Away Moneyline:</strong> {gameData.odds.moneylineAway}</p>
                          </div>
                      )}

                      {gameData.predictions ? (
                          <div className="prediction-info">
                            <h2>CONCLUSION</h2>
                            <p><strong>Prediction:</strong> {gameData.predictions.prediction}</p>
                            <p><strong>Edge:</strong> {gameData.predictions.edge}</p>
                          </div>
                      ) : (
                          <div className="prediction-info">
                            <h2>CONCLUSION</h2>
                            <p><strong>No prediction available</strong></p>
                            <p><strong>Edge:</strong> Not available</p>
                          </div>
                      )}

                    </div>
                ))}
              </div>
          )}

          {data && data.length === 0 && (
              <p>No games scheduled for this date.</p>
          )}
        </header>
      </div>
  );
}

export default App;
