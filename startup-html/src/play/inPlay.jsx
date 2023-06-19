import React, { useRef } from 'react';

import { socketHandler } from '../ws/ws';
import { gameData } from '../gameData/gameData';
import { SongContainer } from './songContainter';

export function InPlay({ changeToFinished }) {
    const socket = React.useRef(null);
    const timerId = React.useRef(null);
    const friendContainerRef = React.useRef(null);
    const mobileInputRef = React.useRef(null);
    const [timer, setTimer] = React.useState('00:00');
    const [percent, setPercent] = React.useState('0%');
    const [friendPercent, setFriendPercent] = React.useState('0%');
    const [displayedFriendLyrics, setDisplayedFriendLyrics] = React.useState([]);

    // configures the websocket and starts the timer when the page loads
    React.useEffect(() => {
        socket.current = socketHandler.getSocket();
        configureSocket(socket.current);

        startTimer();
        
    }, []);

    // scrolls to the bottom of the friend lyrics view when the lyrics are updated
    React.useEffect(() => {
        console.log(displayedFriendLyrics);
        scrollFriendView();
    }, [displayedFriendLyrics])

    // scrolls to the bottom of the friend lyrics
    function scrollFriendView() {
        const friendContainer = friendContainerRef.current;
        friendContainer.scrollTop = friendContainer.scrollHeight;
    }

    // clears the timer then sends a message to ws or sets the finish display
    const finish = () => {
        clearInterval(timerId.current);

        if (gameData.withFriend) {
            const msg = {
                type : 'finish',
                time : timer,
                friend : gameData.friendName
            }
            socket.current.send(JSON.stringify(msg));

        } else {
            setFinishDisplay();
        }
    }

    // changes to the finish display and saves the time
    function setFinishDisplay() {
        localStorage.setItem('time', timer);
        changeToFinished();
    }

    // starts the timer
    function startTimer() {
        let seconds = 0;
        let minutes = 0;
        timerId.current = setInterval(tick, 1000);

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

    // configures the ws to receive the finish message and update the friend's lyrics
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
                setFinishDisplay();
                localStorage.setItem('friendTime', msg.time);

            } else {
                setDisplayedFriendLyrics(prevState => [...prevState, msg.word.toLowerCase()]);
                setFriendPercent(msg.percent);
            }
        }
    }

    // sends the new score to the db
    const recordScore = async () => {
        const score = {
            title : gameData.songTitle,
            percent : gameData.percent,
            date : new Date().toLocaleDateString(),
            time : timer,
            username : gameData.playerName 
        }

        try {
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(score),
            });

            const scores = await response.json();
            localStorage.setItem('scores', JSON.stringify(scores));
        } catch {
            updateLocalScores(score);
        }
    }

    // updates the local scores
    function updateLocalScores(score) {
        const data = JSON.parse(localStorage.getItem('scores'));
        data.push(score);
        localStorage.setItem('scores', JSON.stringify(data));
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
                    <div id="friendView" className="songContainer" ref={friendContainerRef}>
                        {displayedFriendLyrics.map((word, index) => (
                            <div key={index} className='word'>{word}</div>
                        ))}
                    </div>
                </section>

                <section id="rightSide">
                    <h2 id="yourUsername" className={gameData.withFriend ? '' : 'hide'}>{gameData.playerName}</h2>
                    <div id="stats">
                        <span id="timer">{timer}</span>
                        <span id="userPercent">{percent}</span>
                    </div>
                    <div><input id="mobileInput" type="text" className="normal dark" placeholder="Next word" ref={mobileInputRef}/></div>
                    <SongContainer setPercent={setPercent} socket={socket.current} finish={finish} recordScore={recordScore} mobileInputRef={mobileInputRef} />
                </section>
            </section>
        </div>
    );
}