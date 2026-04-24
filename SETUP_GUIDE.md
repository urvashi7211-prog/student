# 🎓 SRMS (Student Resource Management System) - Complete Setup Guide

This comprehensive guide will get your SRMS project running from scratch.

---

## 📋 Prerequisites

### Required Software
1. **Node.js** (LTS version) - Download from [nodejs.org](https://nodejs.org)
   - Verify: `node --version` and `npm --version`

2. **MongoDB Community Edition** - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Windows**: Select "Install MongoDB as a Service" during installation
   - **Verify**: MongoDB should auto-start, or manually start with `net start MongoDB` (Windows)
   - **Optional**: Install [MongoDB Compass](https://www.mongodb.com/products/tools/compass) for GUI access

3. **Git** (for version control) - Download from [git-scm.com](https://git-scm.com)

---

## 🚀 Step-by-Step Setup

### Step 1: Verify MongoDB Connection

Open a terminal and run:
```bash
# Navigate to database folder
cd database

# Install database dependencies
npm install

# Test MongoDB connection
npm run check
```

**Expected Output:**
```
✅  Connected successfully!
📭  No collections found. Database is empty.
    Run: node database/seed.js  — to populate sample data.
```

If MongoDB is not running, start it:
- **Windows**: `net start MongoDB`
- Or open MongoDB Compass and connect to `mongodb://localhost:27017`

---

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd ../backend

# Install backend dependencies
npm install

# Verify .env file is configured
# Contents should be:
# PORT=5000
# NODE_ENV=development
# MONGO_URI=mongodb://localhost:27017/srms
# JWT_SECRET=srms_super_secret_key_change_in_production
# JWT_EXPIRES_IN=7d
# CLIENT_URL=http://localhost:3000
```

**⚠️ Important**: Never commit `.env` to git. Keep it local only.

---

### Step 3: Prepare Database

Back in the `database/` folder, run in order:

```bash
cd ../database

# Step 1: Create indexes for performance
npm run index

# Step 2: Seed sample data
npm run seed
```

**Expected Output:**
```
🌱  SRMS Database Seeder
─────────────────────────────────────────────────────────
👤  Seeding users...
    ✔  Created [admin  ] Admin User <admin@srms.com>
    ✔  Created [student] Urvashi Singh <urvashi@srms.com>
    ...
🎉  Seeding complete!
    Users          : 5
    Resources      : 12
    Notifications  : 3
```

**Test Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@srms.com | admin123 |
| Student | urvashi@srms.com | student123 |

---

### Step 4: Start Backend Server

```bash
cd ../backend

# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

**Expected Output:**
```
✅  MongoDB Connected: localhost
🚀  Server running in development mode on port 5000
📡  API Base: http://localhost:5000/api
```

Test health check in your browser:
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SRMS API is running 🚀",
  "timestamp": "2026-04-25T10:30:00Z"
}
```

---

### Step 5: Start Frontend

```bash
# Navigate to frontend folder
cd ../frontend

# Open in browser (no build step needed - it's static HTML/CSS/JS)
# Option 1: Use VS Code Live Server extension
# Option 2: Use Python
python -m http.server 3000

# Option 3: Use Node.js http-server (install globally first)
npx http-server -p 3000
```

Access frontend at: **http://localhost:3000**

---

## 📦 Project Structure

```
s1/
├── backend/                    # Express.js API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── resourceController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/            # Auth & role checks
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Resource.js
│   │   └── Notification.js
│   ├── routes/                # API endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/               # User uploaded files
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env                   # Local configuration (DO NOT COMMIT)
│   ├── .env.example           # Template for .env
│   ├── package.json
│   └── server.js              # Main server file
│
├── database/                  # Database utilities
│   ├── schema.js              # Collection structure reference
│   ├── seed.js                # Populate sample data
│   ├── reset.js               # Drop & re-seed (dev only)
│   ├── indexes.js             # Create performance indexes
│   ├── check.js               # Test MongoDB connection
│   ├── README.md              # Database docs
│   └── package.json
│
└── frontend/                  # HTML/CSS/JS frontend
    ├── index.html             # Homepage
    ├── login.html             # (if separate)
    ├── dashboard.html         # Student dashboard
    ├── resources.html         # Browse resources
    ├── upload.html            # Upload resources
    ├── admin.html             # Admin panel
    ├── profile.html           # User profile
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js             # API client functions
        ├── auth.js            # Login/logout logic
        ├── dashboard.js
        ├── resources.js
        ├── upload.js
        ├── admin.js
        └── profile.js
```

---

## 🔄 Common Tasks

### Reset Database (⚠️ Deletes All Data)

```bash
cd database
npm run reset
```

This will:
1. Drop all collections
2. Remove all data
3. Re-seed fresh sample data

> **⚠️ WARNING**: Use only in development. Never run in production.

---

### View Data in MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `srms`
4. Browse collections: `users`, `resources`, `notifications`

---

### API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/resources` | List all resources (with search & filters) |
| POST | `/api/resources` | Upload new resource |
| GET | `/api/resources/:id` | Get resource details |
| GET | `/api/resources/:id/download` | Download resource file |
| GET | `/api/admin/users` | Admin: List all users |
| GET | `/api/admin/resources` | Admin: List all resources |
| PUT | `/api/admin/resources/:id/approve` | Admin: Approve resource |

Full API documentation is available in the backend routes.

---

## 🐛 Troubleshooting

### Problem: MongoDB Connection Failed

**Solution:**
```bash
# Check if MongoDB is running (Windows)
net start MongoDB

# Or start MongoDB manually
mongod

# Verify in MongoDB Compass: connection to localhost:27017 should work
```

### Problem: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

### Problem: CORS Error When Accessing Backend from Frontend

**Solution:**
- Verify `CLIENT_URL` in backend `.env` matches your frontend URL
- Ensure backend is running on the port specified in API calls
- Check browser console for exact error message

### Problem: File Upload Fails

**Solution:**
1. Check `backend/uploads/` folder exists and is writable
2. Verify file size is under 100MB (limit in server.js)
3. Check disk space available
4. Verify `multer` is properly configured in routes

### Problem: Seeding Gives "Already exists" Error

**Solution:**
This is expected if you run `npm run seed` twice. It skips duplicate emails.

To re-seed fresh data:
```bash
npm run reset  # This automatically re-seeds
```

---

## 📚 Learning Resources

### Database Queries
- [MongoDB Query Documentation](https://docs.mongodb.com/manual/crud/)
- [Mongoose Documentation](https://mongoosejs.com/)

### API Development
- [Express.js Guide](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)

### Frontend Integration
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use a cloud MongoDB (e.g., MongoDB Atlas)
- [ ] Set `CLIENT_URL` to your frontend domain
- [ ] Add error logging (e.g., Sentry)
- [ ] Enable HTTPS
- [ ] Set up environment variables on hosting platform
- [ ] Test all API endpoints
- [ ] Enable CORS restrictions (only allow your domain)
- [ ] Set up database backups
- [ ] Use process manager (e.g., PM2) for Node.js

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify MongoDB is running
3. Check `.env` configuration
4. View server logs for error messages
5. Check browser console for frontend errors

---

**Happy learning! 🎓**
