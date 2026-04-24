# 🔧 Environment Configuration Guide

This guide helps you properly configure environment variables for SRMS.

## 📋 What is .env?

The `.env` file contains sensitive configuration that should **NEVER be committed to git**:
- Database connection strings
- API keys and secrets
- Server ports
- Feature flags

**Rule**: Each developer has their own `.env` file locally.

---

## 🚀 Backend Configuration (.env)

### Location
```
backend/.env
```

### Template (.env.example)
A template file is provided at `backend/.env.example`. Copy it to create your `.env`:

```bash
cp backend/.env.example backend/.env
```

### Configuration Options

#### Server Settings

```env
PORT=5000
```
- The port where the Express server runs
- Default: `5000`
- Change if port is already in use

```env
NODE_ENV=development
```
- Execution environment
- Options: `development`, `production`
- In development: logs are more verbose, cors is relaxed
- In production: optimizations enabled, morgan disabled

#### Database Settings

```env
MONGO_URI=mongodb://localhost:27017/srms
```
- MongoDB connection string
- **Local**: `mongodb://localhost:27017/srms`
- **Atlas Cloud**: `mongodb+srv://user:password@cluster.mongodb.net/srms`
- Database name: `srms`

**For MongoDB Atlas Cloud:**
1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string from "Connect" button
3. Replace `<user>`, `<password>`, and `<cluster>` in the URI

Example:
```env
MONGO_URI=mongodb+srv://myuser:mypassword@srms-cluster.mongodb.net/srms?retryWrites=true&w=majority
```

#### JWT Settings

```env
JWT_SECRET=srms_super_secret_key_change_in_production
```
- Secret key for signing JWT tokens
- **MUST change** for production (use cryptographically secure random string)
- Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Length: 32+ characters recommended

```env
JWT_EXPIRES_IN=7d
```
- How long JWT tokens are valid
- Format: `7d` (7 days), `24h` (24 hours), `60m` (60 minutes)
- Default: `7d`

#### Frontend Configuration

```env
CLIENT_URL=http://localhost:3000
```
- URL where frontend is running (for CORS)
- **Local Development**: `http://localhost:3000`
- **Production**: Your actual frontend domain (e.g., `https://srms.myuniversity.edu`)

---

## 📁 Database Configuration Details

### Local MongoDB

**Default Connection String:**
```env
MONGO_URI=mongodb://localhost:27017/srms
```

**Verify Connection:**
```bash
cd database
npm run check
```

**Custom Port (if MongoDB runs on different port):**
```env
MONGO_URI=mongodb://localhost:27018/srms
```

### MongoDB Atlas (Cloud)

**Setup Steps:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy connection string
7. Replace placeholders:
   - `<username>` → Your database user
   - `<password>` → Your database password
   - `<cluster>` → Your cluster name

**Example Connection String:**
```env
MONGO_URI=mongodb+srv://admin:securepass@srms-cluster-abc.mongodb.net/srms?retryWrites=true&w=majority
```

---

## 🔐 JWT Secret Generation

### Secure Method (Using Node.js)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a7f3d9c2e1b4a8f6d9c3e2b7a1f4d8c9e2b7a1f4d8c9e2b7a1f4d8c9e2b7
```

Copy this and paste into your `.env`:
```env
JWT_SECRET=a7f3d9c2e1b4a8f6d9c3e2b7a1f4d8c9e2b7a1f4d8c9e2b7a1f4d8c9e2b7
```

### Online Generator

Use [Random.org](https://www.random.org/strings) or similar tool to generate a random 32+ character string.

---

## ✅ Configuration Checklist

- [ ] Created `backend/.env` from `.env.example`
- [ ] Set `PORT` to available port (default: 5000)
- [ ] Set `NODE_ENV` to development or production
- [ ] Verified `MONGO_URI` points to accessible MongoDB
- [ ] Generated and set unique `JWT_SECRET`
- [ ] Set `JWT_EXPIRES_IN` appropriately
- [ ] Set `CLIENT_URL` to correct frontend URL
- [ ] Added `.env` to `.gitignore`
- [ ] Did NOT commit `.env` to git

---

## 🚨 Common Configuration Issues

### Issue: MongoDB Connection Fails

**Symptoms**: `Error: connect ECONNREFUSED`

**Solutions**:
1. Verify MongoDB is running
2. Check MongoDB URI in `.env`
3. Ensure database name exists in URI
4. For Atlas, verify IP whitelist includes your IP

```bash
# Check connection
cd database
npm run check
```

### Issue: CORS Error in Browser

**Symptoms**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Verify `CLIENT_URL` matches frontend URL
```env
# If frontend runs at http://localhost:3000
CLIENT_URL=http://localhost:3000

# If frontend runs at http://localhost:8000
CLIENT_URL=http://localhost:8000
```

### Issue: JWT Token Not Working

**Symptoms**: `Invalid token` or `Unauthorized` on every request

**Solutions**:
1. Verify `JWT_SECRET` is set and not empty
2. Check `JWT_EXPIRES_IN` format is valid
3. Restart backend server after changing secrets
4. Clear browser cookies and login again

### Issue: File Upload Fails

**Symptoms**: `ENOENT: no such file or directory` when uploading

**Solution**: Ensure `backend/uploads/` folder exists
```bash
# Create if missing
mkdir -p backend/uploads
```

---

## 🔄 Environment-Specific Configurations

### Development

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/srms
JWT_SECRET=development_secret_key_123
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Staging

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/srms
JWT_SECRET=<strong-random-key>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://staging.srms.example.com
```

### Production

```env
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/srms
JWT_SECRET=<very-strong-random-key>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://srms.university.edu
```

---

## 🔒 Security Best Practices

### JWT Secret
- ✅ Use cryptographically secure random string (32+ chars)
- ✅ Unique for each environment
- ✅ Rotate periodically
- ❌ Don't use simple/predictable strings
- ❌ Don't hardcode in source code
- ❌ Don't commit to git

### Database Credentials
- ✅ Use strong passwords (16+ chars with special chars)
- ✅ Use IP whitelist in MongoDB Atlas
- ✅ Use network policies
- ✅ Store in environment variables only
- ❌ Don't use default credentials
- ❌ Don't expose in error messages
- ❌ Don't share connection strings in chat

### Frontend URL
- ✅ Use HTTPS in production
- ✅ Restrict to your domain
- ✅ Use specific URLs (not wildcard *)
- ❌ Don't allow all origins (`*` with credentials)
- ❌ Don't use localhost in production

---

## 📚 Environment Variables Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| PORT | ✓ | 5000 | 5000 |
| NODE_ENV | ✓ | development | production |
| MONGO_URI | ✓ | None | mongodb://localhost:27017/srms |
| JWT_SECRET | ✓ | None | a7f3d9c2e1b4a8f6... |
| JWT_EXPIRES_IN | ✗ | 7d | 24h |
| CLIENT_URL | ✓ | http://localhost:3000 | https://srms.example.com |

---

## 🧪 Testing Your Configuration

### 1. Test Backend Server Starts

```bash
cd backend
npm run dev
```

Expected output:
```
✅  MongoDB Connected: localhost
🚀  Server running in development mode on port 5000
📡  API Base: http://localhost:5000/api
```

### 2. Test Database Connection

```bash
cd database
npm run check
```

Expected output:
```
✅  Connected successfully!
```

### 3. Test Health Endpoint

Open browser or curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "SRMS API is running 🚀",
  "timestamp": "2026-04-25T10:30:00.000Z"
}
```

### 4. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@srms.com","password":"admin123"}'
```

Expected response includes JWT token.

---

## 📖 Additional Resources

- [Node.js Environment Variables Guide](https://nodejs.org/en/knowledge/file-system/how-to-use-the-FS-module-to-work-with-files-in-a-directory/)
- [dotenv npm Package](https://www.npmjs.com/package/dotenv)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [JWT Introduction](https://jwt.io/introduction)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Happy Configuring! ⚙️**
