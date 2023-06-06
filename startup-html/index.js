const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const axios = require('axios');
const config = require('./config.json');
const DB = require('./database.js')
const app = express();

const authCookieName = 'token';

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());

app.use(cookieParser());

app.use(express.static('public'));

app.set('trust proxy', true);

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post('/auth/signUp', async (req, res) => {
  if (await DB.getUser(req.body.username)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.signUpUser(req.body.username, req.body.password);

    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    })
  }
})

apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
})

apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
})

apiRouter.get('/user/:username', async (req, res) => {
  const user = await DB.getUser(req.params.username);
  if (user) {
    const token = req?.cookies.token;
    res.send({ username: user.username, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Invalid credentials' });
  }
});

secureApiRouter.get('/lyrics', async (req, res) => {
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
      
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching lyrics.');
    }
});

secureApiRouter.get('/scores', async (req, res) => {
  const username = req.query.username;
  const scores = await DB.getRecentScores(username);  
  res.send(scores);
});

secureApiRouter.post('/score', async (req, res) => {
  const score = { ...req.body, ip: req.ip };
  const username = score.username;
  await DB.addScore(score);
  const scores = await DB.getRecentScores(username);
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

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}
  
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});