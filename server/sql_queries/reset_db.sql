DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Ensure sequences exist before resetting them
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq') THEN
    ALTER SEQUENCE users_id_seq RESTART WITH 1;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'posts_id_seq') THEN
    ALTER SEQUENCE posts_id_seq RESTART WITH 1;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'comments_id_seq') THEN
    ALTER SEQUENCE comments_id_seq RESTART WITH 1;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'votes_id_seq') THEN
    ALTER SEQUENCE votes_id_seq RESTART WITH 1;
  END IF;
END $$;