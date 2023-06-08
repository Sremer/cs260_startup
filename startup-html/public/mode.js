class Mode {
    gameData

    constructor() {
        this.gameData = JSON.parse(localStorage.getItem('gameData'));
        
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

            }
        }    
    }

}