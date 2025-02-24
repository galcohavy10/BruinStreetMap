-- Force disconnect all active connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE datname = 'mapnotes' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS mapnotes;
CREATE DATABASE mapnotes WITH OWNER your_user;


-- Recreate the database
-- CREATE DATABASE mapnotes WITH OWNER your_user;