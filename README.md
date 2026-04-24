# 🎓 SRMS - Student Resource Management System

A comprehensive web application for students and teachers to manage, share, and organize educational resources efficiently.

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based login with role-based access control
- 📚 **Resource Management**: Upload and organize study materials (PDFs, videos, documents)
- 🔍 **Smart Search**: Full-text search across resources by title, subject, and tags
- 👤 **User Profiles**: Manage personal information and track interests
- 📊 **Admin Dashboard**: Approve resources, manage users, and send notifications
- 📬 **Notifications**: Broadcast announcements to students or specific groups
- 💾 **Persistent Storage**: MongoDB for reliable data persistence
- 📱 **Responsive Design**: Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS) - [Download](https://nodejs.org)
- MongoDB - [Download](https://www.mongodb.com/try/download/community)
- Git (optional)

### One-Click Setup

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

Or follow the [detailed setup guide](SETUP_GUIDE.md).

### Manual Setup

```bash
# Install dependencies
cd database && npm install
cd ../backend && npm install

# Setup database
cd ../database
npm run check      # Verify MongoDB connection
npm run index      # Create indexes
npm run seed       # Populate sample data

# Start backend
cd ../backend
npm run dev        # Development mode with auto-reload

# Start frontend (new terminal)
cd frontend
npx http-server -p 3000
```

## 📋 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@srms.com | admin123 |
| Student | urvashi@srms.com | student123 |

## 📁 Project Structure

```
s1/
├── backend/                 # Express API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & validation
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── uploads/            # Uploaded files storage
│   ├── utils/              # Helper functions
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   └── package.json
│
├── database/               # Database utilities
│   ├── schema.js           # Data structure reference
│   ├── seed.js             # Sample data generator
│   ├── reset.js            # Database reset script
│   ├── indexes.js          # Performance indexes
│   ├── check.js            # Connection test
│   ├── README.md           # Database guide
│   └── package.json
│
├── frontend/               # Client-side application
│   ├── index.html          # Homepage
│   ├── dashboard.html      # Student dashboard
│   ├── resources.html      # Resource browser
│   ├── upload.html         # File upload
│   ├── admin.html          # Admin panel
│   ├── profile.html        # User profile
│   ├── css/                # Stylesheets
│   └── js/                 # JavaScript files
│
├── SETUP_GUIDE.md          # Detailed setup instructions
├── PROJECT_DOCUMENTATION.md # Technical documentation
├── setup.bat               # Windows setup script
├── setup.sh                # Linux/Mac setup script
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Resources
- `GET /api/resources` - List resources (searchable, filterable)
- `POST /api/resources` - Upload resource
- `GET /api/resources/:id` - Get resource details
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/resources/:id/download` - Download file

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/notifications` - Get notifications
- `PUT /api/users/notifications/:id/read` - Mark as read

### Admin
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/resources` - List all resources
- `PUT /api/admin/resources/:id/approve` - Approve resource
- `POST /api/admin/notifications` - Create notification
- `GET /api/admin/notifications` - List notifications

Full API documentation available in [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## 🛠 Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Fetch API for backend communication

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads

**Database:**
- MongoDB (local or Atlas cloud)

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
- [Project Documentation](PROJECT_DOCUMENTATION.md) - Architecture, models, API details
- [Database README](database/README.md) - Database utilities guide

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
Change `PORT` in `backend/.env` or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Seeding Gives "Already Exists" Error
This is normal if run multiple times. To re-seed completely:
```bash
cd database
npm run reset
```

For more troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting).

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ HTTP-only secure cookies
- ✅ Role-based access control (RBAC)
- ✅ File upload validation
- ✅ CORS protection
- ✅ SQL injection prevention via Mongoose

## 📈 Database Optimization

- Indexed queries for fast searches
- Full-text search on resources
- Pagination for large datasets
- Proper schema design with relationships

## 🚀 Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas (cloud) or managed MongoDB
4. Configure `CLIENT_URL` to your domain
5. Enable HTTPS
6. Set up error logging and monitoring
7. Use process manager (PM2) for Node.js
8. Set up automated backups

See [SETUP_GUIDE.md](SETUP_GUIDE.md#deployment-checklist) for full checklist.

## 📊 Sample Data

The seeding script creates:
- **5 Users**: 1 admin + 4 students with different courses/semesters
- **12 Resources**: Notes, videos, syllabi, question papers, assignments
- **3 Notifications**: Welcome, exam schedule, upload guidelines

Run `npm run seed` in the database folder to populate.

## 🎯 Common Tasks

### Add New Resource Category

1. Update `Resource.js` model enum
2. Update `resourceController.js` if needed
3. Update frontend UI
4. Re-seed database if using sample data

### Add New User Role

1. Update `User.js` model enum
2. Create role middleware
3. Update routes with role checks
4. Update frontend based on roles

### Create New Admin Feature

1. Create controller in `backend/controllers/`
2. Add routes in `backend/routes/adminRoutes.js`
3. Add roleMiddleware check for admin
4. Create frontend UI in `frontend/admin.html`

## 📞 Support & Help

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Review [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for technical details
3. Check error messages in browser console and server terminal
4. Verify MongoDB is running and accessible
5. Ensure `.env` is correctly configured

## 📝 License

This project is provided as-is for educational purposes.

## 🙏 Acknowledgments

Built as a comprehensive student resource management system with modern web technologies.

---

**Version**: 1.0.0  
**Last Updated**: April 25, 2026  
**Status**: ✅ Complete & Ready to Use

**Happy Learning! 🎓**
