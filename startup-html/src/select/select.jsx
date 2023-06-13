import React, { useEffect } from 'react';

import { socketHandler } from '../ws/ws';
import { gameData } from '../gameData/gameData';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './select.css'

export function Select() {
  const navigate = useNavigate();
  const [songTitle, setSongTitle] = React.useState('');
  const [songArtist, setSongArtist] = React.useState('');
  const [percent, setPercent] = React.useState('');
  const [exitState, setExitState] = React.useState(false);

  // on loading the page, clear data and start the websocket
  React.useEffect(() => {
    gameData.clearData();
    const socket = socketHandler.getSocket();
    configureSocket(socket);
  })

  // validates song data, retrieves lyrics, and goes to mode page
  async function getSong() { 
    if (!!songTitle && !!songArtist) {
        if (!!percent) {
            if (percent <= 100 && percent > 0) {
                const lyrics = await getLyrics(songTitle, songArtist);

                if (lyrics.length > 0) {
                    console.log("Ready to play");
                    gameData.lyrics = lyrics;
                    exitPage('/mode');

                } else {
                    alert('Could not find song');
                }
            }
        } else {
            alert('Please enter what percentage of the song you would like to play. Enter a number from 1 to 100.');
        }
    } else {
        alert('Please enter a song title and artist name.');
    }
}

  // gets the lyrics from the server
  async function getLyrics(title, artist) {
    let lyrics = [];
    try {
        const response = await fetch('/api/lyrics?songTitle=' + encodeURIComponent(title) + '&artistName=' + encodeURIComponent(artist));

        if (response.ok) {
            const lyricsData = await response.json();
            const lyrics = lyricsData.message.body.lyrics.lyrics_body;
            return lyrics;
        } else {
            throw new Error('Error occurred while fetching lyrics.');
        }

    } catch (error) {
        console.log(error);
        return lyrics;
    }
}

  // exit the page and trigger the animation
  function exitPage(location) {
    if (location === '/mode') {
      gameData.songTitle = songTitle;
      gameData.artist = songArtist;
      gameData.percent = percent;
    }

    setExitState(true);
    setTimeout(()=>{
      navigate(location);
    }, 1500);
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

  // configures the websocket to take messages needed for the select page
  function configureSocket(socket) {
    socket.onmessage = async (event) => {
      const msg = JSON.parse(await event.data);
      console.log(msg);

      if (msg.type === 'ready') {

          const msg = {
              type : 'setUser',
              user : gameData.playerName
          }
          socket.send(JSON.stringify(msg));

      } else if (msg.ready === true) {
          gameData.withFriend = true;
          if (msg.initiatingUser !== gameData.playerName) gameData.friendName = msg.initiatingUser;
          gameData.songTitle = msg.song;
          gameData.percent = msg.percent;
          gameData.lyrics = msg.lyrics;

          exitPage('/play');

      } else {
          console.log('not ready');
      }
    }
  }

  return (
    <>
      <div className="container">
          <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-0 text-light">
              
            <ul className="nav col-8 col-md-auto mb-2 mb-md-0">
              <li><a onClick={() => navigate('/select')} className="nav-link px-2 link-dark">play</a></li>
              <li><a onClick={() => exitPage('/scores')} className="nav-link px-2 link-dark">scores</a></li>
            </ul>
      
            <div className="col-md-3 text-end">
              <button onClick={() => logout()} className="btn btn-outline-dark me-2">logout</button>
            </div>
          </header>
      </div>

      <main>
          <section id="topSection">
              <div id="smallTitle" className={`smallTitle enterSmallTitle ${exitState ? 'exitSmallTitle' : ''}`}>select a song</div>
              <div>
                <input 
                  type="text"  
                  id="songTitle" 
                  className={`inputTitle ${exitState ? 'exitTitle' : ''}`}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="song title" 
                  required
                />
              </div> 
          </section>

          <section id="songPage" className={`enterPage ${exitState ? 'exitTitle' : ''}`}>
              <section id="songSelection" className={`enterLeft ${exitState ? 'exitLeft' : ''}`}>
                  <div>
                    <input 
                      type="text" 
                      id="artistName" 
                      className="normal light" 
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="artist name" 
                      required
                    />
                  </div>

                  <div>
                    <input 
                      type="text" 
                      id="percentSelect" 
                      className="normal light" 
                      onChange={(e) => setPercent(e.target.value)}
                      placeholder="%" 
                      required
                    />
                  </div>

                  <div>
                    <button className="normal light" onClick={() => getSong()}>select</button>
                  </div>
              </section>
          </section>
      </main>
    </>   
  );
}