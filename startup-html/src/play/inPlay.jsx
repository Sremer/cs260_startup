import React from 'react';

import { socketHandler } from '../ws/ws';
import { gameData } from '../gameData/gameData';
import { PlayState } from './playState';
import { SongContainer } from './songContainter';

export function InPlay(setPlayState) {
    let socket = null;
    let timerId = null;
    const [timer, setTimer] = React.useState('00:00');
    const [percent, setPercent] = React.useState('0%');
    const [friendPercent, setFriendPercent] = React.useState('0%');

    React.useEffect(() => {
        socket = socketHandler.getSocket();
        configureSocket(socket);

        startTimer();
        
    }, []);

    function startTimer() {
        let seconds = 0;
        let minutes = 0;
        timerId = setInterval(tick, 1000);

        function tick() {
            seconds++;

            if (seconds === 60) {
                seconds = 0;
                minutes++;
            }

            let timer = '';
            if (minutes < 10) timer += '0';
            timer += minutes + ':';
            if (seconds < 10) timer += '0';
            timer += seconds;
            setTimer(timer);
        }
    }

    function configureSocket(socket) {
        socket.onmessage = async (event) => {
            console.log(event);
            const msg = JSON.parse(await event.data);
            console.log(msg);

            if (msg.type === 'ready') {

                const msg = {
                    type : 'setUser',
                    user : gameData.playerName
                }
                socket.send(JSON.stringify(msg));

            } else if (msg.type === 'finish') {
                setPlayState(PlayState.Finished);

                //change finish
                // setFinishDisplay();
                // document.getElementById('finalFriendUsername').textContent = gameData.friendName;
                // document.getElementById('finalFriendTime').textContent = msg.time;

            } else {

                //change updating friend's words
                // const container = document.querySelector("#friendView");
                // const wordElement = document.createElement('div');
                // wordElement.className = 'word';
                // wordElement.textContent = msg.word;
                // container.appendChild(wordElement);
                // container.scrollTop = container.scrollHeight;

                // document.getElementById('friendPercent').textContent = msg.percent + '%';
            }
        }
    }

    return (
        <div id="playMode">
            <div id="songTitle"></div>
            <section id="playContainer">
                <section id="leftSide" className={gameData.withFriend ? '' : 'hide'}>
                    <div id="friendInfo">
                        <h2 id="friendUsername">{gameData.friendName}</h2>
                        <span id="friendPercent">{friendPercent}</span>
                    </div>
                    <div id="friendView" className="songContainer">
                        
                    </div>
                </section>

                <section id="rightSide">
                    <h2 id="yourUsername" className={gameData.withFriend ? '' : 'hide'}>{gameData.playerName}</h2>
                    <div id="stats">
                        <span id="timer">{timer}</span>
                        <span id="userPercent">{percent}</span>
                    </div>
                    <div><input id="mobileInput" type="text" className="normal dark" placeholder="Next word"/></div>
                    <SongContainer timerId={timerId} setPercent={setPercent} socket={socket} timer={timer} setPlayState={setPlayState} />
                </section>
            </section>
        </div>
    );
}