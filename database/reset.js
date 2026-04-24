/**
 * reset.js — Drop all SRMS collections and re-seed fresh data
 * Usage: node database/reset.js
 *
 * ⚠  WARNING: This permanently deletes ALL data in the srms database.
 *    Use only in development. NEVER run against production.
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const path     = require('path');
const { execSync } = require('child_process');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srms';

async function reset() {
  console.log('\n⚠   SRMS Database Reset');
  console.log('─'.repeat(45));
  console.log('    This will DELETE all collections and re-seed.\n');

  // Simple confirmation via arg flag  --confirm
  if (!process.argv.includes('--confirm')) {
    console.log('🛑  Safety check: pass --confirm flag to proceed.');
    console.log('    Example: node database/reset.js --confirm\n');
    process.exit(0);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅  Connected to: ${MONGO_URI}\n`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📭  Database is already empty.\n');
    } else {
      console.log('🗑   Dropping collections...');
      for (const col of collections) {
        await db.dropCollection(col.name);
        console.log(`    ✔  Dropped: ${col.name}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n🌱  Running seed...\n');

    // Call seed.js in a child process
    execSync(`node ${path.join(__dirname, 'seed.js')}`, { stdio: 'inherit' });

  } catch (err) {
    console.error('\n❌  Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
