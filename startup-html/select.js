const fakeData = {
    "song1" : ["This", "is-is..", "a", "song."],
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
    lyrics;
    percent;
    readyToPlay;

    constructor() {
        this.playerName = localStorage.getItem("username");
        this.readyToPlay = false;
    }

    getSong() {
        this.songTitle = document.querySelector("#songTitle").value;
        this.percent = Number(document.querySelector("#percentSelect").value);
        if (!!this.songTitle && !!this.percent) {
            if (this.percent <= 100 && this.percent > 0) {
                if (!!Object.keys(fakeData).find(i => i === this.songTitle)) {
                    this.lyrics = fakeData[this.songTitle];

                    if (!!this.lyrics) {
                        console.log("Ready to play");
                        this.readyToPlay = true;
                        document.querySelector('h2').innerText = this.songTitle;
                        //this.displaySongTitle();
                    }
                } else {
                    console.log("not a song");
                    console.log(this.songTitle);
                } 
            }
        } else {
            console.log("empty!");
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
            }
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

if (!localStorage.getItem('data')) {
    const data = [];
    localStorage.setItem('data', JSON.stringify(data));
}

const game = new GameData();
