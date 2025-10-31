# Horse Racing API

Simple Express + MySQL application for managing and viewing horse racing data. This project exposes admin endpoints to manage races, owners, horses, and trainers, and guest endpoints for read-only views.

## Contents

- `server.js` — application entry point
- `src/` — main server source
- `public/` — simple HTML pages for UI (guest/admin)
- `database/` — SQL scripts to create schema and seed data

## Prerequisites

- Node.js (v16+ recommended)
- MySQL server (or compatible) with ability to run the SQL in `database/`
- npm (or yarn)

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with the following variables:

```env
# Example .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=horse_racing_db
PORT=3000
NODE_ENV=development
```

3. Initialize the database:

- Open your MySQL client and run the scripts in the `database/` folder in order:
  - `00_init.sql`
  - `01_schema.sql`
  - `02_seed.sql`
  - `03_indexes_constraints.sql`
  - `04_admin_procedures.sql`
  - `05_triggers.sql`
  - `7_guest_procedures.sql`

These scripts create tables, add sample data, and define stored procedures used by the API.

Note: If your MySQL user lacks permissions, run the SQL as a user with sufficient privileges.

## Run

Start the server:

```bash
node server.js
# or with nodemon for development
npx nodemon server.js
```

If the DB connection is successful the server will print available guest and admin endpoints.

## API Endpoints (guest)

These are read-only endpoints used by the frontend pages in `public/`.

- GET /api/guest/owner/:lname/horses — Get horses and trainers for an owner by last name
- GET /api/guest/trainers/winners — Get trainers with wins
- GET /api/guest/trainers/winnings — Get trainers total winnings
- GET /api/guest/tracks/stats — Get track statistics

## Admin Endpoints (examples)

- POST /api/admin/race — Create a new race
- POST /api/admin/race/result — Submit race results
- DELETE /api/admin/owner/:ownerId — Delete an owner
- PUT /api/admin/horse/:horseId/stable — Move horse to another stable
- POST /api/admin/trainer — Create a trainer

Check the files under `src/controllers/` and `src/routes/` for full details on request bodies and parameter names.

## Frontend

Open files in `public/` directly in a browser or host them and let them call the API. The HTML files are simple pages that expect the server to be running at `http://localhost:3000` by default.

## Troubleshooting

- "Cannot find module 'dotenv'": run `npm install dotenv` (this project includes dotenv in `package.json`)
- DB connection failed: check `.env` values and ensure MySQL is running and accessible
- No data shown on guest pages: verify the stored procedures in `database/7_guest_procedures.sql` were imported and that the procedure names match the ones used in `src/controllers/guestController.js`.

If you want, I can also:

- Run quick checks on your controllers/routes to ensure the endpoint names and stored procedure names match the SQL.
- Add example cURL commands or Postman collection.

## Next steps (suggested)

- Add API documentation (OpenAPI/Swagger)
- Add unit/integration tests for controllers
- Add input validation and request schema checks

---

Generated README — feel free to ask for more details or for me to commit this change.
