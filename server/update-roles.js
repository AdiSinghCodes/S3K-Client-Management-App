import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  password: 'sarita1602',
  host: 'localhost',
  port: 5432,
  database: 's3k_db'
});

async function updateRoles() {
  try {
    console.log('🔄 Updating database roles...');
    const result = await pool.query("UPDATE users SET role = 'senior_management' WHERE role = 'founder'");
    console.log('✅ Successfully updated', result.rowCount, 'rows');
    console.log('✅ All founder roles changed to senior_management');
    
    // Show updated users
    const users = await pool.query("SELECT id, name, email, role FROM users");
    console.log('\n📋 Current users in database:');
    users.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.role}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateRoles();
