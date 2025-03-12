// server/index.js

const express = require("express");
const pool = require("./db");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
const markersRoute = require("./routes/markers.js");
const notesRoute = require("./routes/notes.js");
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

/** DEPRECATED : REGISTER A NEW USER : DEPRECATED */
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

/** Specific handling for Google OAuth */
app.post("/users/login", async (req, res) => {
  const { email, name } = req.body; // Extracted info from decoded JWT

  try {
    // If user already exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;
    let incompleteUser = false;
    if (userResult.rows.length === 0) {
      // If this is new user register it (no user found with given email)
      const newUserResult = await pool.query(
        "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *", // should not be returning everything -- Brandon
        [name, email]
      );
      user = newUserResult.rows[0];
      incompleteUser = true;
    } else {
      // User is not new
      user = userResult.rows[0];
      if (!user.major || !user.clubs) {
        incompleteUser = true;
      }
    }
    res
      .status(200)
      .json({ message: "Login successful!", user, incompleteUser }); // This is a very bad way of verifying a new user was created -- Brandon
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Error during login process." });
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

    const updatedUserResult = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    const updatedUser = updatedUserResult.rows[0];
    res.json({ message: "User updated successfully!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

// GET USER BASED ON ID
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT username, email, major, clubs FROM users
          WHERE id = $1`,
      [id]
    );

    if (result.rows.length != 1) {
      return res.status(404).json({ message: "User Not Found", user: null });
    }

    res.status(201).json({ message: "User found", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error getting user." });
  }
});

// GET NOTES BASED ON USER
app.get("/users/:id/notes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, user_id, title, latitude, longitude, bounds, body FROM notes
          WHERE user_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(200)
        .json({ message: "No notes found for this user.", notes: [] });
    }

    res.status(201).json({ message: "User note(s) found", notes: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error getting user." });
  }
});

// GET USERS COMMENTS
app.get("/users/:id/notes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM notes WHERE user_id = $1`, [
      id,
    ]);
    res.status(200).json({ notes: result.rows });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ error: "Error fetching user notes" });
  }
});

// GET USER BASED ON USERNAME
app.get("/users/username/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT username, email, major, clubs FROM users
          WHERE username = $1`,
      [username]
    );

    if (result.rows.length != 1) {
      return res.status(404).json({ message: "User Not Found", user: null });
    }

    res.status(200).json({ message: "User found", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error getting user." });
  }
});

/** POST A COMMENT */
app.post("/comments", async (req, res) => {
  const { user_id, note_id, parent_comment_id, body } = req.body;
  console.log(user_id, note_id, parent_comment_id, body);
  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, note_id, parent_comment_id, body) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, note_id, parent_comment_id, body]
    );

    res
      .status(201)
      .json({ message: "Comment posted!", comment: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error posting comment" });
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
    await pool.query(`DELETE FROM votes WHERE user_id = $1 AND note_id = $2`, [
      user_id,
      id,
    ]);

    res.json({ message: "Vote removed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error removing vote." });
  }
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

app.use("/markers", markersRoute);
app.use("/notes", notesRoute);

module.exports = app;
