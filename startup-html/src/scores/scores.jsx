import React from 'react';

import { gameData } from '../gameData/gameData';
import { socketHandler } from '../ws/ws';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./scores.css"

export function Scores() {
  const navigate = useNavigate();
  const [scores, setScores] = React.useState([]);
  const [songTitle, setSongTitle] = React.useState('');

  React.useEffect(() => {
    displayRecentScores();
  }, []);

  async function displayRecentScores() {
    const data = await loadScores();
    setScores(data);
  }

  async function loadScores() {
    let scores = [];
    try {
        const username = localStorage.getItem('username');
        const url = `/api/scores?username=${encodeURIComponent(username)}`;
        const response = await fetch(url);

        scores = await response.json();

        localStorage.setItem('scores', JSON.stringify(scores));

        return scores;
    } catch {
        scores = JSON.parse(localStorage.getItem('scores'));

        return scores;
    }
  }

  async function searchSong() {
    const username = localStorage.getItem('username');
    const url = `/api/scoresTitle?username=${encodeURIComponent(username)}&title=${encodeURIComponent(songTitle)}`;
    const response = await fetch(url);

    const scores = await response.json();
    setScores(scores);
  }

  // logs out and clears the data
  function logout() {
    localStorage.removeItem('username');
    gameData.clearData();
    socketHandler.closeConnection();
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (navigate('/')));
  }

  const scoreRows = [];
  for (const [i, score] of scores.entries()) {
    scoreRows.push(
      <tr key={i}>
        <td>{score.title}</td>
        <td>{score.percent}</td>
        <td>{score.date}</td>
        <td>{score.time}</td>
      </tr>
    );
  }

  return (
    <>
      <div className="container">
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-0 text-light">
                
              <ul className="nav col-8 col-md-auto mb-2 mb-md-0">
                <li><a onClick={() => navigate('/select')} className="nav-link px-2 link-dark">play</a></li>
                <li><a onClick={() => navigate('/scores')} className="nav-link px-2 link-dark">scores</a></li>
              </ul>
        
              <div className="col-md-3 text-end">
                <button onClick={() => logout()} className="btn btn-outline-dark me-2">logout</button>
              </div>
            </header>
        </div>

        <main>
            <div><input type="text" id="scoreSearch" className="inputOffset normal dark" onChange={(e) => setSongTitle(e.target.value)} name="varScoreSearch" placeholder="song title" required/>
            <button id="searchBtn" className="normal dark" onClick={() => searchSong()}>search</button></div>
    
            <div id="tableContainer">
                <table>
                    <thead>
                        <tr>
                            <th>title</th>
                            <th>percent</th>
                            <th>date</th>
                            <th>time</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">{scoreRows}</tbody>
                </table>
            </div>
        </main>
    </>
  );
}