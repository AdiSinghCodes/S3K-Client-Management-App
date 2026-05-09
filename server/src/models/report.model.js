import pool from '../config/db.js';

// Get all weekly reports
export async function getAllReports() {
  try {
    const result = await pool.query('SELECT * FROM weekly_reports ORDER BY week_start_date DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all reports:', error.message);
    throw error;
  }
}

// Get report by ID
export async function getReportById(id) {
  try {
    const result = await pool.query('SELECT * FROM weekly_reports WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting report by ID:', error.message);
    throw error;
  }
}

// Get reports by company
export async function getReportsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM weekly_reports WHERE company_id = $1 ORDER BY week_start_date DESC',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting reports by company:', error.message);
    throw error;
  }
}

// Get reports by user
export async function getReportsByUser(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM weekly_reports WHERE user_id = $1 ORDER BY week_start_date DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting reports by user:', error.message);
    throw error;
  }
}

// Create new report
export async function createReport(companyId, userId, weekStartDate, subject, body, achievements, challenges, blockers, nextWeekPlan, clientFeedback, assistanceNeeded, status = 'submitted', sentBy = null) {
  try {
    const result = await pool.query(
      `INSERT INTO weekly_reports (company_id, user_id, week_start_date, subject, body, achievements, challenges, blockers, next_week_plan, client_feedback, assistance_needed, status, sent_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [companyId, userId, weekStartDate, subject, body, achievements, challenges, blockers, nextWeekPlan, clientFeedback, assistanceNeeded, status, sentBy]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating report:', error.message);
    throw error;
  }
}

// Update report
export async function updateReport(id, updateData) {
  try {
    const { subject, body, achievements, challenges, blockers, nextWeekPlan, clientFeedback, assistanceNeeded, status } = updateData;
    
    const result = await pool.query(
      `UPDATE weekly_reports SET 
        subject = COALESCE($1, subject),
        body = COALESCE($2, body),
        achievements = COALESCE($3, achievements),
        challenges = COALESCE($4, challenges),
        blockers = COALESCE($5, blockers),
        next_week_plan = COALESCE($6, next_week_plan),
        client_feedback = COALESCE($7, client_feedback),
        assistance_needed = COALESCE($8, assistance_needed),
        status = COALESCE($9, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [subject, body, achievements, challenges, blockers, nextWeekPlan, clientFeedback, assistanceNeeded, status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating report:', error.message);
    throw error;
  }
}

// Delete report
export async function deleteReport(id) {
  try {
    const result = await pool.query('DELETE FROM weekly_reports WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting report:', error.message);
    throw error;
  }
}

// Get draft reports
export async function getDraftReports() {
  try {
    const result = await pool.query(
      "SELECT * FROM weekly_reports WHERE status = 'draft' ORDER BY week_start_date DESC"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting draft reports:', error.message);
    throw error;
  }
}

// Get sent reports
export async function getSentReports() {
  try {
    const result = await pool.query(
      "SELECT * FROM weekly_reports WHERE status = 'sent' ORDER BY week_start_date DESC"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting sent reports:', error.message);
    throw error;
  }
}
