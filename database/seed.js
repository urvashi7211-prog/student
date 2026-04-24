/**
 * seed.js — Populate the SRMS database with sample data
 * Usage:  node database/seed.js
 *
 * Creates:
 *   • 1 Admin account
 *   • 4 Student accounts
 *   • 12 Sample resources (notes, PDFs, videos, etc.)
 *   • 3 Broadcast notifications
 *
 * ⚠  Running this script twice will skip existing emails (no duplicates).
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Load models (re-use backend models directly) ──────────
const User         = require('../backend/models/User');
const Resource     = require('../backend/models/Resource');
const Notification = require('../backend/models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srms';

// ══════════════════════════════════════════════════════════
//  SEED DATA
// ══════════════════════════════════════════════════════════

const USERS = [
  {
    name:      'Admin User',
    email:     'admin@srms.com',
    password:  'admin123',
    role:      'admin',
    course:    'Administration',
    semester:  1,
    interests: ['Management', 'Education'],
  },
  {
    name:      'Urvashi Singh',
    email:     'urvashi@srms.com',
    password:  'student123',
    role:      'student',
    course:    'B.Tech CSE',
    semester:  5,
    interests: ['Web Development', 'AI', 'Data Structures'],
  },
  {
    name:      'Rahul Sharma',
    email:     'rahul@srms.com',
    password:  'student123',
    role:      'student',
    course:    'B.Tech CSE',
    semester:  3,
    interests: ['Operating Systems', 'Networking', 'C++'],
  },
  {
    name:      'Priya Mehta',
    email:     'priya@srms.com',
    password:  'student123',
    role:      'student',
    course:    'B.Tech IT',
    semester:  4,
    interests: ['DBMS', 'Python', 'Machine Learning'],
  },
  {
    name:      'Arjun Verma',
    email:     'arjun@srms.com',
    password:  'student123',
    role:      'student',
    course:    'B.Sc Computer Science',
    semester:  6,
    interests: ['Algorithms', 'Mathematics', 'Competitive Programming'],
  },
];

// Resources are created after users are seeded (uploadedBy reference needed)
function buildResources(adminId, studentIds) {
  const [s1, s2, s3, s4] = studentIds;

  return [
    // ── Semester 3 ──────────────────────────────
    {
      title:        'Data Structures Complete Notes – Unit 1 to 5',
      description:  'Comprehensive handwritten-style notes covering Arrays, Linked Lists, Stacks, Queues and Trees.',
      fileUrl:      '/uploads/sample-ds-notes.pdf',
      fileName:     'ds-notes-unit1-5.pdf',
      fileSize:     512000,
      fileType:     'pdf',
      category:     'notes',
      subject:      'Data Structures',
      semester:     3,
      topic:        'Arrays and Linked Lists',
      tags:         ['DSA', 'arrays', 'linked list', 'stacks', 'trees'],
      uploadedBy:   s2,
      downloadCount: 34,
      isApproved:   true,
    },
    {
      title:        'DBMS ER Diagram Practice Questions',
      description:  'Collection of ER diagram problems from previous university exams.',
      fileUrl:      '/uploads/sample-dbms-er.pdf',
      fileName:     'dbms-er-questions.pdf',
      fileSize:     204800,
      fileType:     'pdf',
      category:     'question_paper',
      subject:      'DBMS',
      semester:     4,
      topic:        'Entity Relationship Model',
      tags:         ['DBMS', 'ER diagram', 'exam'],
      uploadedBy:   s3,
      downloadCount: 21,
      isApproved:   true,
    },
    {
      title:        'Operating Systems – Process Scheduling Notes',
      description:  'Notes on CPU scheduling algorithms: FCFS, SJF, Round Robin, Priority.',
      fileUrl:      '/uploads/sample-os-scheduling.pdf',
      fileName:     'os-scheduling.pdf',
      fileSize:     307200,
      fileType:     'pdf',
      category:     'notes',
      subject:      'Operating Systems',
      semester:     5,
      topic:        'CPU Scheduling',
      tags:         ['OS', 'scheduling', 'FCFS', 'round robin'],
      uploadedBy:   s1,
      downloadCount: 15,
      isApproved:   true,
    },
    // ── Semester 4 ──────────────────────────────
    {
      title:        'Computer Networks – OSI Model Explained',
      description:  'Detailed explanation of the 7-layer OSI model with diagrams and examples.',
      fileUrl:      '/uploads/sample-networks-osi.pdf',
      fileName:     'networks-osi-model.pdf',
      fileSize:     409600,
      fileType:     'pdf',
      category:     'notes',
      subject:      'Computer Networks',
      semester:     4,
      topic:        'OSI Model',
      tags:         ['networks', 'OSI', 'TCP/IP', 'layers'],
      uploadedBy:   s2,
      downloadCount: 28,
      isApproved:   true,
    },
    {
      title:        'Mathematics III – Laplace Transform Notes',
      description:  'Step-by-step solved problems on Laplace and Inverse Laplace transforms.',
      fileUrl:      '/uploads/sample-maths-laplace.pdf',
      fileName:     'maths3-laplace.pdf',
      fileSize:     256000,
      fileType:     'pdf',
      category:     'notes',
      subject:      'Mathematics',
      semester:     3,
      topic:        'Laplace Transform',
      tags:         ['maths', 'laplace', 'transform', 'engineering maths'],
      uploadedBy:   s4,
      downloadCount: 19,
      isApproved:   true,
    },
    // ── Video Resources ─────────────────────────
    {
      title:        'Sorting Algorithms Visualized – Bubble, Merge, Quick',
      description:  'A recorded lecture demonstrating sorting algorithms step-by-step with visualizations.',
      fileUrl:      '/uploads/sample-sorting-video.mp4',
      fileName:     'sorting-algorithms.mp4',
      fileSize:     52428800,
      fileType:     'video',
      category:     'notes',
      subject:      'Data Structures',
      semester:     3,
      topic:        'Sorting Algorithms',
      tags:         ['sorting', 'bubble sort', 'merge sort', 'quick sort', 'video'],
      uploadedBy:   s1,
      downloadCount: 42,
      isApproved:   true,
    },
    {
      title:        'SQL Joins Tutorial – Inner, Left, Right, Full',
      description:  'Video walkthrough of all SQL JOIN types with real database examples.',
      fileUrl:      '/uploads/sample-sql-joins.mp4',
      fileName:     'sql-joins.mp4',
      fileSize:     31457280,
      fileType:     'video',
      category:     'notes',
      subject:      'DBMS',
      semester:     4,
      topic:        'SQL Joins',
      tags:         ['SQL', 'joins', 'database', 'video', 'query'],
      uploadedBy:   s3,
      downloadCount: 31,
      isApproved:   true,
    },
    // ── Syllabus ────────────────────────────────
    {
      title:        'B.Tech CSE Semester 5 – Official Syllabus',
      description:  'Complete official syllabus for all subjects in 5th semester B.Tech CSE.',
      fileUrl:      '/uploads/sample-syllabus-sem5.pdf',
      fileName:     'syllabus-cse-sem5.pdf',
      fileSize:     102400,
      fileType:     'pdf',
      category:     'syllabus',
      subject:      'General',
      semester:     5,
      topic:        '',
      tags:         ['syllabus', 'CSE', 'sem 5', 'official'],
      uploadedBy:   adminId,
      downloadCount: 60,
      isApproved:   true,
    },
    {
      title:        'B.Tech CSE Semester 3 – Official Syllabus',
      description:  'Official syllabus document for all 3rd semester subjects.',
      fileUrl:      '/uploads/sample-syllabus-sem3.pdf',
      fileName:     'syllabus-cse-sem3.pdf',
      fileSize:     98304,
      fileType:     'pdf',
      category:     'syllabus',
      subject:      'General',
      semester:     3,
      topic:        '',
      tags:         ['syllabus', 'CSE', 'sem 3', 'official'],
      uploadedBy:   adminId,
      downloadCount: 55,
      isApproved:   true,
    },
    // ── Question Papers ─────────────────────────
    {
      title:        'Data Structures Previous Year Paper 2023',
      description:  'University exam question paper for Data Structures, December 2023.',
      fileUrl:      '/uploads/sample-ds-paper-2023.pdf',
      fileName:     'ds-paper-2023.pdf',
      fileSize:     153600,
      fileType:     'pdf',
      category:     'question_paper',
      subject:      'Data Structures',
      semester:     3,
      topic:        'End Semester Exam',
      tags:         ['question paper', 'exam', '2023', 'DSA'],
      uploadedBy:   s4,
      downloadCount: 75,
      isApproved:   true,
    },
    {
      title:        'Operating Systems Mid Semester Paper 2024',
      description:  'OS mid-semester examination paper covering Unit 1 and Unit 2.',
      fileUrl:      '/uploads/sample-os-midsem-2024.pdf',
      fileName:     'os-midsem-2024.pdf',
      fileSize:     122880,
      fileType:     'pdf',
      category:     'question_paper',
      subject:      'Operating Systems',
      semester:     5,
      topic:        'Mid Semester',
      tags:         ['OS', 'mid sem', 'question paper', '2024'],
      uploadedBy:   s2,
      downloadCount: 48,
      isApproved:   true,
    },
    // ── Assignment ──────────────────────────────
    {
      title:        'Software Engineering – Assignment 2: UML Diagrams',
      description:  'Assignment on Use Case, Class and Sequence diagrams for a library management system.',
      fileUrl:      '/uploads/sample-se-assignment2.pdf',
      fileName:     'se-assignment2-uml.pdf',
      fileSize:     204800,
      fileType:     'pdf',
      category:     'assignment',
      subject:      'Software Engineering',
      semester:     6,
      topic:        'UML Diagrams',
      tags:         ['software engineering', 'UML', 'use case', 'class diagram'],
      uploadedBy:   s4,
      downloadCount: 12,
      isApproved:   true,
    },
  ];
}

function buildNotifications(adminId) {
  return [
    {
      title:       'Welcome to SRMS! 🎉',
      message:     'Welcome to the Student Resource Management System. Browse, upload, and share study materials with your peers. Happy learning!',
      type:        'success',
      isBroadcast: true,
      createdBy:   adminId,
    },
    {
      title:       '📅 End Semester Exam Schedule Released',
      message:     'The end semester examination timetable for all courses has been uploaded under the Syllabus category. Please check the Resources section.',
      type:        'info',
      isBroadcast: true,
      createdBy:   adminId,
    },
    {
      title:       '⚠ Upload Guidelines Reminder',
      message:     'Please ensure all uploaded files are relevant study materials only. Irrelevant files will be removed. Maximum file size is 100MB.',
      type:        'warning',
      isBroadcast: true,
      createdBy:   adminId,
    },
  ];
}

// ══════════════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ══════════════════════════════════════════════════════════
async function seed() {
  console.log('\n🌱  SRMS Database Seeder');
  console.log('─'.repeat(45));
  console.log(`📡  Connecting to: ${MONGO_URI}\n`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connected.\n');

    // ── 1. Seed Users ──────────────────────────
    console.log('👤  Seeding users...');
    const createdUsers = [];

    for (const userData of USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`    ⏭  Skipped (already exists): ${userData.email}`);
        createdUsers.push(exists);
        continue;
      }
      // Password will be hashed by the pre-save hook in User model
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`    ✔  Created [${user.role.padEnd(7)}] ${user.name} <${user.email}>`);
    }

    const adminUser   = createdUsers[0];                 // first entry = admin
    const studentUsers = createdUsers.slice(1);          // rest = students

    // ── 2. Seed Resources ──────────────────────
    console.log('\n📚  Seeding resources...');
    const existingCount = await Resource.countDocuments();

    if (existingCount > 0) {
      console.log(`    ⏭  Skipped — ${existingCount} resources already exist.`);
      console.log('       (Run reset.js first to re-seed resources.)\n');
    } else {
      const resources = buildResources(adminUser._id, studentUsers.map(s => s._id));
      for (const res of resources) {
        await Resource.create(res);
        console.log(`    ✔  "${res.title.substring(0, 55)}..."`);
      }
    }

    // ── 3. Seed Notifications ──────────────────
    console.log('\n🔔  Seeding notifications...');
    const existingNotifs = await Notification.countDocuments();

    if (existingNotifs > 0) {
      console.log(`    ⏭  Skipped — ${existingNotifs} notifications already exist.`);
    } else {
      const notifs = buildNotifications(adminUser._id);
      for (const n of notifs) {
        await Notification.create(n);
        console.log(`    ✔  "${n.title}"`);
      }
    }

    // ── Summary ────────────────────────────────
    const [uCount, rCount, nCount] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Notification.countDocuments(),
    ]);

    console.log('\n' + '─'.repeat(45));
    console.log('🎉  Seeding complete!\n');
    console.log(`    Users          : ${uCount}`);
    console.log(`    Resources      : ${rCount}`);
    console.log(`    Notifications  : ${nCount}`);
    console.log('\n📋  Test Credentials:');
    console.log('    Admin   — admin@srms.com   / admin123');
    console.log('    Student — urvashi@srms.com / student123');
    console.log('─'.repeat(45) + '\n');

  } catch (err) {
    console.error('\n❌  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected.\n');
  }
}

seed();
