const express = require('express');
const axios = require('axios');
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
          apikey: '81a38c0ca19bce9140f64cc028b1d7ba',
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

apiRouter.get('/scores', (_req, res) => {
    res.send(scores);
});

apiRouter.post('/score', (req, res) => {
    scores.push(req.body);
    res.send(scores);
})

app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});
  
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

let scores = [];
