class Mode {
    gameData

    constructor() {
        this.gameData = JSON.parse(localStorage.getItem('gameData'));
        this.configureSocket();
    }

    play() {
        localStorage.setItem('gameData', JSON.stringify(this.gameData));
        this.exitText();
        setTimeout(()=>{
            window.location.href = "play.html";
        }, 1500);
    }

    playAlone() {
        this.gameData.withFriend = false;
        this.play();
    }

    getFriend() {
        this.gameData.friendName = document.querySelector("#challengeFriend").value;
        if (!!this.gameData.friendName) {
            this.gameData.withFriend = true;
            this.connectToFriend(this.gameData.friendName);
        } else {
            alert('Please enter another player\'s username.');
        }
    }

    exitText() {
        document.getElementById('friendSection').classList.add('exitTop');
        document.getElementById('aloneSection').classList.add('exitBottom');
    }

    switchScreens(location) {
        this.exitText();
        setTimeout(()=>{
            window.location.href = `${location}.html`;
        }, 1500);
    }

    connectToFriend(friend) {
        const msg = {
            type : 'connect',
            user : this.gameData.playerName,
            friend : this.gameData.friendName,
            song : this.gameData.songTitle,
            percent : this.gameData.percent,
            lyrics : this.gameData.lyrics
        }
        this.socket.send(JSON.stringify(msg));
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

            } else if (msg.ready === true) {
                this.gameData.withFriend = true;
                if (msg.initiatingUser !== this.gameData.playerName) this.gameData.friendName = msg.initiatingUser;
                this.gameData.songTitle = msg.song;
                this.gameData.percent = msg.percent;
                this.gameData.lyrics = msg.lyrics;
                this.play();

            } else {
                console.log('not ready');
            }
        }    
    }

}

function logout() {
    localStorage.removeItem('username');
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
}

const mode = new Mode();