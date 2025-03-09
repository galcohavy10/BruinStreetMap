const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all markers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM markers");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching markers:", error);
    res.status(500).json({ error: "Error fetching markers" });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  const { lat, lng, text, color, fontSize } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO markers (lat, lng, text, color, font_size) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [lat, lng, text, color, fontSize]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Error creating note" });
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { text, color, fontSize } = req.body;

  try {
    const result = await pool.query(
      `UPDATE markers SET 
       text = COALESCE($1, text),
       color = COALESCE($2, color),
       font_size = COALESCE($3, font_size)
       WHERE id = $4 RETURNING *`,
      [text, color, fontSize, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Error updating note" });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM markers WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Error deleting note" });
  }
});

module.exports = router;
