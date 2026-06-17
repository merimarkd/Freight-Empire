const { pool } = require('./connection');

async function runMigrations() {
  try {
    // Add is_admin column to players
    await pool.query(`
      ALTER TABLE players 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✓ Migration: Added is_admin column to players');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ is_admin column already exists');
    } else {
      console.error('Migration error:', error.message);
    }
  }
}

module.exports = { runMigrations };
