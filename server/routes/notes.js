const express = require("express");
const router = express.Router();
const pool = require("../db");

/** POST A NEW NOTE */
router.post("/", async (req, res) => {
  const { user_id, title, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO notes (user_id, title, latitude, longitude) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, latitude, longitude]
    );

    res.status(201).json({ message: "Note created!", note: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error creating note" });
  }
});

/** FILTER NOTES BY USER INFO (Major & Clubs) */
router.get("/filter", async (req, res) => {
  const { major, clubs } = req.query;

  try {
    const result = await pool.query(
      `SELECT notes.* FROM notes
       JOIN users ON notes.user_id = users.id
       WHERE ($1::TEXT IS NULL OR users.major = $1)
       AND ($2::TEXT[] IS NULL OR users.clubs && ARRAY[$2])`,
      [major, clubs]
    );

    res.json(result.rows);
  } catch (error) {
    console.log("Error filtering notes", error);
    res.status(500).json({ error: "Error filtering notes" });
  }
});

/** GET A SPECIFIC NOTE */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM notes WHERE id = $1`, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Note not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching note" });
  }
});

router.get("/:id/votes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE upvote = TRUE) AS upvotes,
        COUNT(*) FILTER (WHERE downvote = TRUE) AS downvotes
      FROM votes WHERE note_id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching votes" });
  }
});

router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM comments WHERE note_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.status(200).json({
      message: "Comments retrieved successfully!",
      comments: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving comments" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notes ORDER BY created_at DESC`
    );
    res
      .status(200)
      .json({ message: "Notes retrieved successfully!", notes: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving notes" });
  }
});

router.post("/:id/upvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Insert or update the vote record
    await pool.query(
      `INSERT INTO votes (user_id, note_id, upvote, downvote)
       VALUES ($1, $2, TRUE, FALSE)
       ON CONFLICT (user_id, note_id) 
       DO UPDATE SET upvote = TRUE, downvote = FALSE`,
      [user_id, id]
    );

    res.json({ message: "Upvoted note successfully!" });
  } catch (error) {
    console.log("Error upvoting note: ", error);
    res.status(500).json({ error: "Error upvoting note" });
  }
});

router.post("/:id/downvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Insert or update the vote record
    await pool.query(
      `INSERT INTO votes (user_id, note_id, upvote, downvote)
       VALUES ($1, $2, FALSE, TRUE)
       ON CONFLICT (user_id, note_id) 
       DO UPDATE SET upvote = FALSE, downvote = TRUE`,
      [user_id, id]
    );

    res.json({ message: "Downvoted note successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error downvoting note" });
  }
});

router.post("/:id/remove-vote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    await pool.query(`DELETE FROM votes WHERE user_id = $1 AND note_id = $2`, [
      user_id,
      id,
    ]);

    res.json({ message: "Vote removed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error removing vote" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `UPDATE notes SET 
        title = COALESCE($1, title), 
        latitude = COALESCE($2, latitude), 
        longitude = COALESCE($3, longitude)
      WHERE id = $4 RETURNING *`,
      [title, latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note updated successfully!", note: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error updating note: " + error });
  }
});

router.get("/bounding-box", async (req, res) => {
  const { lat_min, lat_max, lon_min, lon_max } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM notes 
       WHERE latitude BETWEEN $1 AND $2
       AND longitude BETWEEN $3 AND $4
       ORDER BY created_at DESC`,
      [lat_min, lat_max, lon_min, lon_max]
    );

    res.json({ message: "Notes retrieved successfully!", notes: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving notes: " + error });
  }
});

module.exports = router;
