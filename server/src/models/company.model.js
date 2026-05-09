import pool from '../config/db.js';

// Get all companies
export async function getAllCompanies() {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY company_name');
    return result.rows;
  } catch (error) {
    console.error('Error getting all companies:', error.message);
    throw error;
  }
}

// Get company by ID
export async function getCompanyById(id) {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting company by ID:', error.message);
    throw error;
  }
}

// Create new company
export async function createCompany(companyName, industry, contractValue, startDate, status = 'active', userId = null, companyDetail = null) {
  try {
    const result = await pool.query(
      'INSERT INTO companies (company_name, industry, contract_value, start_date, status, user_id, company_detail) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [companyName, industry, contractValue, startDate, status, userId, companyDetail]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating company:', error.message);
    throw error;
  }
}

// Update company
export async function updateCompany(id, companyName, industry, contractValue, startDate, status) {
  try {
    const result = await pool.query(
      'UPDATE companies SET company_name = $1, industry = $2, contract_value = $3, start_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [companyName, industry, contractValue, startDate, status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating company:', error.message);
    throw error;
  }
}

// Delete company
export async function deleteCompany(id) {
  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting company:', error.message);
    throw error;
  }
}

// Get active companies
export async function getActiveCompanies() {
  try {
    const result = await pool.query(
      "SELECT * FROM companies WHERE status = 'active' ORDER BY company_name"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting active companies:', error.message);
    throw error;
  }
}

// Get companies by team member
export async function getCompaniesByTeamMember(userId) {
  try {
    const result = await pool.query(
      `SELECT c.* FROM companies c
       INNER JOIN company_team_members ctm ON c.id = ctm.company_id
       WHERE ctm.user_id = $1
       ORDER BY c.company_name`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting companies by team member:', error.message);
    throw error;
  }
}
