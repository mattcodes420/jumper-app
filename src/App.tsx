import React, { useState, useEffect } from 'react';
import './App.css';

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

interface ApiData {
  predictions: any | null;
  odds: Odds;
  game: Game;
}

function App() {
// Change this line:
  const [data, setData] = useState<ApiData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const response = await fetch(`http://localhost:8081/jumper/schedule?date=${formattedDate}`);

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
  }, []);

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

  return (
      <div className="App">
        <header className="App-header">
          <h1>Basketball Game Information</h1>

          {loading && <p>Loading game data...</p>}
          {error && <p className="error">Error: {error}</p>}

          {/* Game display section */}
          {data && data.length > 0 && (
              <div className="games-container">
                <h2>Games for {formatDate(data[0].game.date)}</h2>

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
                            <p><strong>Home Spread:</strong> {gameData.odds.spreadHome} ({gameData.odds.spreadHomeOdds})</p>
                            <p><strong>Away Spread:</strong> {gameData.odds.spreadAway} ({gameData.odds.spreadAwayOdds})</p>
                            <p><strong>Home Moneyline:</strong> {gameData.odds.moneylineHome}</p>
                            <p><strong>Away Moneyline:</strong> {gameData.odds.moneylineAway}</p>
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </header>
      </div>
  );
}

export default App;