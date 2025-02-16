// server/index.js

const express = require("express");
const pool = require("./db");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
console.log(process.env.PORT);
const corsOptions = {
  origin: "*",
  methods: "GET, PUT, POST, DELETE, HEAD, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
  maxAge: 3600,
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to BruinStreetMap Node.js Server");
});

// GET all notes
app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );

    console.log(result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST a new note
app.post("/notes", async (req, res) => {
  const { lat, lng, text, color, fontSize } = req.body;
  try {
    const newNote = await pool.query(
      "INSERT INTO notes (lat, lng, text, color, font_size) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [lat, lng, text, color, fontSize]
    );
    res.json(newNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// PUT to update an existing note
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { text, color, fontSize } = req.body;
  try {
    // Store only defined values in an array
    let updates = [];
    let values = [];
    let counter = 1; // PostgreSQL uses $1, $2, etc.

    if (text !== undefined && text !== null) {
      updates.push(`text = $${counter}`);
      values.push(text);
      counter++;
    }
    if (color !== undefined && color !== null) {
      updates.push(`color = $${counter}`);
      values.push(color);
      counter++;
    }
    if (fontSize !== undefined && fontSize !== null) {
      updates.push(`font_size = $${counter}`);
      values.push(fontSize);
      counter++;
    }

    // If there are no updates, return early
    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // Add the WHERE condition
    values.push(id);
    const query = `UPDATE notes SET ${updates.join(
      ", "
    )} WHERE id = $${counter} RETURNING *`;

    // Execute the query
    const updatedNote = await pool.query(query, values);
    res.json(updatedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE a note
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.delete("/notes", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes");
    res.json({ message: "Notes deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
