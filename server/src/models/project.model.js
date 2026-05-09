import pool from '../config/db.js';

// Get all projects
export async function getAllProjects() {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all projects:', error.message);
    throw error;
  }
}

// Get project by ID
export async function getProjectById(id) {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting project by ID:', error.message);
    throw error;
  }
}

// Get projects by company
export async function getProjectsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE company_id = $1 ORDER BY project_name',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting projects by company:', error.message);
    throw error;
  }
}

// Create new project
export async function createProject(companyId, projectName, completion = 0, phase = 'ideation', status = 'active') {
  try {
    const result = await pool.query(
      'INSERT INTO projects (company_id, project_name, completion, phase, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [companyId, projectName, completion, phase, status]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating project:', error.message);
    throw error;
  }
}

// Update project
export async function updateProject(id, projectName, completion, phase, status) {
  try {
    const result = await pool.query(
      'UPDATE projects SET project_name = $1, completion = $2, phase = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [projectName, completion, phase, status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating project:', error.message);
    throw error;
  }
}

// Delete project
export async function deleteProject(id) {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting project:', error.message);
    throw error;
  }
}

// Get projects by phase
export async function getProjectsByPhase(phase) {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE phase = $1 ORDER BY created_at DESC',
      [phase]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting projects by phase:', error.message);
    throw error;
  }
}
