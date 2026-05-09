import pool from '../config/db.js';

// Get all productivity logs
export async function getAllProductivityLogs() {
  try {
    const result = await pool.query('SELECT * FROM productivity_logs ORDER BY month_year DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all productivity logs:', error.message);
    throw error;
  }
}

// Get productivity log by ID
export async function getProductivityLogById(id) {
  try {
    const result = await pool.query('SELECT * FROM productivity_logs WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting productivity log by ID:', error.message);
    throw error;
  }
}

// Get productivity log by user and month
export async function getProductivityLogByUserAndMonth(userId, monthYear) {
  try {
    const result = await pool.query(
      'SELECT * FROM productivity_logs WHERE user_id = $1 AND month_year = $2',
      [userId, monthYear]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting productivity log by user and month:', error.message);
    throw error;
  }
}

// Get all productivity logs for a user
export async function getProductivityLogsByUser(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM productivity_logs WHERE user_id = $1 ORDER BY month_year DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting productivity logs by user:', error.message);
    throw error;
  }
}

// Get all productivity logs for a company
export async function getProductivityLogsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM productivity_logs WHERE company_id = $1 ORDER BY month_year DESC',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting productivity logs by company:', error.message);
    throw error;
  }
}

// Create new productivity log
export async function createProductivityLog(userId, companyId, monthYear, tasksCompleted, tasksTarget, reportsSubmitted, reportsTarget, milestonesAchieved, useCasesUpdated, productivityScore, memberName) {
  try {
    const result = await pool.query(
      `INSERT INTO productivity_logs (user_id, company_id, month_year, tasks_completed, tasks_target, reports_submitted, reports_target, milestones_achieved, use_cases_updated, productivity_score, member_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [userId, companyId, monthYear, tasksCompleted, tasksTarget, reportsSubmitted, reportsTarget, milestonesAchieved, useCasesUpdated, productivityScore, memberName]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating productivity log:', error.message);
    throw error;
  }
}

// Update productivity log
export async function updateProductivityLog(id, tasksCompleted, tasksTarget, reportsSubmitted, reportsTarget, milestonesAchieved, useCasesUpdated, productivityScore) {
  try {
    const result = await pool.query(
      `UPDATE productivity_logs SET tasks_completed = $1, tasks_target = $2, reports_submitted = $3, reports_target = $4, milestones_achieved = $5, use_cases_updated = $6, productivity_score = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [tasksCompleted, tasksTarget, reportsSubmitted, reportsTarget, milestonesAchieved, useCasesUpdated, productivityScore, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating productivity log:', error.message);
    throw error;
  }
}

// Delete productivity log
export async function deleteProductivityLog(id) {
  try {
    const result = await pool.query('DELETE FROM productivity_logs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting productivity log:', error.message);
    throw error;
  }
}

// Get productivity logs for a month
export async function getProductivityLogsByMonth(monthYear) {
  try {
    const result = await pool.query(
      'SELECT * FROM productivity_logs WHERE month_year = $1 ORDER BY productivity_score DESC',
      [monthYear]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting productivity logs by month:', error.message);
    throw error;
  }
}

// Get top performers (highest scores)
export async function getTopPerformers(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT * FROM productivity_logs ORDER BY productivity_score DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting top performers:', error.message);
    throw error;
  }
}

// Get average productivity for a user
export async function getAverageProductivityForUser(userId) {
  try {
    const result = await pool.query(
      `SELECT 
        AVG(productivity_score) as avg_score,
        MAX(productivity_score) as max_score,
        MIN(productivity_score) as min_score,
        COUNT(*) as total_months
       FROM productivity_logs WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting average productivity:', error.message);
    throw error;
  }
}
