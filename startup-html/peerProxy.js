const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const { json } = require('express');

function peerProxy(httpServer) {

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request);
        });
    });

    let connections = [];

    wss.on('connection', (ws) => {
        const connection = { id: uuid.v4(), alive: true, ws: ws, song: '' };
        connections.push(connection);

        ws.on('message', function message(data) {
            const msg = JSON.parse(data);

            console.log(msg);

            if (msg.type === 'connect') {

                connection.user = msg.user;
                connection.song = msg.song;
                const friend = connections.find(obj => obj.user === msg.friend);

                const returnMsg = { ready : false, song : "" };
                if (friend !== undefined) {
            
                    if (friend.song === "" && connection.song !== "") {
                        returnMsg.song = connection.song;
                        returnMsg.ready = true;
                        const msgString = JSON.stringify(returnMsg);
                        friend.ws.send(msgString);
                        connection.ws.send(msgString);

                    } else if (friend.song !== "" && connection.song === "") {
                        returnMsg.song = friend.song;
                        returnMsg.ready = true;
                        const msgString = JSON.stringify(returnMsg);
                        friend.ws.send(msgString);
                        connection.ws.send(msgString);

                    } else {
                        const msgString = JSON.stringify(returnMsg);
                        friend.ws.send(msgString);
                        connection.ws.send(msgString);
                    }

                } else {
                    const msgString = JSON.stringify(returnMsg);
                    connection.ws.send(msgString);
                }

            }

        })

        ws.on('close', () => {
            connections.findIndex((o, i) => {
              if (o.id === connection.id) {
                connections.splice(i, 1);
                return true;
              }
            });
        });

        ws.on('pong', () => {
            connection.alive = true;
        });
    });

    setInterval(() => {
        connections.forEach((c) => {
          if (!c.alive) {
            c.ws.terminate();
          } else {
            c.alive = false;
            c.ws.ping();
          }
        });
    }, 10000);
}

module.exports = { peerProxy };