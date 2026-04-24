# 🔧 Troubleshooting Guide

Complete solutions to common SRMS issues.

## 🚨 Critical Issues

### MongoDB Not Found or Not Running

**Symptoms:**
- `Error: connect ECONNREFUSED 127.0.0.1:27017`
- `MongoDB connection error`
- Database scripts fail immediately

**Solutions:**

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or verify service is installed
sc query MongoDB

# If service doesn't exist, install MongoDB Community Edition
# Download from https://www.mongodb.com/try/download/community
```

**Mac:**
```bash
# Start MongoDB via Homebrew
brew services start mongodb-community

# Check if running
brew services list | grep mongodb

# View logs if needed
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Enable auto-start
sudo systemctl enable mongod
```

**Verify Connection:**
```bash
cd database
npm run check
```

---

### Port 5000 Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE :::5000`
- Cannot start backend server

**Solutions:**

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
# Edit backend/.env and change PORT=5001
```

**Mac/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
# Edit backend/.env and change PORT=5001
```

---

### Node Modules Not Found

**Symptoms:**
- `Cannot find module 'express'`
- `Error: Cannot find module 'mongoose'`

**Solutions:**
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Same for database folder
cd ../database
rm -rf node_modules package-lock.json
npm install
```

---

## 🔌 Backend Issues

### Backend Server Won't Start

**Symptoms:**
- Terminal closes immediately
- Error messages in console
- No "Server running" message

**Debugging Steps:**

1. **Check Node.js is installed:**
```bash
node --version
npm --version
```

2. **Check .env file exists:**
```bash
cd backend
cat .env  # Mac/Linux
type .env # Windows
```

3. **Verify .env has required variables:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/srms
JWT_SECRET=test_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

4. **Try verbose logging:**
```bash
npm run dev 2>&1 | head -50
```

---

### CORS Error: Access Denied

**Symptoms:**
- Browser console shows: `Access to XMLHttpRequest blocked by CORS policy`
- `Cross-Origin Request Blocked`
- Cannot fetch from frontend to backend

**Solution:**

1. **Check frontend URL matches CLIENT_URL:**

If frontend runs on port 3000:
```env
CLIENT_URL=http://localhost:3000
```

If frontend runs on port 8000:
```env
CLIENT_URL=http://localhost:8000
```

2. **Restart backend after changing .env:**
```bash
npm run dev
```

3. **In production, use actual domain:**
```env
CLIENT_URL=https://srms.yourdomain.com
```

---

### API Returns 401 Unauthorized

**Symptoms:**
- Login fails with `Unauthorized`
- JWT token errors
- "Invalid token" message

**Solutions:**

1. **Verify database has users:**
```bash
cd database
npm run check
# Should show users collection with data
```

2. **Seed fresh data if needed:**
```bash
npm run seed
```

3. **Clear browser cookies and try again:**
   - Open DevTools (F12)
   - Application → Cookies → Delete all
   - Reload page and login

4. **Check JWT_SECRET is set:**
```bash
cd backend
cat .env | grep JWT_SECRET
# Should show non-empty value
```

---

### File Upload Fails

**Symptoms:**
- `ENOENT: no such file or directory` error
- Upload returns 500 error
- Files don't save

**Solutions:**

1. **Ensure uploads folder exists:**
```bash
# Create if missing
mkdir backend/uploads

# Verify
ls backend/uploads  # Mac/Linux
dir backend\uploads # Windows
```

2. **Check file permissions:**
```bash
# Make folder writable
chmod 755 backend/uploads  # Mac/Linux
```

3. **Check file size limit:**
- Current limit: 100MB
- Edit `backend/server.js` to change

4. **Verify disk space:**
```bash
df -h  # Mac/Linux
wmic logicaldisk get name,size,freespace  # Windows
```

---

## 🗄️ Database Issues

### "Collection Already Exists" Error

**Symptoms:**
- Seeding fails with duplicate key error
- Can't add users

**Solution:**

This is normal if running seed twice. It skips duplicates automatically.

To force clean slate:
```bash
cd database
npm run reset
```

This will:
1. Drop all collections
2. Re-seed fresh data

⚠️ **Warning**: All data will be deleted!

---

### Indexes Not Created

**Symptoms:**
- Search is slow
- Queries take long time
- High database CPU usage

**Solution:**
```bash
cd database
npm run index

# Should output:
# ✔  users.email          → unique index
# ✔  resources (text)     → full-text search index
# ... more indexes
```

---

### MongoDB URI Connection Issues

**Local Connection:**
```env
MONGO_URI=mongodb://localhost:27017/srms
```

**Atlas Cloud (MongoDB.com):**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Get connection string:
   - Click "Connect"
   - Select "Connect your application"
   - Copy connection string

3. Replace placeholders:
```env
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/srms
```

Example:
```env
MONGO_URI=mongodb+srv://admin:mypassword123@srms-cluster.j4k2p.mongodb.net/srms?retryWrites=true&w=majority
```

**Troubleshooting Atlas connection:**
- ✓ Verify username/password are correct
- ✓ Check IP whitelist (Network Access) includes your IP
- ✓ Ensure database name matches (srms)
- ✓ Try connection in MongoDB Compass first

---

## 🎨 Frontend Issues

### Frontend Can't Connect to Backend

**Symptoms:**
- "Failed to fetch" errors
- API calls timeout
- Network errors in browser console

**Debugging:**

1. **Verify backend is running:**
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Or in browser
http://localhost:5000/api/health
```

2. **Check CORS is configured:**
   - Backend `.env` should have `CLIENT_URL=http://localhost:3000`
   - Restart backend if changed

3. **Check firewall isn't blocking:**
   - Try connecting from different network if possible

4. **Verify frontend is calling correct URL:**
   - Open browser DevTools → Network tab
   - Check API URLs in requests
   - Should be `http://localhost:5000/api/...`

---

### Login Not Working

**Symptoms:**
- Login button doesn't respond
- Stays on login page
- "Invalid credentials" error

**Solutions:**

1. **Verify test credentials exist:**
```bash
cd database
npm run check
# Should show users collection
```

2. **Use correct credentials:**
   - Admin: `admin@srms.com` / `admin123`
   - Student: `urvashi@srms.com` / `student123`

3. **Check backend is running:**
```bash
npm run dev  # in backend folder
```

4. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages

---

### Resources Not Loading

**Symptoms:**
- Resource list is empty
- No resources appear in dashboard

**Solutions:**

1. **Check database has resources:**
```bash
cd database
npm run check
# Should show resources collection
```

2. **Verify seeding worked:**
```bash
npm run seed
```

3. **Check filters aren't too restrictive:**
   - Try clearing search/filters
   - Load resources without filters

4. **Check API response:**
   - Open DevTools → Network tab
   - Load resources page
   - Check `/api/resources` response
   - Should include resource array

---

## 🔐 Authentication Issues

### Token Expired Error

**Symptoms:**
- Suddenly logged out
- "Token expired" or "Invalid token" message
- Can't perform actions

**Solution:**
- Login again - tokens expire every 7 days
- Change expiration time in `.env` if needed:
```env
JWT_EXPIRES_IN=14d
```

---

### Can't Login After Changing Password

**Symptoms:**
- Old password doesn't work
- New password doesn't work
- Locked out

**Solution:**

1. **Reset using admin panel:**
   - Login as admin
   - Go to admin page
   - Find user, delete, then user re-registers

2. **Reset via database:**
```bash
cd database
npm run reset
# Re-seeds fresh data with default passwords
```

---

### Cookies Not Persisting

**Symptoms:**
- Logged out after page refresh
- Token not saved
- Can't stay logged in

**Solutions:**

1. **Check browser allows cookies:**
   - Settings → Privacy → Allow cookies
   - Check for this domain specifically

2. **Check in incognito/private mode:**
   - Open in private browser window
   - Try logging in again

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cookies and site data

---

## 🐢 Performance Issues

### Slow Queries / Slow Loading

**Symptoms:**
- Resources page takes 10+ seconds to load
- Search is very slow
- High database CPU usage

**Solutions:**

1. **Ensure indexes are created:**
```bash
cd database
npm run index
```

2. **Check database size:**
```bash
cd database
npm run check
# Note collection sizes
```

3. **Limit results per page:**
   - Default is 10 per page
   - Adjust `limit` parameter if needed

4. **Use specific filters:**
   - Filter by semester/subject first
   - Then search within results

---

## 📝 Logs & Debugging

### View Backend Logs

```bash
cd backend
npm run dev 2>&1 | tee server.log

# View log file
cat server.log  # Mac/Linux
type server.log # Windows
```

### View Database Logs

```bash
# MongoDB logs (Windows)
# Usually in: C:\Program Files\MongoDB\Server\7.0\log\

# MongoDB logs (Mac)
tail -f /usr/local/var/log/mongodb/mongo.log

# MongoDB logs (Linux)
sudo journalctl -u mongod
```

### View Browser Console

- Open DevTools: `F12` or `Right-click → Inspect`
- Go to "Console" tab
- Look for red error messages

### Enable Verbose Logging

Edit `backend/server.js` to add logging:
```javascript
console.log('Request received:', req.method, req.path);
console.log('Headers:', req.headers);
```

---

## 🆘 Still Having Issues?

### Checklist Before Asking for Help

- [ ] MongoDB is running (`npm run check` succeeds)
- [ ] No port conflicts (5000 and 3000 are free)
- [ ] `.env` file exists with all required variables
- [ ] `npm install` completed successfully
- [ ] `npm run seed` ran without errors
- [ ] Restarted both backend and browser
- [ ] Cleared browser cache and cookies
- [ ] Checked browser console for errors
- [ ] Checked server terminal for errors

### Information to Gather

When reporting an issue, provide:
1. Exact error message (screenshot preferred)
2. Steps to reproduce
3. What you were trying to do
4. Your OS (Windows/Mac/Linux)
5. Node.js version (`node --version`)
6. MongoDB version and location (local/Atlas)

### Quick Fixes

Try these in order:
```bash
# 1. Clear everything and reinstall
cd backend && rm -rf node_modules && npm install
cd ../database && rm -rf node_modules && npm install

# 2. Restart MongoDB
# Windows: net start MongoDB
# Mac: brew services restart mongodb-community

# 3. Reset database
cd database && npm run reset

# 4. Start fresh
cd backend && npm run dev
# New terminal: cd frontend && npx http-server -p 3000
```

---

## 📞 Need More Help?

- Review [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Check [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- Review [ENVIRONMENT_GUIDE.md](ENVIRONMENT_GUIDE.md)
- Check backend `server.js` for error handling code
- Review API route files for endpoint specifics

---

**If you've tried everything and still stuck:**
1. Delete everything and start fresh
2. Follow setup guide step-by-step carefully
3. Verify each step before moving to next
4. Check that output matches expected output in guides

**Good luck! 🚀**
