# Student Mark and Event Management (stmark)

Full stack project inside `mark` using:
- React + Vite (frontend)
- Node + Express (backend)
- MySQL (database)

No login/auth is used.

## Features

- Student CRUD (Add, Edit, Delete)
- Activity CRUD (Add, Edit, Delete)
- Event CRUD (Add, Edit, Delete)
- Student_Activity mapping management (Add mark, Update mark, Delete entry)
- Student_Event mapping management (Add prize, Update prize, Delete entry)
- Dashboard stats
- Reports:
  - Student leaderboard
  - Activity participation
  - Event participation

Delete Student and Delete Event are fully available in both API and UI.

## Project Structure

- `client/` React Vite app
- `server/` Express API
- `server/sql/schema.sql` DB creation + table schema
- `server/sql/seed.sql` sample seed data

## 1) Setup Database (MySQL Workbench or Command Line)

### Create tables

Run schema file:

```sql
SOURCE c:/D/4th Sem/DBMS/project/mark/server/sql/schema.sql;
```

### Insert sample data

```sql
USE stmark;
SOURCE c:/D/4th Sem/DBMS/project/mark/server/sql/seed.sql;
```

If `SOURCE` path with spaces fails in your CLI, open the file and run statements manually in MySQL Workbench.

## 2) Configure Backend Env

Create file:
- `server/.env`

With content:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stmark
```

## 3) Run the App

From `mark/`:

```bash
npm run dev
```

This starts:
- Backend: `http://localhost:5000`
- Frontend: Vite URL printed in terminal (usually `http://localhost:5173`)

## API Summary

- `GET/POST /api/students`
- `PUT/DELETE /api/students/:roll`
- `GET/POST /api/activities`
- `PUT/DELETE /api/activities/:id`
- `GET/POST /api/events`
- `PUT/DELETE /api/events/:id`
- `GET/POST /api/student-activities`
- `PUT/DELETE /api/student-activities/:stid/:actid`
- `GET/POST /api/student-events`
- `PUT/DELETE /api/student-events/:stid/:evid`
- `GET /api/reports/dashboard`
- `GET /api/reports/leaderboard`
- `GET /api/reports/activity-participation`
- `GET /api/reports/event-participation`

## Notes

- Deleting a student automatically removes related rows in `Student_Activity` and `Student_Event` via `ON DELETE CASCADE`.
- Deleting an event automatically removes related rows in `Student_Event` via `ON DELETE CASCADE`.
- Deleting an activity automatically removes related rows in `Student_Activity` via `ON DELETE CASCADE`.
