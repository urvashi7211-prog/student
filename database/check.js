/**
 * check.js — Verify MongoDB connection
 * Usage: node database/check.js
 *
 * Confirms that your local MongoDB instance is reachable
 * and lists existing collections in the 'srms' database.
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srms';

async function checkConnection() {
  console.log('\n🔍  Checking MongoDB connection...');
  console.log(`    URI: ${MONGO_URI}\n`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected successfully!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📭  No collections found. Database is empty.');
      console.log('    Run: node database/seed.js  — to populate sample data.\n');
    } else {
      console.log(`📦  Collections in "${db.databaseName}":`);
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`    ✔  ${col.name.padEnd(20)} (${count} documents)`);
      }
      console.log('');
    }

  } catch (err) {
    console.error('❌  Connection failed:', err.message);
    console.error('\n💡  Make sure MongoDB is running:');
    console.error('    Windows: net start MongoDB');
    console.error('    Or start MongoDB Compass / mongod.exe\n');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkConnection();
