import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
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
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8081/jumper/schedule?date=2025-03-03');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        // Check if the API returns an array or a single object
        //if (Array.isArray(result)) {
          //setData(result[0]); // Take the first item if it's an array
        //} else {
        setData(result);
        //}
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>Basketball Game Information</h1>

          {loading && <p>Loading game data...</p>}
          {error && <p className="error">Error: {error}</p>}

          {/* Debug section */}
          {data && (
              <div className="debug-section" style={{
                textAlign: 'left',
                maxWidth: '800px',
                margin: '20px auto',
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h3>Raw API Response:</h3>
                <pre style={{
                  overflow: 'auto',
                  maxHeight: '200px',
                  background: '#e0e0e0',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
            {JSON.stringify(data, null, 2)}
          </pre>
              </div>
          )}

          {/* Game display section */}
          {data && data.game && (
              <div className="game-data">
                <h2>Game Details</h2>

                {data.game.teams && (
                    <div className="teams-container">
                      <div className="team home-team">
                        <img
                            src={data.game.teams.home.logo}
                            alt={`${data.game.teams.home.name} logo`}
                            className="team-logo"
                        />
                        <h3>{data.game.teams.home.name}</h3>
                      </div>

                      <div className="vs">VS</div>

                      <div className="team away-team">
                        <img
                            src={data.game.teams.away.logo}
                            alt={`${data.game.teams.away.name} logo`}
                            className="team-logo"
                        />
                        <h3>{data.game.teams.away.name}</h3>
                      </div>
                    </div>
                )}

                <div className="game-info">
                  <p><strong>Date & Time:</strong> {formatDate(data.game.date)}</p>
                  <p><strong>League:</strong> {data.game.league?.name} ({data.game.league?.season})</p>
                  <p><strong>Status:</strong> {data.game.status?.long}</p>
                </div>

                {data.odds && (
                    <div className="odds-info">
                      <h3>Betting Odds</h3>
                      <p><strong>Home Spread:</strong> {data.odds.spreadHome} ({data.odds.spreadHomeOdds})</p>
                      <p><strong>Away Spread:</strong> {data.odds.spreadAway} ({data.odds.spreadAwayOdds})</p>
                      <p><strong>Home Moneyline:</strong> {data.odds.moneylineHome}</p>
                      <p><strong>Away Moneyline:</strong> {data.odds.moneylineAway}</p>
                    </div>
                )}
              </div>
          )}
        </header>
      </div>
  );
}

export default App;