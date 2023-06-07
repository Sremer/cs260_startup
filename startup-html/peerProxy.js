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
        const connection = { id: uuid.v4(), alive: true, ws: ws };
        connections.push(connection);
        connection.ws.send(JSON.stringify({ type : 'ready'}));

        ws.on('message', function message(data) {
            const msg = JSON.parse(data);

            if (msg.type === 'connect') {
                connection.user = msg.user;
                const friend = connections.find(obj => obj.user === msg.friend);

                const returnMsg = { ready : false };
                if (friend !== undefined) {
                    returnMsg.song = msg.song;
                    returnMsg.percent = msg.percent;
                    returnMsg.lyrics = msg.lyrics;
                    returnMsg.initiatingUser = msg.user;
                    returnMsg.ready = true;
                    const msgString = JSON.stringify(returnMsg);
                    friend.ws.send(msgString);
                    connection.ws.send(msgString);

                } else {
                    const msgString = JSON.stringify(returnMsg);
                    connection.ws.send(msgString);
                }

            } else if (msg.type === 'progress') {
                const friend = connections.find(obj => obj.user === msg.friend);
                if (friend !== undefined) {
                    friend.ws.send(JSON.stringify(msg));
                } else {
                    console.log('friend lost connection');
                }

            } else if (msg.type === 'setUser') {
                connection.user = msg.user;
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