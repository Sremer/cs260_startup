const express = require('express');
const axios = require('axios');
const config = require('./config.json');
const DB = require('./database.js')
const app = express();

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());

app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.get('/lyrics', async (req, res) => {
    const songTitle = req.query.songTitle;
    const artistName = req.query.artistName;
  
    try {
      const response = await axios.get('http://api.musixmatch.com/ws/1.1/matcher.lyrics.get', {
        params: {
          apikey: config.apikey,
          q_track: songTitle,
          q_artist: artistName,
        },
      });
      
      console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching lyrics.');
    }
  });

apiRouter.get('/scores', async (req, res) => {
  //console.log(_req);
  const username = req.query.username;
  const scores = await DB.getRecentScores(username);  
  res.send(scores);
});

apiRouter.post('/score', async (req, res) => {
  DB.addScore(req.body);
  const scores = await DB.getRecentScores();
  res.send(scores);
})

apiRouter.get('/scoresTitle', async (req, res) => {
  const username = req.query.username;
  const title = req.query.title;
  const scores = await DB.getScoreByTitle(username, title);
  res.send(scores);
})

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
  
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});