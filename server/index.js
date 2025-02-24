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

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * from users`);

    res.status(201).json({ message: "Users found", users: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error getting users: " + error });
  }
});

/** REGISTER A NEW USER */
app.post("/users/register", async (req, res) => {
  const { username, email, major, clubs } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, major, clubs) 
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, major, clubs`,
      [username, email, major, clubs]
    );

    res
      .status(201)
      .json({ message: "User registered successfully!", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error registering user: " + error });
  }
});

/** UPDATE USER INFO */
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, major, clubs } = req.body;

  try {
    await pool.query(
      `UPDATE users SET 
        username = COALESCE($1, username), 
        email = COALESCE($2, email), 
        major = COALESCE($3, major), 
        clubs = COALESCE($4, clubs) 
      WHERE id = $5`,
      [username, email, major, clubs, id]
    );

    res.json({ message: "User updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

/** POST A COMMENT */
app.post("/comments", async (req, res) => {
  const { user_id, post_id, parent_comment_id, body } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, parent_comment_id, body) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, post_id, parent_comment_id, body]
    );

    res
      .status(201)
      .json({ message: "Comment posted!", comment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error posting comment" });
  }
});

/** POST A NEW POST */
app.post("/posts", async (req, res) => {
  const { user_id, title, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, latitude, longitude) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, latitude, longitude]
    );

    res.status(201).json({ message: "Post created!", post: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

/** GET A SPECIFIC POST */
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post" });
  }
});

app.get("/posts/:id/votes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE upvote = TRUE) AS upvotes,
        COUNT(*) FILTER (WHERE downvote = TRUE) AS downvotes
      FROM votes WHERE post_id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching votes" });
  }
});

app.get("/comments/:id/votes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE upvote = TRUE) AS upvotes,
        COUNT(*) FILTER (WHERE downvote = TRUE) AS downvotes
      FROM votes WHERE comment_id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching votes" });
  }
});

app.post("/comments/:id/upvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO votes (user_id, comment_id, upvote, downvote)
      VALUES ($1, $2, TRUE, FALSE)
      ON CONFLICT (user_id, comment_id)
      DO UPDATE SET upvote = TRUE, downvote = FALSE
      `,
      [user_id, id]
    );

    res.status(200).json({ message: "Upvoted comment successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error Upvoting comment." });
  }
});

app.post("/comments/:id/downvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO votes (user_id, comment_id, upvote, downvote)
      VALUES ($1, $2, FALSE, TRUE)
      ON CONFLICT (user_id, comment_id)
      DO UPDATE SET upvote = FALSE, downvote = TRUE
      `,
      [user_id, id]
    );

    res.status(200).json({ message: "Downvoted comment successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error Downvoting comment." });
  }
});

app.post("/comments/:id/remove-vote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    await pool.query(`DELETE FROM votes WHERE user_id = $1 AND post_id = $2`, [
      user_id,
      id,
    ]);

    res.json({ message: "Vote removed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error removing vote." });
  }
});

/** FILTER POSTS BY USER INFO (Major & Clubs) */
app.get("/posts/filter", async (req, res) => {
  const { major, clubs } = req.query;

  try {
    const result = await pool.query(
      `SELECT posts.* FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE ($1 IS NULL OR users.major = $1)
       AND ($2 IS NULL OR users.clubs @> ARRAY[$2])`,
      [major, clubs]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error filtering posts" });
  }
});

app.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
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

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM posts ORDER BY created_at DESC`
    );
    res
      .status(200)
      .json({ message: "Posts retrieved successfully!", posts: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts" });
  }
});

app.post("/posts/:id/upvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Insert or update the vote record
    await pool.query(
      `INSERT INTO votes (user_id, post_id, upvote, downvote)
       VALUES ($1, $2, TRUE, FALSE)
       ON CONFLICT (user_id, post_id) 
       DO UPDATE SET upvote = TRUE, downvote = FALSE`,
      [user_id, id]
    );

    res.json({ message: "Upvoted post successfully!" });
  } catch (error) {
    console.log("Error upvoting post: ", error);
    res.status(500).json({ error: "Error upvoting post" });
  }
});

app.post("/posts/:id/downvote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Insert or update the vote record
    await pool.query(
      `INSERT INTO votes (user_id, post_id, upvote, downvote)
       VALUES ($1, $2, FALSE, TRUE)
       ON CONFLICT (user_id, post_id) 
       DO UPDATE SET upvote = FALSE, downvote = TRUE`,
      [user_id, id]
    );

    res.json({ message: "Downvoted post successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error downvoting post" });
  }
});

app.post("/posts/:id/remove-vote", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    await pool.query(`DELETE FROM votes WHERE user_id = $1 AND post_id = $2`, [
      user_id,
      id,
    ]);

    res.json({ message: "Vote removed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error removing vote" });
  }
});

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `UPDATE posts SET 
        title = COALESCE($1, title), 
        latitude = COALESCE($2, latitude), 
        longitude = COALESCE($3, longitude)
      WHERE id = $4 RETURNING *`,
      [title, latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post updated successfully!", post: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error updating post: " + error });
  }
});

app.get("/posts/bounding-box", async (req, res) => {
  const { lat_min, lat_max, lon_min, lon_max } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM posts 
       WHERE latitude BETWEEN $1 AND $2
       AND longitude BETWEEN $3 AND $4
       ORDER BY created_at DESC`,
      [lat_min, lat_max, lon_min, lon_max]
    );

    res.json({ message: "Posts retrieved successfully!", posts: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts: " + error });
  }
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
