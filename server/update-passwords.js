import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  user: 'postgres',
  password: 'sarita1602',
  host: 'localhost',
  port: 5432,
  database: 's3k_db'
})

const hash = '$2b$10$gPJU34W.2TkK7DDT1O7nzuRh0VkWHjuwG5EbtSdy906XOzCnhL.Qm'

async function updatePasswords() {
  try {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email IN ('john@example.com', 'sarah@example.com')",
      [hash]
    )
    console.log(`Updated ${result.rowCount} users`)
    
    const check = await pool.query("SELECT id, email, password_hash FROM users WHERE role = 'team_member'")
    console.log('Updated passwords:')
    check.rows.forEach(row => {
      console.log(`${row.email}: ${row.password_hash}`)
    })
    
    await pool.end()
  } catch (err) {
    console.error(err)
  }
}

updatePasswords()
