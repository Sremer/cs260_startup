class SocketHandler {
    socket;

    constructor() {
        this.socket = null;
    }

    configureSocket(socket) {
        socket.onopen = (event) => {
            console.log('Websocket connected');
        };
    
        socket.onclose = (event) => {
            console.log('Websocket disconnected');
        };
    
        socket.onmessage = async (event) => {
            const msg = JSON.parse(await event.data);
            console.log(msg);
    
            if (msg.type === 'ready') {
    
                const playerName = localStorage.getItem('username');
                const msg = {
                    type : 'setUser',
                    user : playerName
                }
                socket.send(JSON.stringify(msg));
    
            }
        }
    }
    
    startSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    
        this.configureSocket(socket);
    
        return socket;
    }

    closeConnection() {
        this.socket = null;
    }

    getSocket() {
        if (this.socket === null) {
            this.socket = this.startSocket();
            return this.socket;
        } else {
            if (this.socket.readyState === WebSocket.CLOSED) this.socket = this.startSocket();
            return this.socket;
        }
    }
}

const socketHandler = new SocketHandler();

export { socketHandler };


