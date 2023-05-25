class Score {
    title;
    percent;
    date;
    time;

    constructor(title, percent, date, time) {
        this.title = title;
        this.percent = percent;
        this.date = date;
        this.time = time;
    } 
}

class Play {
    gameData;
    canPlay;
    currLyrics;
    word;
    wordElement;
    checkWord;
    currCheckWord;
    currWord;
    currWordLength;
    timerId;
    seconds;
    minutes;

    constructor() {
        this.gameData = JSON.parse(localStorage.getItem('gameData'));

        let num = this.gameData.lyrics.length * (this.gameData.percent / 100);
        if (num < 1) num = 1;
        this.currLyrics = this.gameData.lyrics.slice(0, num);

        document.getElementById('friendUsername').textContent = this.gameData.friendName;
        document.getElementById('yourUsername').textContent = this.gameData.playerName;

        this.currWord = this.currLyrics[0];
        this.initializeWord();

        this.canPlay = true;
    }

    isAlpha(ch) {
        return /^[A-Z]$/i.test(ch);
    }

    createCheckWord() {
        this.checkWord = '';
        for (let i = 0; i < this.currWord.length; ++i) {
            if (this.isAlpha(this.currWord[i])) this.checkWord += this.currWord[i];
        }
    }

    createBlankWord() {
        this.word = '';
        for (let i = 0; i < this.checkWord.length; ++i) {
            this.word += "_";
            if (i != this.checkWord.length - 1) this.word += " ";
        }
    }

    initializeWord() {
        this.createCheckWord();
        this.currCheckWord = '';
        this.createBlankWord();
        this.createWord();
    }

    createWord() {
        const container = document.querySelector("#userView");
        this.wordElement = document.createElement('div');
        this.wordElement.className = 'word';
        this.wordElement.textContent = this.word;
        container.appendChild(this.wordElement);
        container.scrollTop = container.scrollHeight;

        // const falseInput = document.createElement('div');
        // falseInput.setAttribute('contenteditable', '');
        // falseInput.className = 'invisible';
        // this.wordElement.appendChild(falseInput);
        // falseInput.focus();
    }

    setNextWord() {
        if (this.currLyrics.length > 1) {
            this.currLyrics.shift();
            this.currWord = this.currLyrics[0];
            this.initializeWord();

        } else {
            this.currLyrics.shift();
            clearInterval(this.timerId);
            this.recordScore();
            this.canPlay = false;

        }
        this.setPercent();
    }

    resetWord() {
        this.createBlankWord();
        this.currCheckWord = '';
        this.wordElement.textContent = this.word;
        this.wordElement.classList.add('wrong');
        setTimeout(()=>{
            this.wordElement.classList.remove('wrong');
        }, 300)
    }

    setPercent() {
        const percent = Math.round((1 - this.currLyrics.length / this.gameData.lyrics.length) * 100);
        document.getElementById('userPercent').textContent = percent + '%';
    }

    startTimer() {
        let seconds = 0;
        let minutes = 0;
        this.timerId = setInterval(tick, 1000);

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
            document.getElementById('timer').innerText = timer;
        }
    }

    recordScore() {
        const data = JSON.parse(localStorage.getItem('data'));
        data.push(new Score(this.gameData.songTitle, this.gameData.percent, new Date().toLocaleDateString(), document.getElementById('timer').textContent));
        localStorage.setItem('data', JSON.stringify(data));
    }

    play() {
        this.startTimer();

        let index = 0;
        document.addEventListener("keydown", (e) => {
            if (this.canPlay) {
                if (this.isAlpha(e.key)) {
                    if (index === 0) {
                        this.word = this.word.replace('_', e.key);
                    } else {
                        this.word = this.word.replace(' _', e.key);
                    }
                    this.wordElement.textContent = this.word;
                    this.currCheckWord += e.key;

                    console.log(this.checkWord);
                    console.log(this.currCheckWord);

                    if (this.currCheckWord.length === this.checkWord.length) {
                        if (String(this.currCheckWord).toLowerCase() === String(this.checkWord).toLowerCase()) {
                            this.wordElement.textContent = this.currWord;
                            this.setNextWord();
                        } else {
                            this.resetWord();
                        }
                        index = 0;
                        this.resetMobileInput = true;
                    } else {
                        index++;
                    }

                } else if (e.code === 'Backspace') {
                    if (index > 0 && index < this.checkWord.length) {
                        if (index === 1) {
                            this.word = "_" + String(this.word).substring(index);
                        } else {
                            this.word = String(this.word).substring(0, index - 1) + " _" + String(this.word).substring(index);
                        }
                        this.wordElement.textContent = this.word;
                        index--;
                        this.currCheckWord = this.currCheckWord.substring(0, this.currCheckWord.length - 1);
                    } 
                    console.log(this.checkWord);
                    console.log(this.currCheckWord);
                }
            }
        }); 

        document.addEventListener(('keyup'), (e) => {
            if (this.resetMobileInput) {
                document.getElementById('mobileInput').value = '';
                this.resetMobileInput = false;
            }
        });
    }
}

async function simulateFriend() {
    const gameData = JSON.parse(localStorage.getItem('gameData'));
    let num = gameData.lyrics.length * (gameData.percent / 100);
    if (num < 1) num = 1;
    const currLyrics = gameData.lyrics.slice(0, num);
    
    while (currLyrics.length > 0) {
        await setWord(currLyrics);
        const percent = Math.round((1 - currLyrics.length / gameData.lyrics.length) * 100);
        document.getElementById('friendPercent').textContent = percent + '%';
    }
}

function setWord(currLyrics) {
    return new Promise((resolve) => {
        let delay = Math.random() * (2000 - 500) + 500;
        setTimeout(() => {
            console.log(currLyrics[0]);
            const container = document.querySelector("#friendView");
            const wordElement = document.createElement('div');
            wordElement.className = 'word';
            wordElement.textContent = currLyrics[0];
            container.appendChild(wordElement);
            container.scrollTop = container.scrollHeight;
            currLyrics.shift();

            resolve(true);
        }, delay);
    });
}

function quit() {
    console.log('quit');
    window.location.href = "select.html";
}

document.getElementById('quitBtn').addEventListener('click', quit);

simulateFriend();

const play = new Play();
play.play();

