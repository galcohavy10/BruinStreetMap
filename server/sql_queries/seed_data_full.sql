-- Insert Users
INSERT INTO users (username, email, major, clubs) VALUES
    ('alice123', 'alice@example.com', 'Computer Science', ARRAY['AI Club', 'Robotics']),
    ('maya12', 'maya21@example.com', 'Computer Science', ARRAY['Robotics', 'Chess Club']),
    ('bob456', 'bob@example.com', 'Physics', ARRAY['Astronomy Club']),
    ('charlie789', 'charlie@example.com', 'Mathematics', ARRAY['Math Club', 'Chess Club']),
    ('dave101', 'dave@example.com', 'Engineering', ARRAY['Rocketry Club']),
    ('eve202', 'eve@example.com', 'Biology', ARRAY['Bioinformatics']),
    ('frank303', 'frank@example.com', 'Computer Science', ARRAY['AI Club']),
    ('grace404', 'grace@example.com', 'Physics', ARRAY['Robotics', 'Astronomy Club']),
    ('hank505', 'hank@example.com', 'Mathematics', ARRAY['Math Club', 'Chess Club']),
    ('ivy606', 'ivy@example.com', 'Engineering', ARRAY['Rocketry Club', 'Robotics']),
    ('jack707', 'jack@example.com', 'Biology', ARRAY['Bioinformatics', 'Environmental Club']),
    ('karen808', 'karen@example.com', 'Computer Science', ARRAY['AI Club', 'Women in Tech']);

-- Insert Notes (Coordinates are for UCLA area)
INSERT INTO notes (user_id, title, latitude, longitude, body) VALUES
    (1, 'AI in Robotics', 34.0689, -118.4452, 'Exploring the impact of AI in robotics.'),
    (2, 'Black Holes and Time Travel', 34.0699, -118.4423, 'Discussion on the physics of black holes.'),
    (3, 'Cool Math Tricks', 34.0655, -118.4478, 'Some interesting tricks to amaze your friends.'),
    (4, 'Building Rockets in College', 34.0639, -118.4445, 'A guide to student-led rocketry projects.'),
    (5, 'CRISPR and Gene Editing', 34.0710, -118.4431, 'How gene editing is changing the world.'),
    (6, 'Quantum Computing Basics', 34.0700, -118.4500, 'An introduction to quantum computing.'),
    (7, 'The Future of Space Exploration', 34.0720, -118.4510, 'Discussing upcoming missions to Mars.'),
    (8, 'Mathematics in Nature', 34.0690, -118.4480, 'Exploring patterns in nature through math.'),
    (9, 'Sustainable Energy Solutions', 34.0670, -118.4460, 'Innovations in renewable energy.'),
    (10, 'The Ethics of AI', 34.0640, -118.4440, 'Debating the ethical implications of AI technology.');

-- Insert Comments (Replies indicated by parent_comment_id)
INSERT INTO comments (note_id, user_id, parent_comment_id, body) VALUES
    (1, 2, NULL, 'This is a fascinating topic!'),
    (1, 3, 1, 'Totally agree, AI is the future.'),
    (2, 4, NULL, 'I always wondered about the paradoxes in time travel.'),
    (3, 5, NULL, 'Math is so cool when you learn the right tricks!'),
    (3, 1, 4, 'Yes! Mental math tricks are amazing.'),
    (4, 6, NULL, 'Rocketry is such an exciting field!'),
    (5, 7, NULL, 'Gene editing has so much potential.'),
    (6, 8, NULL, 'Quantum computing will change everything!'),
    (7, 9, NULL, 'Space exploration is the next frontier.'),
    (8, 10, NULL, 'Nature is full of mathematical wonders!');

-- Insert Votes (Upvotes & Downvotes for Posts)
INSERT INTO votes (user_id, note_id, upvote, downvote) VALUES
    (1, 2, TRUE, FALSE),
    (2, 3, TRUE, FALSE),
    (3, 4, TRUE, FALSE),
    (4, 5, FALSE, TRUE),  -- Downvoted Post
    (5, 1, TRUE, FALSE),
    (6, 6, TRUE, FALSE),
    (7, 7, TRUE, FALSE),
    (8, 8, TRUE, FALSE),
    (9, 9, FALSE, TRUE),  -- Downvoted Post
    (10, 10, TRUE, FALSE);

-- Insert Votes (Upvotes & Downvotes for Comments)
INSERT INTO votes (user_id, comment_id, upvote, downvote) VALUES
    (1, 1, TRUE, FALSE),
    (2, 2, TRUE, FALSE),
    (3, 3, FALSE, TRUE),  -- Downvoted Comment
    (4, 4, TRUE, FALSE),
    (5, 5, TRUE, FALSE),
    (6, 6, TRUE, FALSE),
    (7, 7, TRUE, FALSE),
    (8, 8, FALSE, TRUE),  -- Downvoted Comment
    (9, 9, TRUE, FALSE),
    (10, 10, TRUE, FALSE);