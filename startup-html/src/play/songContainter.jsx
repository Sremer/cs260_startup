import React from 'react';

import { gameData } from '../gameData/gameData';
import { PlayState } from './playState';

export function SongContainer(props) {
    const [displayedLyrics, setDisplayedLyrics] = React.useState([]);
    const [wordInProg, setWordInProg] = React.useState('');
    const [wrongState, setWrongState] = React.useState(false);

    let checkWord = '';
    let originLen = 0;
    let resetMobileInput = false;
    let lyrics = [];
    const indexRef = React.useRef(0);

    React.useEffect(() => {
        lyrics = editLyrics(gameData.lyrics);
        initializeWord(lyrics[0]);
    }, []);

    React.useEffect(() => {
    const handleKeyDown = (e) => {
        console.log('index: ' + indexRef.current);

        if (isAlpha(e.key)) {
        let replaceKey = (indexRef.current === 0) ? '_' : ' _';
        console.log(wordInProg);
        setWordInProg(wordInProg.replace(replaceKey, e.key));

        console.log(wordInProg);
        console.log(checkWord);

        if (wordInProg.length === checkWord.length) {
            if (String(wordInProg).toLowerCase() === String(checkWord).toLowerCase()) {
            setDisplayedLyrics([...displayedLyrics, checkWord.toLowerCase()]);
            if (gameData.withFriend) sendWord(checkWord.toLowerCase());
            setNextWord();
            } else {
            resetWord();
            }
            indexRef.current = 0;

            resetMobileInput = true;
        } else {
            indexRef.current++;
        }
        } else if (e.code === 'Backspace') {
        if (indexRef.current > 0 && indexRef.current < checkWord.length) {
            if (indexRef.current === 1) {
            setWordInProg("_" + String(wordInProg).substring(indexRef.current));
            } else {
            setWordInProg(String(wordInProg).substring(0, indexRef.current - 1) + " _" + String(wordInProg).substring(indexRef.current));
            }
            indexRef.current--;
        } 
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
    }, [wordInProg]);

    React.useEffect(() => {
        if (wrongState) {
            setTimeout(()=>{
                setWrongState(false);
            }, 300)
        }
    }, [wrongState])

    async function recordScore() {
        const score = {
            title : gameData.songTitle,
            percent : gameData.percent,
            date : new Date().toLocaleDateString(),
            time : props.timer,
            username : gameData.playerName 
        }
        console.log(score);
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

    function updateLocalScores(score) {
        const data = JSON.parse(localStorage.getItem('scores'));
        data.push(score);
        localStorage.setItem('scores', JSON.stringify(data));
    }

    function finish() {
        if (gameData.withFriend) {
            const msg = {
                type : 'finish',
                time : props.timer,
                friend : gameData.friendName
            }
            props.socket.send(JSON.stringify(msg));

        } else {
            props.setPlayState(PlayState.Finished);
        }
    }

    function sendWord(word) {
        const percent = getPercent();

        const msg = {
            type : 'progress',
            word : word,
            percent : percent,
            friend : gameData.friendName
        }
        props.socket.send(JSON.stringify(msg));
    }

    function setNextWord() {
        if (lyrics.length > 1) {
            lyrics = lyrics.shift();
            initializeWord(lyrics[0]);

        } else {
            lyrics = lyrics.shift();
            clearInterval(props.timerId);

            recordScore();
            finish();
        }

        props.setPercent(getPercent());
    }

    function getPercent() {
        const percent = Math.round((1 - lyrics.length / originLen) * 100);
        return percent + '%';
    }

    function resetWord(word) {
        const blankWord = createBlankWord(word);
        setWordInProg(blankWord);
        setWrongState(true);
    }

    function initializeWord(word) {
        checkWord = createCheckWord(word);
        const blankWord = createBlankWord(checkWord);
        setWordInProg(blankWord);
    }

    function createBlankWord(word) {
        let blankWord = '';
        for (let i = 0; i < word.length; ++i) {
            blankWord += "_";
            if (i != word.length - 1) blankWord += " ";
        }
        return blankWord;
    }

    function createCheckWord(word) {
        let checkWord = '';
        for (let i = 0; i < word.length; ++i) {
            if (isAlpha(word[i])) checkWord += word[i];
        }
        return checkWord;
    }

    function isAlpha(ch) {
        return /^[A-Z]$/i.test(ch);
    }

    function editLyrics(lyricsStr) {
        let lyrics = lyricsStr.split(/\s+/);

        let index = lyrics.indexOf('...');
        console.log(index);
        if (index > 0 && (lyrics.length - 1) > index) {
            if (lyrics[index + 1] === '*******') {
                lyrics = lyrics.slice(0, index);
            }
        }

        let num = lyrics.length * (gameData.percent / 100);
        if (num < 1) num = 1;
        lyrics = lyrics.slice(0, num);

        originLen = lyrics.length;

        return lyrics;
    }

    return(
        <div id="userView" className="songContainer">
            {displayedLyrics.map((word, index) => (
                <div key={index} className='word right'>{word}</div>
            ))}

            <div className={`word ${wrongState ? 'wrong' : ''}`}>{wordInProg}</div>
        </div>
    );
}