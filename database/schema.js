/**
 * schema.js — SRMS Schema Reference (read-only documentation)
 * 
 * This file documents the exact shape of every collection in
 * the local MongoDB database 'srms'.
 *
 * Collections:
 *  1. users
 *  2. resources
 *  3. notifications
 *
 * All _id fields are MongoDB ObjectId (auto-generated).
 * All dates are ISO 8601 UTC strings.
 */

// ══════════════════════════════════════════════════════════
//  1.  USERS  (collection: users)
// ══════════════════════════════════════════════════════════
const UserSchema = {
  _id:            'ObjectId',
  name:           'String  — required',
  email:          'String  — required, unique, lowercase',
  password:       'String  — bcrypt hashed, select:false (never returned)',
  role:           "String  — enum: ['student', 'admin'], default: 'student'",
  course:         'String  — e.g. "B.Tech CSE"',
  semester:       'Number  — 1–12, default: 1',
  interests:      '[String] — e.g. ["AI", "Web Dev"]',
  profilePicture: 'String  — URL/path, default: ""',
  notifications: [
    {
      message:   'String',
      isRead:    'Boolean — default: false',
      createdAt: 'Date    — default: now',
    },
  ],
  createdAt:      'Date  — auto (timestamps)',
  updatedAt:      'Date  — auto (timestamps)',
};

// ══════════════════════════════════════════════════════════
//  2.  RESOURCES  (collection: resources)
// ══════════════════════════════════════════════════════════
const ResourceSchema = {
  _id:           'ObjectId',
  title:         'String  — required',
  description:   'String  — default: ""',
  fileUrl:       'String  — required, e.g. "/uploads/filename.pdf"',
  fileName:      'String  — required, original file name',
  fileSize:      'Number  — bytes, default: 0',
  fileType:      "String  — enum: ['pdf','video','image','document','other']",
  category:      "String  — enum: ['notes','assignment','syllabus','question_paper','other']",
  subject:       'String  — required, e.g. "Data Structures"',
  semester:      'Number  — required, 1–12',
  topic:         'String  — e.g. "Sorting Algorithms"',
  tags:          '[String] — for full-text search',
  uploadedBy:    'ObjectId → ref: User (required)',
  downloadCount: 'Number  — default: 0',
  isApproved:    'Boolean — default: true',
  createdAt:     'Date    — auto (timestamps)',
  updatedAt:     'Date    — auto (timestamps)',

  // Indexes:
  _indexes: [
    'text index on: title, subject, topic, tags',
    'semester, subject, category, fileType, uploadedBy, isApproved, createdAt',
  ],
};

// ══════════════════════════════════════════════════════════
//  3.  NOTIFICATIONS  (collection: notifications)
// ══════════════════════════════════════════════════════════
const NotificationSchema = {
  _id:         'ObjectId',
  title:       'String  — required',
  message:     'String  — required',
  type:        "String  — enum: ['info','warning','success','alert'], default: 'info'",
  recipients:  '[ObjectId] → ref: User — [] means no specific target',
  isBroadcast: 'Boolean — true = visible to all users',
  createdBy:   'ObjectId → ref: User (required, the admin who sent it)',
  readBy:      '[ObjectId] → ref: User — list of users who have read it',
  createdAt:   'Date    — auto (timestamps)',
  updatedAt:   'Date    — auto (timestamps)',

  // Indexes:
  _indexes: [
    'isBroadcast, recipients, createdAt',
  ],
};

// ── Relationships Summary ─────────────────────────────────
//
//  User  ──< Resource      (User.uploadedBy → User._id)
//  User  ──< Notification  (Notification.createdBy → User._id)
//  User ──<> Notification  (Notification.recipients, Notification.readBy → User._id[])
//
// ──────────────────────────────────────────────────────────

module.exports = { UserSchema, ResourceSchema, NotificationSchema };
