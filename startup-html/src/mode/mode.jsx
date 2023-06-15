import React from 'react';

import { socketHandler } from '../ws/ws';
import { gameData } from '../gameData/gameData';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './mode.css'

export function Mode() {
  const navigate = useNavigate();
  let socket = null;
  const [friendName, setFriendName] = React.useState('');
  const [exitState, setExitState] = React.useState(false);

  // on loading the page, configures the websocket
  React.useEffect(() => {
    socket = socketHandler.getSocket();
    configureSocket(socket);
  }, []);

  // called if the player chooses to play alone
  function playAlone() {
    gameData.withFriend = false;
    exitPage('/play');
  }

  // called if the player chooses to play with a friend and makes the request to websocket
  function playWithFriend() {
    if (!!friendName) {
        gameData.withFriend = true;
        gameData.friendName = friendName;
        connectToFriend(friendName);
    } else {
        alert('Please enter another player\'s username.');
    }
  }

  // sends the message to websocket
  function connectToFriend(friend) {
    const msg = {
        type : 'connect',
        user : gameData.playerName,
        friend : gameData.friendName,
        song : gameData.songTitle,
        percent : gameData.percent,
        lyrics : gameData.lyrics
    }
    socket.send(JSON.stringify(msg));
  }

  // triggers the exit animation and goes to the desired location
  function exitPage(location) {
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

  // configures the websocket connection for the mode page
  function configureSocket(socket) {
      socket.onmessage = async (event) => {
      const msg = JSON.parse(await event.data);

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
    <div className='modePage'>
      <div className="container">
          <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-0 text-light">
              
            <ul className="nav col-8 col-md-auto mb-2 mb-md-0">
              <li><a onClick={() => exitPage('/select')} className="nav-link px-2 link-light">play</a></li>
              <li><a onClick={() => exitPage('/scores')} className="nav-link px-2 link-light">scores</a></li>
            </ul>
      
            <div className="col-md-3 text-end">
              <button onClick={() => logout()} className="btn btn-outline-light me-2">logout</button>
            </div>
          </header>
      </div>

      <main>
          <section id="friendSection" className={`enterTop ${exitState ? 'exitTop' : ''}`}>
              <div>
                <input 
                  type="text" 
                  id="challengeFriend"
                  className="normal light"
                  onChange={(e) => setFriendName(e.target.value)} 
                  placeholder="challenge a friend"
                />
              </div>
              <div><button className="normal light" onClick={() => playWithFriend()}>play</button></div>
          </section>

          <section id="aloneSection" className={`enterBottom ${exitState ? 'exitBottom' : ''}`}>
              <div>or</div>
              <div><button className="normal dark" onClick={() => playAlone()}>play alone</button></div>
          </section>
      </main>
    </div>
  );
}