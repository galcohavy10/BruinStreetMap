// server/index.js
const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to BruinStreetMap Node.js Server');
});

// GET all notes
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST a new note
app.post('/notes', async (req, res) => {
  const { lat, lng, text, color, fontSize } = req.body;
  try {
    const newNote = await pool.query(
      'INSERT INTO notes (lat, lng, text, color, fontSize) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [lat, lng, text, color, fontSize]
    );
    res.json(newNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT to update an existing note
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { text, color, fontSize } = req.body;
  try {
    const updatedNote = await pool.query(
      'UPDATE notes SET text = $1, color = $2, fontSize = $3 WHERE id = $4 RETURNING *',
      [text, color, fontSize, id]
    );
    res.json(updatedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE a note
app.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
