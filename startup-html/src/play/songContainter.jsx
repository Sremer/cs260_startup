import React from 'react';

import { gameData } from '../gameData/gameData';
import { PlayState } from './playState';

export function SongContainer(props) {
    const [displayedLyrics, setDisplayedLyrics] = React.useState([]);
    const [wordInProg, setWordInProg] = React.useState('');
    const [wrongState, setWrongState] = React.useState(false);

    const finished = React.useRef(false);
    const checkWord = React.useRef('');
    const currWord = React.useRef('');
    const originLen = React.useRef(0);
    const resetMobileInput = React.useRef(false);
    const lyrics = React.useRef([]);
    const indexRef = React.useRef(0);
    const containerRef = React.useRef(null);

    // edits the lyrics and sets the first word when the page loads
    React.useEffect(() => {
        lyrics.current = editLyrics(gameData.lyrics);
        initializeWord(lyrics.current[0]);
    }, []);

    // called when the current word is updated
    React.useEffect(() => {
        const container = containerRef.current;
        container.scrollTop = container.scrollHeight;

        // updates the game when a key is pressed
        const handleKeyDown = (e) => {
            if (isAlpha(e.key)) {
                let replaceKey = (indexRef.current === 0) ? '_' : ' _';
                setWordInProg(wordInProg.replace(replaceKey, e.key));
                currWord.current += e.key;

                if (currWord.current.length === checkWord.current.length) {

                    if (String(currWord.current).toLowerCase() === String(checkWord.current).toLowerCase()) {

                        setDisplayedLyrics([...displayedLyrics, checkWord.current.toLowerCase()]);
                        if (gameData.withFriend) sendWord(checkWord.current.toLowerCase());
                        setNextWord();

                    } else {
                        resetWord(checkWord.current);
                    }
                    indexRef.current = 0;

                    resetMobileInput.current = true;

                } else {
                    indexRef.current++;
                }
            } else if (e.code === 'Backspace') {
                if (indexRef.current > 0 && indexRef.current < checkWord.current.length) {
                    if (indexRef.current === 1) {
                        setWordInProg("_" + String(wordInProg).substring(indexRef.current));
                    } else {
                        setWordInProg(String(wordInProg).substring(0, indexRef.current - 1) + " _" + String(wordInProg).substring(indexRef.current));
                    }
                    indexRef.current--;
                    currWord.current = currWord.current.substring(0, currWord.current.length - 1);
                } 
            }
        };

        // updates the mobile input when a key is released
        const handleKeyUp = (e) => {
            if (resetMobileInput.current) {
                const mobileInput = props.mobileInputRef.current;
                mobileInput.value = '';
                resetMobileInput.current = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    
    }, [wordInProg]);

    // stops the "wrong" animation
    React.useEffect(() => {
        if (wrongState) {
            setTimeout(()=>{
                setWrongState(false);
            }, 300)
        }
    }, [wrongState])

    // sends the newest word to friend
    function sendWord(word) {
        const percent = getPercent(lyrics.current.length - 1);

        const msg = {
            type : 'progress',
            word : word,
            percent : percent,
            friend : gameData.friendName
        }
        props.socket.send(JSON.stringify(msg));
    }

    // sets the next word in the lyrics and checks if the game is finished
    function setNextWord() {
        if (lyrics.current.length > 1) {
            lyrics.current.shift();
            initializeWord(lyrics.current[0]);

        } else {
            lyrics.current.shift();
            finished.current = true;
            setWordInProg('');

            props.recordScore();
            props.finish();
        }

        props.setPercent(getPercent(lyrics.current.length));
    }

    // returns the percent completed
    function getPercent(length) {
        const percent = Math.round((1 - length / originLen.current) * 100);
        return percent + '%';
    }

    // resets the current word
    function resetWord(word) {
        const blankWord = createBlankWord(word);
        setWordInProg(blankWord);
        currWord.current = '';
        setWrongState(true);
    }

    // initializes the new word by creating a new check word and blank word
    function initializeWord(word) {
        checkWord.current = createCheckWord(word);
        currWord.current = '';
        const blankWord = createBlankWord(checkWord.current);
        setWordInProg(blankWord);
    }

    // creates and returns the blank word from the provided word
    function createBlankWord(word) {
        let blankWord = '';
        for (let i = 0; i < word.length; ++i) {
            blankWord += "_";
            if (i != word.length - 1) blankWord += " ";
        }
        return blankWord;
    }

    // creates and returns the check word from the provided word
    function createCheckWord(word) {
        let checkWord = '';
        for (let i = 0; i < word.length; ++i) {
            if (isAlpha(word[i])) checkWord += word[i];
        }
        return checkWord;
    }

    // checks if a letter is an alphabettical character
    function isAlpha(ch) {
        return /^[A-Z]$/i.test(ch);
    }

    // edits the lyrics to be the right length
    function editLyrics(lyricsStr) {
        let lyrics = lyricsStr.split(/\s+/);

        let index = lyrics.indexOf('...');
        if (index > 0 && (lyrics.length - 1) > index) {
            if (lyrics[index + 1] === '*******') {
                lyrics = lyrics.slice(0, index);
            }
        }

        let num = lyrics.length * (gameData.percent / 100);
        if (num < 1) num = 1;
        lyrics = lyrics.slice(0, num);

        originLen.current = lyrics.length;

        return lyrics;
    }

    return(
        <div id="userView" className="songContainer" ref={containerRef}>
            {displayedLyrics.map((word, index) => (
                <div key={index} className='word right'>{word}</div>
            ))}

            <div className={`word ${wrongState ? 'wrong' : ''}`}>{wordInProg}</div>
        </div>
    );
}