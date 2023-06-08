class GameData {
    playerName;
    friendName;
    songTitle;
    artist;
    lyrics;
    percent;
    readyToPlay;
    withFriend;

    constructor() {
        this.playerName = localStorage.getItem("username");
        this.readyToPlay = false;
        this.songTitle = '';
        this.connectWebSocket();
    }

    async getSong() { 
        this.songTitle = String(document.querySelector("#songTitle").value).toLowerCase();
        this.artist = document.querySelector("#artistName").value;
        this.percent = Number(document.querySelector("#percentSelect").value);

        if (!!this.songTitle && !!this.artist) {

            if (!!this.percent) {

                if (this.percent <= 100 && this.percent > 0) {

                    this.lyrics = await this.getLyrics(this.songTitle, this.artist);

                    if (this.lyrics.length > 0) {

                        console.log("Ready to play");
                        this.readyToPlay = true;
                        this.displayReadyToPlay();

                    } else {
                        alert('Could not find song');
                        this.deleteReadyToPlay();
                    }
                }
            } else {
                alert('Please enter what percentage of the song you would like to play. Enter a number from 1 to 100.');

            }
        } else {
            alert('Please enter a song title and artist name.');
        }
    }

    async getLyrics(title, artist) {
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

    displayReadyToPlay() {
        const main = document.querySelector('main');
        if (main.firstChild.classList === undefined) {
            const main = document.querySelector('main');
            const newDiv = document.createElement('div');
            newDiv.textContent = 'ready to play';
            newDiv.classList.add('readyToPlay');
            main.insertBefore(newDiv, main.firstChild);
        }
    }

    deleteReadyToPlay() {
        const main = document.querySelector('main');
        if (main.firstChild.classList !== undefined) {
            main.removeChild(main.firstChild);
        }
    }

    getFriend() {
        this.friendName = document.querySelector("#friendUsername").value;
        if (!!this.friendName) {
            if (this.readyToPlay) {
                this.withFriend = true;
                this.connectToFriend(this.friendName);
            } else {
                alert('Please select a song.');
            }
        } else {
            alert('Please enter another player\'s username.');
        }
    }

    playAlone() {
        if (this.readyToPlay) {
            this.withFriend = false;
            this.play();
        } else {
            alert('Please select a song.');
        }
    }

    displaySongTitle() {
        if (!!document.getElementById('displaySongTitle')) {
            document.getElementById('displaySongTitle').textContent = this.songTitle;

        } else {
            const newChild = document.createElement('div');
            newChild.setAttribute('id', 'displaySongTitle');
            newChild.textContent = this.songTitle;
        
            const parentElement = document.querySelector("#songSelection");
            parentElement.insertBefore(newChild, parentElement.firstChild);
        }
    }

    exitText() {
        const title = document.querySelector('.inputTitle');
        const left = document.getElementById('songSelection');
        const right = document.getElementById('friendSelection');
        const page = document.getElementById('songPage');
        page.classList.add('exitTitle');
        title.classList.add('exitTitle');
        left.classList.add('exitLeft');
        right.classList.add('exitRight');

        if (this.readyToPlay) {
            const ready = document.querySelector('.readyToPlay');
            ready.classList.add('exitRight');
        }
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

        this.socket.onopen = (event) => {
            console.log('Websocket connected');
        };

        this.socket.onclose = (event) => {
            console.log('Websocket disconnected');
        };
        
        this.socket.onmessage = async (event) => {
            const msg = JSON.parse(await event.data);
            console.log(msg);
            if (msg.ready === true) {
                this.withFriend = true;
                if (msg.initiatingUser !== this.playerName) this.friendName = msg.initiatingUser;
                this.songTitle = msg.song;
                this.percent = msg.percent;
                this.lyrics = msg.lyrics;
                this.play();
            } else {
                console.log('not ready');
            }
        }
    }

    connectToFriend(friend) {
        const msg = {
            type : 'connect',
            user : this.playerName,
            friend : this.friend,
            song : this.songTitle,
            percent : this.percent,
            lyrics : this.lyrics
        }
        this.socket.send(JSON.stringify(msg));
    }

    play() {
        localStorage.setItem('gameData', JSON.stringify(this));
        this.exitText();
        setTimeout(()=>{
            window.location.href = "play.html";
        }, 1500);
    }

    switchScreens() {
        this.exitText();
        setTimeout(()=>{
            window.location.href = "scores.html";
        }, 1500);
    }
}

function logout() {
    localStorage.removeItem('username');
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
}

const game = new GameData();



