import pool from '../config/db.js';

// Get all use cases
export async function getAllUseCases() {
  try {
    const result = await pool.query(`
      SELECT uc.*, u.name as assigned_name 
      FROM use_cases uc 
      LEFT JOIN users u ON uc.assigned_to = u.id 
      ORDER BY uc.created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting all use cases:', error.message);
    throw error;
  }
}

// Get use case by ID
export async function getUseCaseById(id) {
  try {
    const result = await pool.query(`
      SELECT uc.*, u.name as assigned_name 
      FROM use_cases uc 
      LEFT JOIN users u ON uc.assigned_to = u.id 
      WHERE uc.id = $1
    `, [id])
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting use case by ID:', error.message);
    throw error;
  }
}

// Get use cases by project
export async function getUseCasesByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM use_cases WHERE project_id = $1 ORDER BY use_case_name',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting use cases by project:', error.message);
    throw error;
  }
}

// Get use cases by user (team member's own use cases)
export async function getUseCasesByUser(userId) {
  try {
    const result = await pool.query(`
      SELECT uc.*, u.name as assigned_name 
      FROM use_cases uc 
      LEFT JOIN users u ON uc.assigned_to = u.id 
      WHERE uc.user_id = $1 OR uc.assigned_to = $1 
      ORDER BY uc.use_case_name
    `, [userId])
    return result.rows;
  } catch (error) {
    console.error('Error getting use cases by user:', error.message);
    throw error;
  }
}

// Create new use case
export async function createUseCase(projectId, userId, useCaseName, goLiveDate = null, startDate = null, expectedEndDate = null, phaseIdeation = false, phaseDesign = false, phaseDevelopment = false, phaseUat = false, phaseLive = false, assignedTo = null, progress = 0) {
  try {
    const result = await pool.query(
      `INSERT INTO use_cases (project_id, user_id, use_case_name, go_live_date, start_date, expected_end_date, phase_ideation, phase_design, phase_development, phase_uat, phase_live, assigned_to, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [projectId, userId, useCaseName, goLiveDate, startDate, expectedEndDate, phaseIdeation, phaseDesign, phaseDevelopment, phaseUat, phaseLive, assignedTo, progress]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating use case:', error.message);
    throw error;
  }
}

// Update use case
export async function updateUseCase(id, updateData) {
  try {
    const { use_case_name, go_live_date, start_date, expected_end_date, phase_ideation, phase_design, phase_development, phase_uat, phase_live, assigned_to, progress } = updateData;
    
    // Update the record
    await pool.query(
      `UPDATE use_cases SET use_case_name = COALESCE($1, use_case_name), 
                           go_live_date = COALESCE($2, go_live_date),
                           start_date = COALESCE($3, start_date),
                           expected_end_date = COALESCE($4, expected_end_date),
                           phase_ideation = COALESCE($5, phase_ideation),
                           phase_design = COALESCE($6, phase_design),
                           phase_development = COALESCE($7, phase_development),
                           phase_uat = COALESCE($8, phase_uat),
                           phase_live = COALESCE($9, phase_live),
                           assigned_to = COALESCE($10, assigned_to),
                           progress = COALESCE($11, progress),
                           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12`,
      [use_case_name, go_live_date, start_date, expected_end_date, phase_ideation, phase_design, phase_development, phase_uat, phase_live, assigned_to, progress, id]
    );
    
    // Return the updated record with assigned_name via LEFT JOIN
    const result = await pool.query(`
      SELECT uc.*, u.name as assigned_name 
      FROM use_cases uc 
      LEFT JOIN users u ON uc.assigned_to = u.id 
      WHERE uc.id = $1
    `, [id]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating use case:', error.message);
    throw error;
  }
}

// Delete use case
export async function deleteUseCase(id) {
  try {
    const result = await pool.query('DELETE FROM use_cases WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting use case:', error.message);
    throw error;
  }
}

// Get use cases in live phase
export async function getLiveUseCases() {
  try {
    const result = await pool.query(
      'SELECT * FROM use_cases WHERE phase_live = true ORDER BY go_live_date DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting live use cases:', error.message);
    throw error;
  }
}
