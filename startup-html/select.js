const fakeData = {
    "song1" : ["This", "is-is..", "a", "song."],
    "song 2" : ["This", "is", "another,", "song", "yay."],
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
        console.log(this.playerName);
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
                        this.insertChild("#songSelection", this.songTitle, 'div');
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
                window.location.href = "play.html";
            }
        }
    }

    insertChild(parentSelector, text, type) {
        const newChild = document.createElement(type);
        newChild.textContent = text;
      
        const parentElement = document.querySelector(parentSelector);
        parentElement.insertBefore(newChild, parentElement.firstChild)
    }
}

const game = new GameData();