const fakeData = {
    "song1" : ["This", "is", "a", "song."],
    "song 2" : ["This", "is", "another,", "song", "yay."],
    "song3" : ["song", "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",
    "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",
    "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",
    "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",
    "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",
    "song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song","song",],
}

class GameData {
    playerName;
    friendName;
    songTitle;
    artist;
    lyrics;
    percent;
    readyToPlay;

    constructor() {
        this.playerName = localStorage.getItem("username");
        this.readyToPlay = false;
    }

    async getSong() {
        this.songTitle = document.querySelector("#songTitle").value;
        this.artist = document.querySelector("#artistName").value;
        this.percent = Number(document.querySelector("#percentSelect").value);
        if (!!this.songTitle && !!this.artist) {
            if (!!this.percent) {
                if (this.percent <= 100 && this.percent > 0) {
                    this.lyrics = await this.getLyrics(this.songTitle, this.artist);
                    if (this.lyrics.length > 0) {
                        console.log("Ready to play");
                        this.readyToPlay = true;
                        document.querySelector('h2').innerText = this.songTitle;
                        //this.displaySongTitle();
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

    getFriend() {
        this.friendName = document.querySelector("#friendUsername").value;
        if (!!this.friendName) {
            if (this.readyToPlay) {
                localStorage.setItem('gameData', JSON.stringify(this));
                this.exitText();
                setTimeout(()=>{
                    window.location.href = "play.html";
                }, 1500);
            } else {
                alert('Please select a song.');
            }
        } else {
            alert('Please enter another player\'s username.');
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
        const title = document.querySelector('h2');
        const left = document.getElementById('songSelection');
        const right = document.getElementById('friendSelection');
        title.classList.add('exitTitle');
        left.classList.add('exitLeft');
        right.classList.add('exitRight');
    }
}

const game = new GameData();

