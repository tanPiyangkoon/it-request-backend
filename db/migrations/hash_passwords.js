#!/usr/bin/env node
/**
 * Hash existing plain text passwords
 * This script updates all users with plain text passwords to bcrypt hashed passwords
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool();

// Original passwords (these are the plain text passwords currently in DB)
const usersToUpdate = [
  { user_id: 'u001', password: 'user123' },
  { user_id: 'u002', password: 'user456' },
  { user_id: 'admin', password: 'admin123' }
];

async function hashPasswords() {
  const saltRounds = 10;
  let updated = 0;
  let errors = 0;

  console.log('🔐 Starting password hashing migration...\n');

  for (const user of usersToUpdate) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      // Update the user's password
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE user_id = $2',
        [hashedPassword, user.user_id]
      );

      if (result.rowCount > 0) {
        console.log(`✅ Updated password for user: ${user.user_id}`);
        updated++;
      } else {
        console.log(`⚠️  User not found: ${user.user_id}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${user.user_id}:`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${usersToUpdate.length}`);

  await pool.end();

  if (errors > 0) {
    console.log('\n⚠️  Some passwords could not be updated. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All passwords have been hashed successfully!');
    process.exit(0);
  }
}

// Run the migration
hashPasswords().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
