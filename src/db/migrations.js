const { pool } = require('./connection');

async function runMigrations() {
  try {
    // Add is_admin column to players
    await pool.query(`
      ALTER TABLE players 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    console.log('✓ Migration: Added is_admin column to players');

    // Add last_login to players
    await pool.query(`
      ALTER TABLE players 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✓ Migration: Added last_login to players');

    // Create deleted_players_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deleted_players_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255),
        email VARCHAR(255),
        personal_credit_score INT,
        deletion_reason VARCHAR(50),
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_by_admin_id UUID,
        deletion_notes TEXT,
        auto_purge_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migration: Created deleted_players_history table');

    // Create banned_players table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banned_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        reason VARCHAR(500),
        banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migration: Created banned_players table');

    // Create company_auctions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_auctions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL,
        company_name VARCHAR(255),
        original_owner_id UUID,
        starting_price DECIMAL(15, 2),
        current_price DECIMAL(15, 2),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migration: Created company_auctions table');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Tables already exist');
    } else {
      console.error('Migration error:', error.message);
    }
  }
}

module.exports = { runMigrations };
