class Score {
    title;
    percent;
    date;
    time;
    username

    constructor(title, percent, date, time, username) {
        this.title = title;
        this.percent = percent;
        this.date = date;
        this.time = time;
        this.username = username;
    } 
}

class Play {
    gameData;
    canPlay;
    currLyrics;
    origLen;
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
        this.currLyrics = this.gameData.lyrics.split(/\s+/);

        this.editLyrics();
        console.log(this.currLyrics);

        let num = this.currLyrics.length * (this.gameData.percent / 100);
        if (num < 1) num = 1;
        this.currLyrics = this.currLyrics.slice(0, num);
        this.origLen = this.currLyrics.length;

        document.getElementById('friendUsername').textContent = this.gameData.friendName;
        document.getElementById('yourUsername').textContent = this.gameData.playerName;

        this.currWord = this.currLyrics[0];
        this.initializeWord();

        this.canPlay = true;
    }

    editLyrics() {
        let index = this.currLyrics.indexOf('...');
        console.log(index);
        if (index > 1 && this.currLyrics.length > index) {
            if (this.currLyrics[index + 1] === '*******') {
                this.currLyrics = this.currLyrics.slice(0, index);
            }
        }
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
        const percent = Math.round((1 - this.currLyrics.length / this.origLen) * 100);
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

    async recordScore() {
        const score = new Score(this.gameData.songTitle, this.gameData.percent, new Date().toLocaleDateString(), document.getElementById('timer').textContent, this.gameData.playerName);
        try {
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(score),
            });

            const scores = await response.json();
            localStorage.setItem('scores', JSON.stringify(scores));
        } catch {
            this.updateLocalScores();
        }
    }

    updateLocalScores() {
        const data = JSON.parse(localStorage.getItem('scores'));
        data.push(new Score(this.gameData.songTitle, this.gameData.percent, new Date().toLocaleDateString(), document.getElementById('timer').textContent));
        localStorage.setItem('scores', JSON.stringify(data));
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
    let currLyrics = gameData.lyrics.split(/\s+/);
    let num = currLyrics.length * (gameData.percent / 100);
    if (num < 1) num = 1;
    currLyrics = currLyrics.slice(0, num);
    const origLen = currLyrics.length;
    
    while (currLyrics.length > 0) {
        await setWord(currLyrics);
        const percent = Math.round((1 - currLyrics.length / origLen) * 100);
        document.getElementById('friendPercent').textContent = percent + '%';
    }
}

function setWord(currLyrics) {
    return new Promise((resolve) => {
        let delay = Math.random() * (2000 - 500) + 500;
        setTimeout(() => {
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

