# SRMS — Database

Local MongoDB setup, seed scripts, and schema reference for the  
**Student Resource Management System**.

---

## 📁 Files in This Folder

| File | Purpose |
|---|---|
| `check.js` | Test MongoDB connection + list collections |
| `seed.js` | Populate database with sample data |
| `reset.js` | Drop all data and re-seed (dev only) |
| `indexes.js` | Create all performance/search indexes |
| `schema.js` | Schema reference for all collections |
| `package.json` | npm scripts for the above |

---

## 🛠 Prerequisites

### 1. Install Node.js
Download LTS from **https://nodejs.org**

### 2. Install MongoDB Community Edition (Local)
Download from **https://www.mongodb.com/try/download/community**

- During install, select **"Install MongoDB as a Service"** (auto-starts with Windows)
- Optionally install **MongoDB Compass** (GUI) for visual inspection

**Default local URI:** `mongodb://localhost:27017`

### 3. Install dependencies

Open terminal in this `database/` folder:
```bash
npm install
```

> The scripts share the same `mongoose`, `bcryptjs`, `dotenv` versions as the backend.

---

## 🚀 Quick Start (Run in Order)

```bash
# Step 1 — Check if MongoDB is reachable
npm run check

# Step 2 — Create indexes for performance
npm run index

# Step 3 — Seed sample data
npm run seed
```

That's it — your database is ready!

---

## 🔄 Reset Database (Development Only)

If you want to wipe everything and start fresh:
```bash
npm run reset
```
> This requires the `--confirm` flag (already included in package.json script).  
> ⚠ Never run this in production.

---

## 📋 What Gets Seeded

### Users (5 total)
| Name | Email | Password | Role |
|---|---|---|---|
| Admin User | admin@srms.com | `admin123` | Admin |
| Urvashi Singh | urvashi@srms.com | `student123` | Student |
| Rahul Sharma | rahul@srms.com | `student123` | Student |
| Priya Mehta | priya@srms.com | `student123` | Student |
| Arjun Verma | arjun@srms.com | `student123` | Student |

### Resources (12 total)
| Category | Count | Examples |
|---|---|---|
| Notes (PDF) | 5 | DS Notes, OS Scheduling, Networks OSI |
| Notes (Video) | 2 | Sorting Algorithms, SQL Joins |
| Syllabus | 2 | Sem 3, Sem 5 Official Syllabus |
| Question Papers | 2 | DS 2023, OS Mid-Sem 2024 |
| Assignment | 1 | SE UML Diagrams |

### Notifications (3 broadcast)
- Welcome message
- Exam schedule announcement
- Upload guidelines reminder

---

## 🗄 Collections & Schema

### `users`
```
_id, name, email, password (hashed), role, course,
semester, interests[], profilePicture, notifications[], 
createdAt, updatedAt
```

### `resources`
```
_id, title, description, fileUrl, fileName, fileSize,
fileType (pdf|video|image|document|other),
category (notes|assignment|syllabus|question_paper|other),
subject, semester, topic, tags[], uploadedBy (→User),
downloadCount, isApproved, createdAt, updatedAt
```

### `notifications`
```
_id, title, message, type (info|warning|success|alert),
recipients[] (→User), isBroadcast, createdBy (→User),
readBy[] (→User), createdAt, updatedAt
```

---

## 🔍 Viewing Data in MongoDB Compass

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. Select database: **`srms`**
4. Browse collections: `users`, `resources`, `notifications`

---

## ⚠ Notes

- The `seed.js` script **skips duplicate emails** — safe to run multiple times
- The `password` field is **never returned** in API responses (`select: false`)
- Uploaded files are stored in `backend/uploads/` — seed data only creates DB records (no actual files)
- The full-text search index on `resources` enables the search bar in the frontend
