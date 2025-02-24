-- Insert Users
INSERT INTO users (username, email, major, clubs) VALUES
    ('alice123', 'alice@example.com', 'Computer Science', ARRAY['AI Club', 'Robotics']),
    ('maya12', 'maya21@example.com', 'Computer Science', ARRAY['Robotics', 'Chess Club']),
    ('bob456', 'bob@example.com', 'Physics', ARRAY['Astronomy Club']),
    ('charlie789', 'charlie@example.com', 'Mathematics', ARRAY['Math Club', 'Chess Club']),
    ('dave101', 'dave@example.com', 'Engineering', ARRAY['Rocketry Club']),
    ('eve202', 'eve@example.com', 'Biology', ARRAY['Bioinformatics']);

-- Insert Posts (Coordinates are for UCLA area)
INSERT INTO posts (user_id, title, latitude, longitude, body) VALUES
    (1, 'AI in Robotics', 34.0689, -118.4452, 'Exploring the impact of AI in robotics.'),
    (2, 'Black Holes and Time Travel', 34.0699, -118.4423, 'Discussion on the physics of black holes.'),
    (3, 'Cool Math Tricks', 34.0655, -118.4478, 'Some interesting tricks to amaze your friends.'),
    (4, 'Building Rockets in College', 34.0639, -118.4445, 'A guide to student-led rocketry projects.'),
    (5, 'CRISPR and Gene Editing', 34.0710, -118.4431, 'How gene editing is changing the world.');

-- Insert Comments (Replies indicated by parent_comment_id)
INSERT INTO comments (post_id, user_id, parent_comment_id, body) VALUES
    (1, 2, NULL, 'This is a fascinating topic!'),
    (1, 3, 1, 'Totally agree, AI is the future.'),
    (2, 4, NULL, 'I always wondered about the paradoxes in time travel.'),
    (3, 5, NULL, 'Math is so cool when you learn the right tricks!'),
    (3, 1, 4, 'Yes! Mental math tricks are amazing.');

-- Insert Votes (Upvotes & Downvotes for Posts)
INSERT INTO votes (user_id, post_id, upvote, downvote) VALUES
    (1, 2, TRUE, FALSE),
    (2, 3, TRUE, FALSE),
    (3, 4, TRUE, FALSE),
    (4, 5, FALSE, TRUE),  -- Downvoted Post
    (5, 1, TRUE, FALSE);

-- Insert Votes (Upvotes & Downvotes for Comments)
INSERT INTO votes (user_id, comment_id, upvote, downvote) VALUES
    (1, 1, TRUE, FALSE),
    (2, 2, TRUE, FALSE),
    (3, 3, FALSE, TRUE),  -- Downvoted Comment
    (4, 4, TRUE, FALSE),
    (5, 5, TRUE, FALSE);