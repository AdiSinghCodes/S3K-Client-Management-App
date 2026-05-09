import pool from '../config/db.js';

// Get all users
export async function getAllUsers() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error.message);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error.message);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error.message);
    throw error;
  }
}

// Create new user
export async function createUser(name, email, passwordHash, role = 'team') {
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, passwordHash, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

// Update user
export async function updateUser(id, name, email, role) {
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, email, role, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
}

// Delete user
export async function deleteUser(id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
}

// Get all team members (non-founders)
export async function getAllTeamMembers() {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE role = 'team' ORDER BY name"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting team members:', error.message);
    throw error;
  }
}

// Get all founders
export async function getAllFounders() {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE role = 'founder' OR role = 'admin' ORDER BY name"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting founders:', error.message);
    throw error;
  }
}
