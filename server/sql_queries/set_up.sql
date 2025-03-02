CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    major VARCHAR(100),  -- User's major for filtering
    clubs TEXT[],  -- Array of clubs user is part of
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title TEXT NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT NULL,  -- NULL for top-level comments
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    text TEXT DEFAULT '',
    color VARCHAR(7) DEFAULT '#000000',
    font_size VARCHAR(10) DEFAULT '20px',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,  -- Either post_id OR comment_id OR note_id is used
    comment_id INT NULL,
    note_id INT NULL,  -- Added note_id column
    upvote BOOLEAN DEFAULT FALSE,  -- Tracks if user upvoted
    downvote BOOLEAN DEFAULT FALSE,  -- Tracks if user downvoted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,  -- Added foreign key for notes
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL AND note_id IS NULL)
        OR (post_id IS NULL AND comment_id IS NOT NULL AND note_id IS NULL)
        OR (post_id IS NULL AND comment_id IS NULL AND note_id IS NOT NULL)
    ),
    CHECK (
        NOT (upvote = TRUE AND downvote = TRUE)  -- Prevent upvote & downvote at the same time
    )
);

-- Ensure a user can only upvote OR downvote a post once
CREATE UNIQUE INDEX IF NOT EXISTS unique_post_vote 
ON votes(user_id, post_id) 
WHERE post_id IS NOT NULL;

-- Ensure a user can only upvote OR downvote a comment once
CREATE UNIQUE INDEX IF NOT EXISTS unique_comment_vote 
ON votes(user_id, comment_id) 
WHERE comment_id IS NOT NULL;

-- Ensure a user can only upvote OR downvote a note once
CREATE UNIQUE INDEX IF NOT EXISTS unique_note_vote 
ON votes(user_id, note_id) 
WHERE note_id IS NOT NULL;

-- Optimize queries for filtering and foreign key lookups
CREATE INDEX IF NOT EXISTS idx_users_major ON users(major);
CREATE INDEX IF NOT EXISTS idx_users_clubs ON users USING GIN(clubs); -- Optimized for array filtering
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_note_id ON votes(note_id);