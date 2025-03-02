-- Add note_id column to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS note_id INT;

-- Add foreign key constraint
ALTER TABLE votes ADD FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE;

-- Update the check constraint to include note_id
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_check;
ALTER TABLE votes ADD CONSTRAINT votes_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND note_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL AND note_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NULL AND note_id IS NOT NULL)
);

-- Create a unique index for note votes
CREATE UNIQUE INDEX IF NOT EXISTS unique_note_vote 
ON votes(user_id, note_id) 
WHERE note_id IS NOT NULL;

-- Update the unique constraints
ALTER TABLE votes DROP CONSTRAINT IF EXISTS unique_user_post_vote;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS unique_user_comment_vote;
ALTER TABLE votes ADD CONSTRAINT unique_user_post_vote UNIQUE (user_id, post_id) WHERE post_id IS NOT NULL;
ALTER TABLE votes ADD CONSTRAINT unique_user_comment_vote UNIQUE (user_id, comment_id) WHERE comment_id IS NOT NULL;
ALTER TABLE votes ADD CONSTRAINT unique_user_note_vote UNIQUE (user_id, note_id) WHERE note_id IS NOT NULL;