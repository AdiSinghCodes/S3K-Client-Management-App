import pool from '../config/db.js';

// Get all costs
export async function getAllCosts() {
  try {
    const result = await pool.query('SELECT * FROM costs ORDER BY month_year DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all costs:', error.message);
    throw error;
  }
}

// Get cost by ID
export async function getCostById(id) {
  try {
    const result = await pool.query('SELECT * FROM costs WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting cost by ID:', error.message);
    throw error;
  }
}

// Get costs by company
export async function getCostsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM costs WHERE company_id = $1 ORDER BY month_year DESC',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting costs by company:', error.message);
    throw error;
  }
}

// Get cost by month
export async function getCostByMonth(monthYear) {
  try {
    const result = await pool.query(
      'SELECT * FROM costs WHERE month_year = $1 ORDER BY company_id',
      [monthYear]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting cost by month:', error.message);
    throw error;
  }
}

// Create new cost record
export async function createCost(companyId, monthYear, revenue, travelCost, licenseCost, freelancerCost, fteCost, partTimeIndiaCost, partTimeUsCost) {
  try {
    // Calculate totals
    const totalCost = (travelCost || 0) + (licenseCost || 0) + (freelancerCost || 0) + (fteCost || 0) + (partTimeIndiaCost || 0) + (partTimeUsCost || 0);
    const grossMargin = (revenue || 0) - totalCost;
    const gmPercentage = revenue ? ((grossMargin / revenue) * 100).toFixed(2) : 0;

    const result = await pool.query(
      `INSERT INTO costs (company_id, month_year, revenue, travel_cost, license_cost, freelancer_cost, fte_cost, part_time_india_cost, part_time_us_cost, total_cost, gross_margin, gm_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [companyId, monthYear, revenue, travelCost, licenseCost, freelancerCost, fteCost, partTimeIndiaCost, partTimeUsCost, totalCost, grossMargin, gmPercentage]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating cost record:', error.message);
    throw error;
  }
}

// Update cost record
export async function updateCost(id, revenue, travelCost, licenseCost, freelancerCost, fteCost, partTimeIndiaCost, partTimeUsCost) {
  try {
    // Calculate totals
    const totalCost = (travelCost || 0) + (licenseCost || 0) + (freelancerCost || 0) + (fteCost || 0) + (partTimeIndiaCost || 0) + (partTimeUsCost || 0);
    const grossMargin = (revenue || 0) - totalCost;
    const gmPercentage = revenue ? ((grossMargin / revenue) * 100).toFixed(2) : 0;

    const result = await pool.query(
      `UPDATE costs SET revenue = $1, travel_cost = $2, license_cost = $3, freelancer_cost = $4, fte_cost = $5, part_time_india_cost = $6, part_time_us_cost = $7, total_cost = $8, gross_margin = $9, gm_percentage = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [revenue, travelCost, licenseCost, freelancerCost, fteCost, partTimeIndiaCost, partTimeUsCost, totalCost, grossMargin, gmPercentage, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating cost record:', error.message);
    throw error;
  }
}

// Delete cost record
export async function deleteCost(id) {
  try {
    const result = await pool.query('DELETE FROM costs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting cost record:', error.message);
    throw error;
  }
}

// Get costs for last N months
export async function getCostsLastNMonths(months = 6) {
  try {
    const result = await pool.query(
      `SELECT * FROM costs WHERE month_year >= CURRENT_DATE - INTERVAL '${months} months' ORDER BY month_year DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting last N months costs:', error.message);
    throw error;
  }
}

// Get total revenue and costs for a month
export async function getMonthlyTotals(monthYear) {
  try {
    const result = await pool.query(
      `SELECT 
        SUM(revenue) as total_revenue,
        SUM(total_cost) as total_costs,
        SUM(gross_margin) as total_margin,
        AVG(gm_percentage) as avg_gm_percentage
       FROM costs WHERE month_year = $1`,
      [monthYear]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting monthly totals:', error.message);
    throw error;
  }
}
