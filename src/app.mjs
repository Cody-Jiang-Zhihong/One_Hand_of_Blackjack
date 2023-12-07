import express from 'express';
const app = express();
app.use(express.json()); // To parse JSON bodies

import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));

const gameHistory = []; // This will store the history of games

app.post('/save-game', (req, res) => {
  const { userInitials, computerScore, userScore } = req.body;
  const gameResult = { userInitials, computerScore, userScore };
  gameHistory.push(gameResult);
  res.status(201).send('Game saved');
});

app.get('/game-history', (req, res) => {
  res.json(gameHistory);
});

app.listen(3000);
