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
    withFriend;
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
        this.setDisplay('playMode', 'block');
        this.setDisplay('finishMode', 'none');

        this.gameData = JSON.parse(localStorage.getItem('gameData'));
        this.withFriend = this.gameData.withFriend;

        if (this.withFriend) {
            this.configureSocket();
        } else {
            this.configureAlone();
        }

        this.currLyrics = this.gameData.lyrics.split(/\s+/);

        this.editLyrics();
        console.log(this.currLyrics);
        let num = this.currLyrics.length * (this.gameData.percent / 100);
        if (num < 1) num = 1;
        this.currLyrics = this.currLyrics.slice(0, num);
        this.origLen = this.currLyrics.length;

        document.getElementById('friendUsername').textContent = this.gameData.friendName;
        document.getElementById('yourUsername').textContent = this.gameData.playerName;
        document.getElementById('songTitle').textContent = this.gameData.songTitle;

        this.currWord = this.currLyrics[0];
        this.initializeWord();

        this.canPlay = true;
    }

    setDisplay(controlId, display) {
        const playControlEl = document.querySelector(`#${controlId}`);
        if (playControlEl) {
          playControlEl.style.display = display;
        }
    }

    configureAlone() {
        const leftSide = document.getElementById('leftSide');
        leftSide.classList.add('hide');
        const name = document.getElementById('yourUsername');
        name.classList.add('hide');
    }

    configureSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
        this.socket.onopen = (event) => {
            console.log('Websocket connected');
        };
        this.socket.onclose = (event) => {
            console.log('Websocket disconnected');
        };
        this.socket.onmessage = async (event) => {
            console.log(event);
            const msg = JSON.parse(await event.data);
            console.log(msg);

            if (msg.type === 'ready') {

                const msg = {
                    type : 'setUser',
                    user : this.gameData.playerName
                }
                this.socket.send(JSON.stringify(msg));

            } else if (msg.type === 'finish') {

                this.setFinishDisplay();
                document.getElementById('finalFriendUsername').textContent = this.gameData.friendName;
                document.getElementById('finalFriendTime').textContent = msg.time;

            } else {
                const container = document.querySelector("#friendView");
                const wordElement = document.createElement('div');
                wordElement.className = 'word';
                wordElement.textContent = msg.word;
                container.appendChild(wordElement);
                container.scrollTop = container.scrollHeight;

                document.getElementById('friendPercent').textContent = msg.percent + '%';
            }
        }
    }

    editLyrics() {
        let index = this.currLyrics.indexOf('...');
        console.log(index);
        if (index > 0 && this.currLyrics.length > index) {
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
            this.finish();

        }
        this.setPercent();
    }

    finish() {
        if (this.withFriend) {
            const msg = {
                type : 'finish',
                time : document.getElementById('timer').textContent,
                friend : this.gameData.friendName
            }
            this.socket.send(JSON.stringify(msg));

        } else {
            console.log('here');
            this.setFinishDisplay();
            this.setDisplay('finalFriendUsername', 'none');
            this.setDisplay('finalFriendTime', 'none');
        }
    }

    setFinishDisplay() {
        this.setDisplay('playMode', 'none');
        this.setDisplay('finishMode', 'flex');

        document.getElementById('finalUsername').textContent = this.gameData.playerName;
        document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
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
            this.updateLocalScores();
        }
    }

    updateLocalScores() {
        const data = JSON.parse(localStorage.getItem('scores'));
        data.push(new Score(this.gameData.songTitle, this.gameData.percent, new Date().toLocaleDateString(), document.getElementById('timer').textContent));
        localStorage.setItem('scores', JSON.stringify(data));
    }

    sendWord() {
        const percent = Math.round((1 - (this.currLyrics.length - 1) / this.origLen) * 100);

        const msg = {
            type : 'progress',
            word : this.currCheckWord.toLowerCase(),
            percent : percent,
            friend : this.gameData.friendName
        }
        this.socket.send(JSON.stringify(msg));
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
                            this.wordElement.textContent = this.currCheckWord.toLowerCase();
                            this.wordElement.classList.add('right');
                            if (this.withFriend) {
                                this.sendWord();
                            }
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

    exit() {
        document.getElementById('scoreCard').classList.add('cardExit');
        setTimeout(window.location.href = "select.html", 1000);
    }
}

function finish() {
    play.exit();
}

const play = new Play();
play.play();

