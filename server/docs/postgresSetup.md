# Quick PostgreSQL Setup for BruinStreetMap

## 1. Install & Run PostgreSQL

### Option A: Local Installation

- **macOS (using Homebrew):**
  ```bash
  brew install postgresql
  brew services start postgresql
  ```
- **Windows/Linux:**  
  Download from [postgresql.org](https://www.postgresql.org/download/) and install.

### Option B: Using Docker

Run this command (replace `youruser` and `yourpassword` as needed):

````bash
docker run --name postgres-dev \
  -e POSTGRES_USER=youruser \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=mapnotes \
  -p 5432:5432 \
  -d postgres


## 2. Create User & Database (if not using Docker)

1. Open the PostgreSQL shell:
   ```bash
   psql -U postgres
````

2. In the shell, run:
   ```sql
   CREATE ROLE youruser WITH LOGIN PASSWORD 'yourpassword';
   CREATE DATABASE mapnotes WITH OWNER youruser;
   \q
   ```

## 3. Configure Your Environment

In the **server** directory, create a `.env` file with:

```ini
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_DATABASE=mapnotes
DB_PORT=5432
```

## 4. Install NPM Dependencies

From the **server** directory, run:

```bash
npm install
```

## 5. Initialize the Database Schema

From the **server** directory, run:

```bash
node setupDb.js
```

You should see:

```
Database setup completed.
```

---

Replace `youruser` and `yourpassword` with your actual computer credentials or PostgreSQL credentials. This setup will create the database needed for storing map notes.

```

```

# JS Scripts

use hardSetupDb.js to recreate all tables on the database
use setupDb.js to create the tables on the database (will not update tables that already exist)
use index.js to run the server

Tests do not work as of 2/23/25
