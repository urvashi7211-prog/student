/**
 * indexes.js — Ensure MongoDB indexes exist for SRMS
 * Usage: node database/indexes.js
 *
 * Creates all necessary indexes for:
 *  • Performance (query speed)
 *  • Full-text search (resources)
 *  • Uniqueness enforcement (user emails)
 *
 * Safe to run multiple times — MongoDB skips existing indexes.
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srms';

async function createIndexes() {
  console.log('\n🔧  SRMS Index Setup');
  console.log('─'.repeat(45));
  console.log(`📡  Connecting to: ${MONGO_URI}\n`);

  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // ── users collection ──────────────────────
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    console.log('✔  users.email          → unique index');

    await users.createIndex({ role: 1 });
    console.log('✔  users.role           → index');

    await users.createIndex({ createdAt: -1 });
    console.log('✔  users.createdAt      → descending index');

    // ── resources collection ──────────────────
    const resources = db.collection('resources');

    // Full-text search index (title, subject, topic, tags)
    await resources.createIndex(
      { title: 'text', subject: 'text', topic: 'text', tags: 'text' },
      { name: 'resource_text_search' }
    );
    console.log('✔  resources (text)     → full-text search index');

    await resources.createIndex({ semester: 1 });
    console.log('✔  resources.semester   → index');

    await resources.createIndex({ subject: 1 });
    console.log('✔  resources.subject    → index');

    await resources.createIndex({ category: 1 });
    console.log('✔  resources.category   → index');

    await resources.createIndex({ fileType: 1 });
    console.log('✔  resources.fileType   → index');

    await resources.createIndex({ uploadedBy: 1 });
    console.log('✔  resources.uploadedBy → index');

    await resources.createIndex({ isApproved: 1 });
    console.log('✔  resources.isApproved → index');

    await resources.createIndex({ createdAt: -1 });
    console.log('✔  resources.createdAt  → descending index');

    // ── notifications collection ──────────────
    const notifications = db.collection('notifications');

    await notifications.createIndex({ isBroadcast: 1 });
    console.log('✔  notifications.isBroadcast → index');

    await notifications.createIndex({ recipients: 1 });
    console.log('✔  notifications.recipients  → index');

    await notifications.createIndex({ createdAt: -1 });
    console.log('✔  notifications.createdAt   → descending index');

    console.log('\n✅  All indexes created successfully!\n');

  } catch (err) {
    console.error('\n❌  Index creation failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected.\n');
  }
}

createIndexes();
