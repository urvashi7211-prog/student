# 📚 SRMS Project Documentation

## Project Overview

**SRMS** (Student Resource Management System) is a web application designed to help students and administrators manage, share, and organize educational resources (notes, assignments, question papers, syllabi, and videos).

### Key Features

- 🔐 **User Authentication**: Secure login with JWT tokens
- 👤 **User Roles**: Student and Admin roles with different permissions
- 📚 **Resource Management**: Upload, download, and organize study materials
- 🔍 **Full-Text Search**: Search resources by title, subject, topic, tags
- 📊 **Admin Dashboard**: Monitor users, approve resources, send notifications
- 📬 **Notifications**: Broadcast announcements to all users or specific students
- 💾 **Database Persistence**: MongoDB for data storage
- 🔒 **Authorization**: Role-based access control (RBAC)

---

## Architecture

### Tech Stack

```
Frontend (Client-Side):
├── HTML5         — Structure
├── CSS3          — Styling
├── Vanilla JS    — Interactivity (no framework)
└── Fetch API     — Backend communication

Backend (Server-Side):
├── Node.js       — Runtime
├── Express.js    — Web framework
├── Mongoose      — MongoDB ODM
├── JWT           — Authentication
├── bcryptjs      — Password hashing
├── Multer        — File upload handling
└── CORS          — Cross-origin requests

Database:
└── MongoDB       — NoSQL database
```

---

## Data Models

### 1. User Collection

```javascript
{
  _id:             ObjectId      (auto-generated)
  name:            String        (required)
  email:           String        (required, unique, lowercase)
  password:        String        (hashed with bcrypt, select:false)
  role:            String        (enum: 'student', 'admin')
  course:          String        (e.g., "B.Tech CSE")
  semester:        Number        (1-12)
  interests:       [String]      (e.g., ["AI", "Web Dev"])
  profilePicture:  String        (URL/path)
  notifications:   [
    {
      message:     String
      isRead:      Boolean
      createdAt:   Date
    }
  ]
  createdAt:       Date          (auto)
  updatedAt:       Date          (auto)
}
```

### 2. Resource Collection

```javascript
{
  _id:             ObjectId      (auto-generated)
  title:           String        (required)
  description:     String
  fileUrl:         String        (required, e.g., "/uploads/file.pdf")
  fileName:        String        (original filename)
  fileSize:        Number        (bytes)
  fileType:        String        (enum: 'pdf', 'video', 'image', 'document', 'other')
  category:        String        (enum: 'notes', 'assignment', 'syllabus', 'question_paper', 'other')
  subject:         String        (required, e.g., "Data Structures")
  semester:        Number        (required, 1-12)
  topic:           String        (e.g., "Sorting Algorithms")
  tags:            [String]      (for search)
  uploadedBy:      ObjectId      (→ User, required)
  downloadCount:   Number        (default: 0)
  isApproved:      Boolean       (default: true, admin can set to false)
  createdAt:       Date          (auto)
  updatedAt:       Date          (auto)
}
```

### 3. Notification Collection

```javascript
{
  _id:             ObjectId      (auto-generated)
  title:           String        (required)
  message:         String        (required)
  type:            String        (enum: 'info', 'warning', 'success', 'alert')
  recipients:      [ObjectId]    (→ User, empty = broadcast)
  isBroadcast:     Boolean       (true = visible to all)
  createdBy:       ObjectId      (→ User, required, admin who created it)
  readBy:          [ObjectId]    (→ User, who read it)
  createdAt:       Date          (auto)
  updatedAt:       Date          (auto)
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ✘ |
| POST | `/login` | Login user | ✘ |
| POST | `/logout` | Logout user | ✓ |

### Resource Routes (`/api/resources`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all approved resources (searchable) | ✓ |
| POST | `/` | Upload new resource | ✓ Student |
| GET | `/:id` | Get resource details | ✓ |
| PUT | `/:id` | Update resource metadata | ✓ Owner/Admin |
| DELETE | `/:id` | Delete resource | ✓ Owner/Admin |
| GET | `/:id/download` | Download resource file | ✓ |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get current user profile | ✓ |
| PUT | `/profile` | Update user profile | ✓ |
| GET | `/notifications` | Get user notifications | ✓ |
| PUT | `/notifications/:id/read` | Mark notification as read | ✓ |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | ✓ Admin |
| GET | `/users/:id` | Get user details | ✓ Admin |
| DELETE | `/users/:id` | Delete user | ✓ Admin |
| GET | `/resources` | List all resources (including unapproved) | ✓ Admin |
| PUT | `/resources/:id/approve` | Approve/reject resource | ✓ Admin |
| POST | `/notifications` | Create & broadcast notification | ✓ Admin |
| GET | `/notifications` | List all notifications | ✓ Admin |
| DELETE | `/notifications/:id` | Delete notification | ✓ Admin |

---

## Middleware

### Authentication Middleware (`authMiddleware.js`)

- Verifies JWT token from cookies or Authorization header
- Sets `req.user` to the decoded user data
- Returns 401 Unauthorized if token is missing or invalid

### Role Middleware (`roleMiddleware.js`)

- Checks if user has required role (admin/student)
- Returns 403 Forbidden if user doesn't have permission

---

## File Upload

### Configuration

- **Location**: `backend/uploads/`
- **Max Size**: 100MB per file
- **Middleware**: Multer with diskStorage
- **Fields Accepted**: PDF, Video, Image, Document files

### Upload Flow

1. Frontend sends file + metadata via FormData
2. Multer validates file (size, type)
3. File saved to disk, path stored in database
4. Resource record created with file reference

---

## Authentication Flow

```
User Registration:
1. User enters email, password, name, course, semester
2. Frontend sends POST /api/auth/register
3. Backend hashes password (bcryptjs)
4. Creates User document
5. Returns success message

User Login:
1. User enters email, password
2. Frontend sends POST /api/auth/login
3. Backend finds user by email
4. Compares password with hash
5. If match, generates JWT token
6. Sets secure HTTP-only cookie with token
7. Returns user data (without password)

Authenticated Request:
1. Frontend sends request with Authorization header or cookie
2. authMiddleware verifies JWT token
3. If valid, sets req.user and calls next()
4. If invalid, returns 401 Unauthorized
```

---

## Search & Filtering

### Full-Text Search

MongoDB text indexes on `resources` collection:
- Fields indexed: title, subject, topic, tags
- Query: `GET /api/resources?search=algorithms`
- Returns resources matching the search term

### Filtering

Available filters:
- `subject`: Filter by subject name
- `semester`: Filter by semester (1-12)
- `category`: Filter by category (notes, assignment, etc.)
- `fileType`: Filter by file type (pdf, video, etc.)
- `page`: Pagination (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc)

Example query:
```
GET /api/resources?search=data&semester=3&category=notes&sortBy=downloadCount&order=desc
```

---

## Database Indexes

### Performance Indexes

| Collection | Field | Type | Purpose |
|-----------|-------|------|---------|
| users | email | unique | Prevent duplicate emails |
| users | role | index | Fast role queries |
| users | createdAt | descending | Recent users first |
| resources | title, subject, topic, tags | text | Full-text search |
| resources | semester | index | Filter by semester |
| resources | subject | index | Filter by subject |
| resources | category | index | Filter by category |
| resources | fileType | index | Filter by file type |
| resources | uploadedBy | index | Resources by user |
| resources | isApproved | index | Filter approved resources |
| resources | createdAt | descending | Recent resources first |
| notifications | isBroadcast | index | Broadcast filter |
| notifications | recipients | index | Find notifications for user |
| notifications | createdAt | descending | Recent notifications first |

Create indexes by running:
```bash
cd database
npm run index
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | No permission (role check failed) |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |

---

## Security Considerations

### Password Security
- Passwords hashed with bcryptjs (salt rounds: 12)
- Passwords never returned in API responses (`select: false`)
- Password comparison uses bcrypt's timing-safe comparison

### Authentication
- JWT tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- Tokens stored in HTTP-only cookies (not accessible via JavaScript)
- CSRF protection through same-site cookie policy

### File Upload Security
- File type validation (MIME type check)
- File size limit (100MB)
- Files stored outside root directory
- Original filename sanitized before storage

### CORS
- Configurable via `CLIENT_URL` environment variable
- Credentials allowed for cross-origin requests
- Only specified origin can make requests

### Database Security
- MongoDB URI in environment variables
- No hardcoded credentials
- Query injection prevention via Mongoose

---

## Environment Variables

### Required `.env` File (Backend)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/srms

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Production Considerations

- Change `JWT_SECRET` to a cryptographically secure random string
- Set `NODE_ENV=production`
- Use MongoDB Atlas (cloud) instead of local MongoDB
- Set appropriate `CLIENT_URL` to your production domain
- Use HTTPS instead of HTTP

---

## Development Workflow

### Adding a New Feature

1. **Database Schema**: Update/create model in `backend/models/`
2. **Routes**: Add endpoint in `backend/routes/`
3. **Controller**: Implement business logic in `backend/controllers/`
4. **Middleware**: Add auth/role checks if needed
5. **Frontend**: Create UI in `frontend/` and call API
6. **Testing**: Test with sample data

### Code Organization

```
One feature = One model + One controller + One route file

Example: Resources
├── backend/models/Resource.js       (database schema)
├── backend/controllers/resourceController.js  (logic)
├── backend/routes/resourceRoutes.js (endpoints)
├── backend/middleware/               (auth checks)
└── frontend/                         (UI components)
```

---

## Testing

### Manual Testing

1. Start backend: `npm run dev`
2. Open frontend: `http://localhost:3000`
3. Register new user or login with test credentials
4. Perform CRUD operations
5. Check browser console for errors
6. Check server terminal for logs

### Database Testing

```bash
cd database
npm run check      # Verify connection
npm run seed       # Populate sample data
npm run reset      # Wipe and reseed (dev only)
npm run index      # Create indexes
```

### API Testing

Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/):

1. Create new POST request to `http://localhost:5000/api/auth/login`
2. Set body to:
```json
{
  "email": "admin@srms.com",
  "password": "admin123"
}
```
3. Send and verify response includes JWT token
4. Use token in subsequent requests

---

## Performance Optimization

### Current Optimizations

1. **Database Indexes**: Optimized queries with proper indexes
2. **Pagination**: Resources paginated (10 per page by default)
3. **Select Fields**: Don't return sensitive data (passwords)
4. **Caching**: Consider adding Redis for frequently accessed resources
5. **Compression**: Express can compress responses
6. **CDN**: Serve static files from CDN in production

### Future Improvements

- Implement response caching
- Add database query optimization
- Use Redis for session management
- Implement rate limiting
- Add request validation schemas

---

## Troubleshooting Common Issues

### Issue: Can't connect to MongoDB

**Solution**: Make sure MongoDB is running
- Windows: `net start MongoDB`
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Issue: CORS error in frontend

**Solution**: Verify `CLIENT_URL` in backend `.env` matches your frontend URL

### Issue: File upload fails

**Solution**: 
- Check `backend/uploads/` folder exists
- Ensure file size < 100MB
- Verify disk space available

### Issue: Token expired

**Solution**: Login again to get a new token (expires every 7 days)

---

## Useful Commands

```bash
# Backend Development
cd backend
npm install          # Install dependencies
npm run dev          # Start with auto-reload (nodemon)
npm start            # Start normally

# Database Management
cd database
npm install          # Install dependencies
npm run check        # Test MongoDB connection
npm run index        # Create indexes
npm run seed         # Populate sample data
npm run reset        # Wipe and re-seed

# Project Initialization
npm run setup        # (if setup script exists)
```

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [JWT Tokens](https://jwt.io/)
- [REST API Design](https://restfulapi.net/)
- [Web Security](https://owasp.org/www-project-top-ten/)

---

## License & Credits

**SRMS** — Student Resource Management System  
Version: 1.0.0  
Created: 2026

---

**Last Updated**: April 25, 2026
